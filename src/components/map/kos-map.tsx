"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import { ACCENT_HEX, accentForScore } from "@/components/ui/accent";
import { CAMPUS, KOS_LIST, type Accent } from "@/data/kos";

/**
 * Score pins are drawn as divIcons so they match the circular badges used
 * everywhere else — this also sidesteps Leaflet's broken default marker asset.
 */
function scoreIcon(score: number, accent: Accent) {
  const dark = accent === "amber" || accent === "sky";
  return L.divIcon({
    className: "",
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    html: `<span style="
      display:flex;align-items:center;justify-content:center;
      width:46px;height:46px;border-radius:9999px;
      background:${ACCENT_HEX[accent]};
      color:${dark ? "#1c2a4e" : "#ffffff"};
      font-weight:800;font-size:15px;
      box-shadow:0 8px 20px -6px rgba(28,42,78,.55);
    ">${score.toFixed(1)}</span>`,
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

export default function KosMap() {
  return (
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

      <Marker position={CAMPUS.coords} icon={campusIcon}>
        <Tooltip direction="right" offset={[10, 0]} permanent>
          {CAMPUS.name}
        </Tooltip>
      </Marker>

      {KOS_LIST.map((kos) => (
        <Marker
          key={kos.id}
          position={kos.coords}
          icon={scoreIcon(kos.score, accentForScore(kos.score))}
        >
          <Tooltip direction="top" offset={[0, -22]}>
            <span className="font-bold">{kos.name}</span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
