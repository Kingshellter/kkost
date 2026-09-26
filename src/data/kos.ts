/**
 * Domain types plus the site's static copy. Live data comes from Supabase;
 * `KOS_LIST` below is only the fallback for a checkout with no database.
 *
 * All user-facing copy here is Indonesian, like the rest of the site.
 */

/**
 * Colours a component may be tinted with. `teal` and `rose-deep` exist for
 * the score scale (see `accentForScore`); the rest are brand colours used as
 * identity (criteria, illustrations).
 */
export type Accent =
  | "rose"
  | "rose-deep"
  | "amber"
  | "blue"
  | "sky"
  | "teal"
  | "ink";

/**
 * The six things every reviewer scores. These keys are also the column names
 * in `public.reviews`, so the form, the database, and `CRITERIA` below can
 * never drift apart.
 */
export const FACILITY_KEYS = [
  "room",
  "bathroom",
  "water",
  "wifi",
  "kitchen",
  "parking",
] as const;

export type FacilityKey = (typeof FACILITY_KEYS)[number];

/** One reviewer's scorecard for one kos. */
export type Review = {
  id: string;
  kosId: string;
  /**
   * `profiles.id`. Identity checks compare this, never `authorName` — display
   * names are neither unique nor fixed.
   */
  authorId: string;
  authorName: string;
  /** Signed up with a .ac.id address — shown as a "mahasiswa terverifikasi" badge. */
  isStudent: boolean;
  /**
   * Written by one of the seeded demo accounts (`profiles.is_demo`). Always
   * labelled in the UI: an unlabelled demo review would be a fake review.
   */
  isDemo: boolean;
  scores: Record<FacilityKey, number>;
  /** Mean of the six scores, one decimal. Computed by the database. */
  average: number;
  body: string | null;
  /**
   * Public URLs of the photos the author attached (0010), oldest first, at
   * most three. Empty before 0010 or when there are none.
   */
  photos: string[];
  createdAt: string;
};

export type FacilityScore = {
  label: string;
  score: number;
  accent: Accent;
};

export type Kos = {
  id: string;
  name: string;
  /** Neighbourhood or sub-district, e.g. "Tembalang". */
  area: string;
  /** City or regency, e.g. "Semarang". kkost covers all of Indonesia. */
  city: string;
  /** The campus this kos is measured against. Null when nobody supplied one. */
  campus: string | null;
  /**
   * Walking distance to `campus`, in metres. Only the seeded kos have one:
   * the add-kos form no longer asks, so a new kos is null — shown as
   * "Dekat <campus>" and sorted last by "Terdekat ke kampus".
   */
  distance: number | null;
  price: number;
  score: number;
  reviews: number;
  /** Picks the kos illustration and its tint. Photos belong to reviews, not kos. */
  photoAccent: Accent;
  coords: [number, number];
  highlights: FacilityScore[];
};

/** Fallback map view when there is nothing to fit bounds to: all of Indonesia. */
export const INDONESIA = {
  center: [-2.5, 118] as [number, number],
  zoom: 5,
};

export const KOS_LIST: Kos[] = [
  {
    id: "puri-melati",
    name: "Kos Puri Melati",
    area: "Depok",
    city: "Jakarta",
    campus: "Universitas Indonesia",
    distance: 700,
    price: 1_650_000,
    score: 4.8,
    reviews: 64,
    photoAccent: "amber",
    coords: [-6.369, 106.827],
    highlights: [
      { label: "Air & listrik", score: 4.9, accent: "blue" },
      { label: "Kamar mandi", score: 4.8, accent: "rose" },
    ],
  },
  {
    id: "dago-asri",
    name: "Kos Dago Asri",
    area: "Coblong",
    city: "Bandung",
    campus: "Institut Teknologi Bandung",
    distance: 600,
    price: 1_250_000,
    score: 4.6,
    reviews: 88,
    photoAccent: "sky",
    coords: [-6.889, 107.61],
    highlights: [
      { label: "Parkir", score: 4.9, accent: "amber" },
      { label: "WiFi", score: 4.5, accent: "sky" },
    ],
  },
  {
    id: "kentingan",
    name: "Kos Kentingan",
    area: "Jebres",
    city: "Surakarta",
    campus: "Universitas Sebelas Maret",
    distance: 500,
    price: 750_000,
    score: 4.5,
    reviews: 41,
    photoAccent: "rose",
    coords: [-7.559, 110.856],
    highlights: [
      { label: "Dapur", score: 4.9, accent: "ink" },
      { label: "Kamar & kasur", score: 4.5, accent: "amber" },
    ],
  },
  {
    id: "anggrek-3",
    name: "Kos Anggrek 3",
    area: "Lowokwaru",
    city: "Malang",
    campus: "Universitas Brawijaya",
    distance: 1800,
    price: 800_000,
    score: 3.9,
    reviews: 27,
    photoAccent: "blue",
    coords: [-7.952, 112.615],
    highlights: [
      { label: "Parkir", score: 4.2, accent: "amber" },
      { label: "Kamar & kasur", score: 3.8, accent: "amber" },
    ],
  },
];

export const CRITERIA = [
  {
    number: "01",
    key: "room" as FacilityKey,
    title: "Kamar & kasur",
    description: "Luas, cahaya, dan kondisi kasur",
    accent: "amber" as Accent,
  },
  {
    number: "02",
    key: "bathroom" as FacilityKey,
    title: "Kamar mandi",
    description: "Kebersihan dan antrean pagi",
    accent: "rose" as Accent,
  },
  {
    number: "03",
    key: "water" as FacilityKey,
    title: "Air & listrik",
    description: "Seberapa sering mati",
    accent: "blue" as Accent,
  },
  {
    number: "04",
    key: "wifi" as FacilityKey,
    title: "WiFi",
    description: "Diukur di kamar, malam hari",
    accent: "sky" as Accent,
  },
  {
    number: "05",
    key: "kitchen" as FacilityKey,
    title: "Dapur",
    description: "Isi, kebersihan, boleh masak",
    accent: "ink" as Accent,
  },
  {
    number: "06",
    key: "parking" as FacilityKey,
    title: "Parkir",
    description: "Cukup, beratap, bergerbang",
    accent: "amber" as Accent,
  },
];

/**
 * In page order, so the menu reads top to bottom like the page does. Rooted at
 * `/`: the navbar is on every page, and a bare `#peta` on `/kos/[id]` would
 * only append a hash to the detail page's URL.
 */
export const NAV_LINKS = [
  { label: "Cara kerja", href: "/#cara-kerja" },
  { label: "Peta", href: "/#peta" },
  { label: "Cari kos", href: "/#browse" },
] as const;
