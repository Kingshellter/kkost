/** "Rp950.000" — Indonesian thousands separators, no space after "Rp". */
export function formatRupiah(amount: number) {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

/** 700 -> "700 m", 1100 -> "1,1 km" */
export function formatDistance(meters: number) {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toLocaleString("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`;
}

/**
 * The campus line under a kos: "700 m ke UGM" when the distance is known,
 * "Dekat UGM" when only the campus is. Null when there is no campus.
 */
export function formatCampus(campus: string | null, distance: number | null) {
  if (!campus) return null;
  return distance === null
    ? `Dekat ${campus}`
    : `${formatDistance(distance)} ke ${campus}`;
}

/** 11907 -> "11.907" */
export function formatNumber(value: number) {
  return value.toLocaleString("id-ID");
}
