/** "Rp950,000" — the deck writes rupiah with comma separators and no space. */
export function formatRupiah(amount: number) {
  return `Rp${amount.toLocaleString("en-US")}`;
}

/** 700 -> "700 m", 1100 -> "1.1 km" */
export function formatDistance(meters: number) {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
