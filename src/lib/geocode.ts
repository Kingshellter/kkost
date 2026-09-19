/**
 * Place lookup for the map, backed by Nominatim — OpenStreetMap's own
 * geocoder. It is keyless, like the raster tiles the map already draws, so
 * searching keeps working on a bare checkout with no environment variables.
 *
 * Nominatim's usage policy caps callers at roughly one request per second and
 * forbids bulk querying, which is why the search box debounces and aborts the
 * previous request instead of firing on every keystroke.
 */

const ENDPOINT = "https://nominatim.openstreetmap.org/search";

/** A street, neighbourhood, campus or landmark returned by the geocoder. */
export type Place = {
  id: string;
  /** Short label — the street or building name on its own. */
  name: string;
  /** The rest of the address, for telling two identically named streets apart. */
  detail: string;
  coords: [number, number];
  /**
   * South-west / north-east corners. A street is a line and a district is an
   * area, so framing the whole extent beats dropping the view on its midpoint.
   * Null when the geocoder returns no box.
   */
  bounds: [[number, number], [number, number]] | null;
};

/** Outcome of one lookup. Errors are values, never thrown — the box shows them inline. */
export type GeocodeResult =
  | { status: "ok"; places: Place[] }
  | { status: "error"; message: string };

/** Shape of the one Nominatim response format this module asks for (`jsonv2`). */
type NominatimPlace = {
  place_id: number;
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
  /** `[south, north, west, east]`, as strings. Note the order — not Leaflet's. */
  boundingbox?: [string, string, string, string];
};

/**
 * Look up `query` and return at most six places.
 *
 * Results are limited to Indonesia: kkost is nationwide but not international,
 * and without the filter a query like "jalan kaliurang" surfaces streets on
 * other continents ahead of the real one.
 */
export async function searchPlaces(
  query: string,
  options: { signal?: AbortSignal } = {},
): Promise<GeocodeResult> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("countrycodes", "id");
  url.searchParams.set("limit", "6");
  url.searchParams.set("accept-language", "id");

  try {
    const response = await fetch(url, { signal: options.signal });
    if (!response.ok) {
      return {
        status: "error",
        message: `Pencarian tempat gagal (${response.status}). Coba lagi sebentar lagi.`,
      };
    }

    const raw: NominatimPlace[] = await response.json();
    return { status: "ok", places: raw.map(toPlace) };
  } catch {
    // An aborted request lands here too; the caller drops the result because
    // its own AbortController is the thing that cancelled it.
    return {
      status: "error",
      message: "Tidak bisa menghubungi layanan peta. Periksa koneksi internet.",
    };
  }
}

function toPlace(raw: NominatimPlace): Place {
  const parts = raw.display_name.split(", ");
  const name = raw.name?.trim() || parts[0];
  // Drop the leading segment only when it is the label we already show.
  const detail = (parts[0] === name ? parts.slice(1) : parts).join(", ");

  return {
    id: String(raw.place_id),
    name,
    detail,
    coords: [Number(raw.lat), Number(raw.lon)],
    bounds: toBounds(raw.boundingbox),
  };
}

/** Nominatim orders its box `[south, north, west, east]`; Leaflet wants corners. */
function toBounds(box: NominatimPlace["boundingbox"]) {
  if (!box) return null;
  const [south, north, west, east] = box.map(Number);
  if ([south, north, west, east].some(Number.isNaN)) return null;
  return [
    [south, west],
    [north, east],
  ] as [[number, number], [number, number]];
}

/** The area and city a map point falls in, for pre-filling the add-kos form. */
export type PointAddress = { area: string | null; city: string | null };

/** The parts of a `jsonv2` reverse result this module reads. */
type NominatimAddress = Partial<
  Record<
    | "neighbourhood"
    | "quarter"
    | "village"
    | "suburb"
    | "city_district"
    | "city"
    | "town"
    | "municipality"
    | "county"
    | "state_district",
    string
  >
>;

/**
 * "Kota Semarang" → "Semarang", "Kabupaten Sleman" → "Sleman" — the form the
 * seeded kos and the city filter already use, so a new kos lands in the same
 * dropdown entry instead of a near-duplicate.
 */
function stripAdminPrefix(name: string) {
  return name.replace(/^(Kota|Kabupaten|Kab\.)\s+/i, "").trim();
}

/**
 * Look up the area (kelurahan/kecamatan) and city of a point. Null on any
 * failure — the form then simply stays empty for the user to type, which is
 * what it did before this existed.
 *
 * One request per dialog opening, well inside Nominatim's usage policy.
 */
export async function reverseGeocode(
  [lat, lng]: [number, number],
  options: { signal?: AbortSignal } = {},
): Promise<PointAddress | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("format", "jsonv2");
  // Neighbourhood-level detail: enough for an area, without snapping to a
  // single building's address.
  url.searchParams.set("zoom", "16");
  url.searchParams.set("accept-language", "id");

  try {
    const response = await fetch(url, { signal: options.signal });
    if (!response.ok) return null;
    const { address }: { address?: NominatimAddress } = await response.json();
    if (!address) return null;

    const area =
      address.suburb ??
      address.village ??
      address.city_district ??
      address.quarter ??
      address.neighbourhood ??
      null;
    const city =
      address.city ??
      address.town ??
      address.municipality ??
      address.county ??
      address.state_district ??
      null;

    return {
      area: area?.trim() || null,
      city: city ? stripAdminPrefix(city) || null : null,
    };
  } catch {
    return null;
  }
}
