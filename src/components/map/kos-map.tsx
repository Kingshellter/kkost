"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { ACCENT_HEX, accentForScore } from "@/components/ui/accent";
import { INDONESIA, type Accent, type Kos } from "@/data/kos";
import { formatRupiah } from "@/lib/format";
import { toKos, type NewKosInput, type SaveResult } from "@/lib/kos-repository";
import { useKosStore } from "@/store/kos-store";
import { AddKosDialog } from "./add-kos-dialog";

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
 * panning and zooming.
 */
function FitToKos({ points }: { points: [number, number][] }) {
  const map = useMap();
  const signature = points.map((p) => p.join()).join("|");

  useEffect(() => {
    if (!points.length) return;

    const container = map.getContainer();
    let userMoved = false;
    const markMoved = () => {
      userMoved = true;
    };

    const fit = () => {
      const { clientWidth: w, clientHeight: h } = container;
      if (userMoved || !w || !h) return;

      // Proportional, not fixed: 56px of breathing room either side is fine on
      // a desktop but eats over half the width of a phone-sized map, which
      // pushes the fit several zoom levels too far out.
      const pad = Math.round(Math.min(56, w * 0.08, h * 0.08));

      map.invalidateSize({ animate: false });
      map.fitBounds(L.latLngBounds(points), {
        padding: [pad, pad],
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
  }, [map, signature]);

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
}: {
  kos: Kos[];
  signedIn: boolean;
}) {
  const added = useKosStore((s) => s.added);
  const addKos = useKosStore((s) => s.addKos);
  const kosList = [...added, ...fromServer];

  /** Where the user clicked, awaiting confirmation. */
  const [draft, setDraft] = useState<[number, number] | null>(null);
  /** Same point, once "Tambah kos" opens the form. */
  const [formAt, setFormAt] = useState<[number, number] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function handleSaved(input: NewKosInput, result: SaveResult) {
    addKos(toKos(input, kosList.length));
    setFormAt(null);
    setDraft(null);
    setNotice(
      result.status === "saved"
        ? `"${input.name}" tersimpan ke Supabase.`
        : `"${input.name}" ditambahkan ke peta (belum tersimpan ke database).`,
    );
    setTimeout(() => setNotice(null), 6000);
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={INDONESIA.center}
        zoom={INDONESIA.zoom}
        scrollWheelZoom={false}
        className="h-full w-full"
        style={{ minHeight: "100%" }}
      >
        {/* Keyless OSM tiles; the washed-out look comes from a CSS filter. */}
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />

        <ClickCatcher onPick={setDraft} />
        <FitToKos points={kosList.map((k) => k.coords)} />

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

      <p className="pointer-events-none absolute left-1/2 top-4 z-[500] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-ink shadow-[var(--shadow-lift)]">
        {signedIn
          ? "Klik peta untuk menambah kos"
          : "Klik peta untuk menambah kos — perlu masuk"}
      </p>

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
        />
      )}
    </div>
  );
}
