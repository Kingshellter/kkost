"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import { ACCENT_HEX, accentForScore } from "@/components/ui/accent";
import { CAMPUS, type Accent } from "@/data/kos";
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

const campusIcon = L.divIcon({
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  html: `<span style="
    display:block;width:18px;height:18px;border-radius:9999px;
    border:4px solid #1c2a4e;background:#ffffff;
  "></span>`,
});

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

/** Captures map clicks so the parent can offer to add a kos there. */
function ClickCatcher({ onPick }: { onPick: (p: [number, number]) => void }) {
  useMapEvents({
    click: (e) => onPick([e.latlng.lat, e.latlng.lng]),
  });
  return null;
}

export default function KosMap() {
  const kosList = useKosStore((s) => s.kos);
  const addKos = useKosStore((s) => s.addKos);

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
        center={[-7.7683, 110.3845]}
        zoom={14}
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

        <Marker position={CAMPUS.coords} icon={campusIcon}>
          <Tooltip direction="right" offset={[10, 0]} permanent>
            {CAMPUS.name}
          </Tooltip>
        </Marker>

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
                Tambahkan kos di titik ini?
              </span>
              <span className="mt-0.5 block text-xs font-medium text-muted">
                {draft[0].toFixed(5)}, {draft[1].toFixed(5)}
              </span>
              <button
                type="button"
                onClick={() => setFormAt(draft)}
                className="mt-2.5 w-full rounded-full bg-rose px-4 py-2 text-[13px] font-extrabold text-white"
              >
                + Tambah kos
              </button>
            </Popup>
          </>
        )}
      </MapContainer>

      <p className="pointer-events-none absolute left-1/2 top-4 z-[500] -translate-x-1/2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-ink shadow-[var(--shadow-lift)]">
        Klik peta untuk menambah kos
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
