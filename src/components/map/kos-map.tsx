"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { ACCENT_HEX, accentForScore } from "@/components/ui/accent";
import { INDONESIA, type Accent, type Kos } from "@/data/kos";
import { formatRupiah } from "@/lib/format";
import type { Place } from "@/lib/geocode";
import type { KosFilter } from "@/lib/kos-browse";
import { toKos, type NewKosInput, type SaveResult } from "@/lib/kos-repository";
import { mergeKos, useKosStore } from "@/store/kos-store";
import { AddKosDialog } from "./add-kos-dialog";
import { MapSearch } from "./map-search";

/**
 * Score pins are drawn as divIcons so they match the circular badges used
 * everywhere else — this also sidesteps Leaflet's broken default marker asset.
 */
function scoreIcon(score: number, accent: Accent, isNew: boolean) {
  const dark = accent === "amber" || accent === "sky";
  const label = isNew ? "Baru" : score.toFixed(1);
  return L.divIcon({
    className: "",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:46px;height:46px;border-radius:9999px;
      background:${isNew ? "#1c2a4e" : ACCENT_HEX[accent]};
      color:${!isNew && dark ? "#1c2a4e" : "#ffffff"};
      font-weight:800;font-size:${isNew ? 12 : 15}px;
      box-shadow:0 8px 20px -6px rgba(28,42,78,.55);
    ">${label}</span>`,
  });
}

const draftIcon = L.divIcon({
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  html: `<span style="
    display:flex;align-items:center;justify-content:center;
    width:34px;height:34px;border-radius:9999px;
    background:#f93a5a;color:#fff;font-weight:800;font-size:20px;line-height:1;
    box-shadow:0 8px 20px -6px rgba(28,42,78,.55);
  ">+</span>`,
});

/** A searched street or landmark — deliberately unlike a score pin; it is a location, not a kos. */
const placeIcon = L.divIcon({
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  html: `<span style="
    display:block;width:26px;height:26px;border-radius:9999px;
    background:#3b59df;border:5px solid #ffffff;
    box-shadow:0 8px 20px -6px rgba(28,42,78,.55);
  "></span>`,
});

/**
 * Breathing room around a fitted view, in pixels.
 *
 * Proportional, not fixed: 56px either side is fine on a desktop but eats over
 * half the width of a phone-sized map, which pushes the fit several zoom
 * levels too far out.
 */
function fitPadding(map: L.Map): [number, number] {
  const { clientWidth: w, clientHeight: h } = map.getContainer();
  const pad = Math.round(Math.min(56, w * 0.08, h * 0.08));
  return [pad, pad];
}

/**
 * Height of the search-and-hint column over the map's top edge, in pixels.
 * It covers pins at every width — full-width on a phone, a 320px corner box
 * wider up, which still hid a pin at tablet width — so the fit always leaves
 * room for it. Kept in step with the column's markup below.
 */
const OVERLAY_INSET = 96;

/**
 * kkost spans the whole country, so there is no sensible fixed centre. Fit the
 * view to whatever kos actually exist — data in one city zooms to that city,
 * and the view widens on its own once other cities appear.
 *
 * The fit has to survive the container being sized late — a ResizeObserver
 * re-fits as the real width arrives — and the padding scales with the
 * container, because a fixed inset is most of the width on a phone.
 *
 * It stops as soon as the user touches the map, so it never fights their own
 * panning and zooming — and `active` switches it off for good once a place
 * search has chosen the view, which a late ResizeObserver fit would otherwise
 * yank back to the kos.
 */
function FitToKos({
  points,
  active,
}: {
  points: [number, number][];
  active: boolean;
}) {
  const map = useMap();
  const signature = points.map((p) => p.join()).join("|");

  useEffect(() => {
    if (!active || !points.length) return;

    const container = map.getContainer();
    let userMoved = false;
    const markMoved = () => {
      userMoved = true;
    };

    const fit = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (userMoved || !w || !h) return;

      map.invalidateSize({ animate: false });
      const [padX, padY] = fitPadding(map);
      map.fitBounds(L.latLngBounds(points), {
        // The search box and hint cover the top of the map; no pin may be
        // fitted underneath them.
        paddingTopLeft: [padX, padY + OVERLAY_INSET],
        paddingBottomRight: [padX, padY],
        maxZoom: 15,
        animate: false,
      });
    };

    // pointerdown/wheel only ever come from the user — unlike Leaflet's own
    // zoomstart, which fires for programmatic moves too.
    container.addEventListener("pointerdown", markMoved);
    container.addEventListener("wheel", markMoved, { passive: true });

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(container);

    return () => {
      observer.disconnect();
      container.removeEventListener("pointerdown", markMoved);
      container.removeEventListener("wheel", markMoved);
    };
    // `signature` stands in for `points`: a new array with the same coordinates
    // must not retrigger the fit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, signature, active]);

  return null;
}

/**
 * Moves the view onto a searched place.
 *
 * A street is a line and a district is an area, so the geocoder's bounding box
 * frames what the user asked for; `flyTo` at street zoom is only the fallback
 * for a result that came back without one.
 */
function FocusPlace({ place }: { place: Place | null }) {
  const map = useMap();

  useEffect(() => {
    if (!place) return;

    if (place.bounds) {
      map.flyToBounds(L.latLngBounds(place.bounds), {
        padding: fitPadding(map),
        maxZoom: 17,
      });
    } else {
      map.flyTo(place.coords, 17);
    }
  }, [map, place]);

  return null;
}

/** Captures map clicks so the parent can offer to add a kos there. */
function ClickCatcher({ onPick }: { onPick: (p: [number, number]) => void }) {
  useMapEvents({
    click: (e) => onPick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

export default function KosMap({
  kos: fromServer,
  signedIn,
  filter,
}: {
  kos: Kos[];
  signedIn: boolean;
  filter: KosFilter;
}) {
  const added = useKosStore((s) => s.added);
  const addKos = useKosStore((s) => s.addKos);
  const kosList = mergeKos(added, fromServer, filter);
  const router = useRouter();

  /** Where the user clicked, awaiting confirmation. */
  const [draft, setDraft] = useState<[number, number] | null>(null);
  /** Same point, once "Tambah kos" opens the form. */
  const [formAt, setFormAt] = useState<[number, number] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /**
   * The toast's pending hide. Kept so a second save restarts the countdown —
   * otherwise the first save's timer hides the second toast early.
   */
  /** The map's box — where focus returns when the add-kos dialog closes. */
  const mapBox = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );
  /** The street or landmark the user searched for, marked on the map. */
  const [place, setPlace] = useState<Place | null>(null);
  /**
   * One-way latch, not `!place`: clearing the search box should leave the view
   * where the user put it, not snap back to the kos.
   */
  const [searchTookOver, setSearchTookOver] = useState(false);

  function handlePlacePick(picked: Place) {
    setPlace(picked);
    setSearchTookOver(true);
    // The draft popup belongs to a point we are about to fly away from.
    setDraft(null);
  }

  function handleSaved(input: NewKosInput, result: SaveResult) {
    const saved = result.status === "saved";
    addKos(toKos(input, saved ? result.id : undefined));
    // Pull the persisted row from the server so its card links to a real page;
    // mergeKos drops the optimistic copy once the refreshed list carries it.
    if (saved) router.refresh();
    setFormAt(null);
    setDraft(null);
    setNotice(
      saved
        ? `"${input.name}" tersimpan ke Supabase.`
        : `"${input.name}" ditambahkan ke peta (belum tersimpan ke database).`,
    );
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 6000);
  }

  return (
    <div ref={mapBox} className="relative h-full w-full">
      <MapContainer
        center={INDONESIA.center}
        zoom={INDONESIA.zoom}
        scrollWheelZoom={false}
        // Top left belongs to the search box now; the default zoom control
        // would sit underneath it.
        zoomControl={false}
        className="h-full w-full"
        style={{ minHeight: "100%" }}
      >
        <ZoomControl position="bottomright" />

        {/* Keyless OSM tiles; the washed-out look comes from a CSS filter. */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <ClickCatcher onPick={setDraft} />
        <FitToKos
          points={kosList.map((k) => k.coords)}
          active={!searchTookOver}
        />
        <FocusPlace place={place} />

        {place && (
          <Marker position={place.coords} icon={placeIcon}>
            <Tooltip direction="top" offset={[0, -16]}>
              <span className="font-bold">{place.name}</span>
              {place.detail && (
                <>
                  {" · "}
                  {place.detail}
                </>
              )}
            </Tooltip>
          </Marker>
        )}

        {kosList.map((kos) => (
          <Marker
            key={kos.id}
            position={kos.coords}
            icon={scoreIcon(
              kos.score,
              accentForScore(kos.score),
              kos.reviews === 0,
            )}
          >
            <Tooltip direction="top" offset={[0, -22]}>
              <span className="font-bold">{kos.name}</span>
              {" · "}
              {kos.city}
              {" · "}
              {formatRupiah(kos.price)}
            </Tooltip>
          </Marker>
        ))}

        {draft && (
          <>
            <Marker position={draft} icon={draftIcon} />
            {/* Standalone Popup opens itself via openOn(map) */}
            <Popup
              position={draft}
              closeButton={false}
              eventHandlers={{ remove: () => setDraft(null) }}
            >
              <span className="block text-[13px] font-bold text-ink">
                {signedIn
                  ? "Tambahkan kos di titik ini?"
                  : "Masuk dulu untuk menambah kos"}
              </span>
              <span className="mt-0.5 block text-xs font-medium text-muted">
                {signedIn
                  ? `${draft[0].toFixed(5)}, ${draft[1].toFixed(5)}`
                  : "Melihat kos dan review tidak perlu akun — menambah data perlu."}
              </span>
              {signedIn ? (
                <button
                  type="button"
                  onClick={() => setFormAt(draft)}
                  className="mt-2.5 w-full rounded-full bg-rose px-4 py-2 text-[13px] font-extrabold text-white"
                >
                  + Tambah kos
                </button>
              ) : (
                <a
                  href="#login"
                  onClick={() => setDraft(null)}
                  className="mt-2.5 block w-full rounded-full bg-ink px-4 py-2 text-center text-[13px] font-extrabold text-white"
                >
                  Masuk atau daftar
                </a>
              )}
            </Popup>
          </>
        )}
      </MapContainer>

      {/* One top-left column so the search box and the hint never overlap on a
          phone-width map. `pointer-events-none` on the column keeps the map
          draggable between them; the search box opts itself back in. */}
      <div className="pointer-events-none absolute left-4 right-4 top-4 z-[500] flex flex-col items-start gap-2 sm:right-auto sm:w-[320px]">
        <MapSearch onPick={handlePlacePick} onClear={() => setPlace(null)} />

        <p className="rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-ink shadow-[var(--shadow-lift)]">
          {signedIn
            ? "Klik peta untuk menambah kos"
            : "Klik peta untuk menambah kos — perlu masuk"}
        </p>
      </div>

      {notice && (
        <p className="absolute bottom-4 left-1/2 z-[500] w-[min(92%,380px)] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-center text-[13px] font-bold text-white shadow-[var(--shadow-float)]">
          {notice}
        </p>
      )}

      {formAt && (
        <AddKosDialog
          position={formAt}
          onCancel={() => setFormAt(null)}
          onSaved={handleSaved}
          returnFocusRef={mapBox}
        />
      )}
    </div>
  );
}
