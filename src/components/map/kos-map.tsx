"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Lock, Move } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
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
import { ACCENT_BG, accentForScore } from "@/components/ui/accent";
import { buttonClass } from "@/components/ui/controls";
import { KosScoreBadge } from "@/components/ui/kos-score-badge";
import { SectionLink } from "@/components/ui/section-link";
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
 *
 * The HTML carries Tailwind classes rather than inline colours: the strings
 * sit in this file, so Tailwind finds and generates them, and the pins follow
 * the design tokens like every other badge.
 */
function scoreIcon(score: number, accent: Accent, isNew: boolean) {
  const dark = accent === "amber" || accent === "sky";
  const colour = isNew
    ? "bg-ink text-white text-xs"
    : `${ACCENT_BG[accent]} ${dark ? "text-ink" : "text-white"} text-base`;
  return L.divIcon({
    className: "",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    html: `<span class="flex size-[46px] items-center justify-center rounded-full font-extrabold tabular-nums shadow-pin ${colour}">${isNew ? "Baru" : score.toFixed(1)}</span>`,
  });
}

const draftIcon = L.divIcon({
  className: "",
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  html: `<span class="flex size-[34px] items-center justify-center rounded-full bg-action text-xl font-extrabold leading-none text-white shadow-pin">+</span>`,
});

/** A searched street or landmark — deliberately unlike a score pin; it is a location, not a kos. */
const placeIcon = L.divIcon({
  className: "",
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  html: `<span class="block size-[26px] rounded-full border-[5px] border-white bg-blue shadow-pin"></span>`,
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
 * How far the search box reaches down over the map's top edge, in pixels
 * (16px inset + a 48px box + a little air). It covers pins at every width —
 * full-width on a phone, a 320px corner box wider up, which still hid a pin
 * at tablet width — so the fit always leaves room for it. Kept in step with
 * the box's markup below.
 */
const OVERLAY_INSET = 72;

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

    // A flight across Java is exactly the motion reduced-motion asks to
    // skip: jump straight to the place instead.
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (place.bounds) {
      const bounds = L.latLngBounds(place.bounds);
      const options = { padding: fitPadding(map), maxZoom: 17 };
      if (still) map.fitBounds(bounds, { ...options, animate: false });
      else map.flyToBounds(bounds, options);
    } else if (still) {
      map.setView(place.coords, 17, { animate: false });
    } else {
      map.flyTo(place.coords, 17);
    }
  }, [map, place]);

  return null;
}

/**
 * On a phone a map that pans under one finger swallows the page's scroll —
 * the visitor scrolling past it ends up dragging Java around instead. There
 * the map starts locked: dragging and pinch are off (Leaflet then drops its
 * `touch-action: none` classes, so the page scrolls straight through), and a
 * tap or the pill unlocks it. Pins, search and the zoom buttons work either
 * way.
 */
function TouchLock({ locked }: { locked: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (locked) {
      map.dragging.disable();
      map.touchZoom.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
    }
  }, [map, locked]);

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
  /** The map's box — where focus returns when the add-kos dialog closes. */
  const mapBox = useRef<HTMLDivElement>(null);
  /**
   * The toast's pending hide. Kept so a second save restarts the countdown —
   * otherwise the first save's timer hides the second toast early.
   */
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

  // A touch-first device gets the lock; only a device that can hover gets
  // hover tooltips — on a phone the tap opens the popup instead, and a
  // tooltip would open alongside it. Both are live: a 2-in-1 laptop or an
  // iPad with a trackpad changes its primary pointer while the page is open.
  const coarse = useMediaQuery("(pointer: coarse)");
  const canHover = useMediaQuery("(hover: hover)");
  // The user's choice, not the lock itself: a fine pointer is never locked,
  // so switching away from touch unlocks without an effect to sync it.
  const [unlocked, setUnlocked] = useState(false);
  const locked = coarse && !unlocked;

  /** While locked, a tap on the map means "let me use it", not "add a kos here". */
  function handleMapClick(point: [number, number]) {
    if (locked) {
      setUnlocked(true);
      return;
    }
    setDraft(point);
  }

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
        ? `"${input.name}" berhasil ditambahkan.`
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

        <ClickCatcher onPick={handleMapClick} />
        <TouchLock locked={locked} />
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
            {canHover && (
              <Tooltip direction="top" offset={[0, -22]}>
                <span className="font-bold">{kos.name}</span>
                {", "}
                {kos.city}
              </Tooltip>
            )}
            {/* Spans, not <p>: Leaflet's own CSS gives popup paragraphs a
                1.3em margin. */}
            {/* The pan that brings an edge pin's popup into view stops short
                of the search box and the rounded corners. */}
            <Popup
              closeButton={false}
              minWidth={220}
              offset={[0, -18]}
              autoPanPaddingTopLeft={[16, OVERLAY_INSET]}
              autoPanPaddingBottomRight={[16, 16]}
            >
              <span className="flex items-start gap-3">
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-extrabold leading-tight text-ink">
                    {kos.name}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-muted">
                    {kos.area}, {kos.city}
                  </span>
                </span>
                <KosScoreBadge kos={kos} size="sm" />
              </span>
              <span className="mt-2 block text-sm font-extrabold text-ink">
                {formatRupiah(kos.price)}
                <span className="font-medium text-muted">
                  {" "}
                  / bulan, {kos.reviews} review
                </span>
              </span>
              {/* A `local-` kos never reached the database: no page to open. */}
              {kos.id.startsWith("local-") ? (
                <span className="mt-2 block text-xs font-medium text-muted">
                  Belum tersimpan di database.
                </span>
              ) : (
                <Link
                  href={`/kos/${kos.id}`}
                  className={buttonClass("dark", "sm", "mt-3 w-full text-white!")}
                >
                  Lihat kos
                </Link>
              )}
            </Popup>
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
              <span className="block text-sm font-bold text-ink">
                {signedIn
                  ? "Tambahkan kos di titik ini?"
                  : "Masuk dulu untuk menambah kos"}
              </span>
              <span className="mt-0.5 block text-xs font-medium text-muted">
                {signedIn
                  ? `${draft[0].toFixed(5)}, ${draft[1].toFixed(5)}`
                  : "Melihat kos dan review tidak perlu akun. Menambah data perlu."}
              </span>
              {signedIn ? (
                <button
                  type="button"
                  onClick={() => setFormAt(draft)}
                  className={buttonClass("primary", "sm", "mt-2.5 w-full")}
                >
                  + Tambah kos
                </button>
              ) : (
                <SectionLink
                  href="/#login"
                  onClick={() => setDraft(null)}
                  className={buttonClass("dark", "sm", "mt-2.5 w-full text-white!")}
                >
                  Masuk atau daftar
                </SectionLink>
              )}
            </Popup>
          </>
        )}
      </MapContainer>

      {/* The search box, top left. Full width on a phone. The add-kos hint
          used to sit under it and hid pins; it now lives in the legend row
          below the map (MapSection). `pointer-events-none` on the wrapper
          keeps the map usable around the box; the box opts itself back in. */}
      <div className="pointer-events-none absolute left-4 right-4 top-4 z-(--z-map-overlay) sm:right-auto sm:w-[320px]">
        <MapSearch onPick={handlePlacePick} onClear={() => setPlace(null)} />
      </div>

      {coarse && (
        <button
          type="button"
          onClick={() => setUnlocked((value) => !value)}
          aria-pressed={!locked}
          className={buttonClass(
            "dark",
            "sm",
            // bottom-6 clears Leaflet's attribution line; min-h-11 keeps a
            // 44px target with the smaller text the phone width needs.
            "absolute bottom-6 left-4 z-(--z-map-overlay) min-h-11 px-4! text-sm! shadow-lift",
          )}
        >
          {locked ? (
            <>
              <Move aria-hidden className="size-4" strokeWidth={2} />
              Ketuk untuk menggeser peta
            </>
          ) : (
            <>
              <Lock aria-hidden className="size-4" strokeWidth={2} />
              Kunci peta
            </>
          )}
        </button>
      )}

      {notice && (
        <p
          className={`absolute left-1/2 z-(--z-map-overlay) w-[min(92%,380px)] -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-center text-sm font-bold text-white shadow-float ${
            // Clear of the lock pill on a phone.
            coarse ? "bottom-20" : "bottom-4"
          }`}
        >
          {notice}
        </p>
      )}

      {/* Portalled to <body>: the map sits inside a `.reveal` block, whose
          animation makes a stacking context, and the sticky navbar would
          otherwise paint over the dialog's backdrop. KosMap only ever runs
          in the browser (ssr: false), so `document` is always there. */}
      {formAt &&
        createPortal(
          <AddKosDialog
            position={formAt}
            onCancel={() => setFormAt(null)}
            onSaved={handleSaved}
            returnFocusRef={mapBox}
          />,
          document.body,
        )}
    </div>
  );
}

/**
 * A media query that stays current. `useSyncExternalStore` subscribes to the
 * query's own change event, so there is no effect copying it into state. The
 * server snapshot is never used — KosMap is `ssr: false` — but the hook
 * requires one.
 */
function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const list = matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}
