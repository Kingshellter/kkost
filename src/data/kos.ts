/**
 * Demo content for the landing page, transcribed from the design deck.
 * Swap this module for a Supabase query once the `kos` table is seeded —
 * the section components only depend on the types below.
 */

export type Accent = "rose" | "amber" | "blue" | "sky" | "ink";

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
  authorName: string;
  /** Signed up with a .ac.id address — shown as a "verified tenant" badge. */
  isStudent: boolean;
  scores: Record<FacilityKey, number>;
  /** Mean of the six scores, one decimal. Computed by the database. */
  average: number;
  body: string | null;
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
  /** Walking distance to `campus`, in metres. Supplied by whoever added the kos. */
  distance: number;
  price: number;
  score: number;
  reviews: number;
  /** Placeholder tint until real photography lands. */
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
      { label: "Water", score: 4.9, accent: "amber" },
      { label: "Bathroom", score: 4.8, accent: "rose" },
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
      { label: "Parking", score: 4.9, accent: "blue" },
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
      { label: "Kitchen", score: 4.9, accent: "amber" },
      { label: "Room", score: 4.5, accent: "ink" },
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
      { label: "Parking", score: 4.2, accent: "blue" },
      { label: "Room", score: 3.8, accent: "ink" },
    ],
  },
];

/** The hero card breaks the score down bar-by-bar. */
export const HERO_BREAKDOWN: FacilityScore[] = [
  { label: "Bathroom", score: 4.8, accent: "rose" },
  { label: "Water", score: 4.7, accent: "amber" },
  { label: "WiFi", score: 4.2, accent: "blue" },
  { label: "Kitchen", score: 4.5, accent: "sky" },
];

export const CRITERIA = [
  {
    number: "01",
    key: "room" as FacilityKey,
    title: "Room & bed",
    description:
      "Real floor space, daylight, the state of the mattress, somewhere to put your clothes.",
    accent: "amber" as Accent,
  },
  {
    number: "02",
    key: "bathroom" as FacilityKey,
    title: "Bathroom",
    description:
      "How clean it stays, how long the morning queue is, whether hot water actually exists.",
    accent: "rose" as Accent,
  },
  {
    number: "03",
    key: "water" as FacilityKey,
    title: "Water & power",
    description:
      "Outages, pressure on the top floor, and whether the meter is split fairly.",
    accent: "blue" as Accent,
  },
  {
    number: "04",
    key: "wifi" as FacilityKey,
    title: "WiFi",
    description: "Measured in your room at 9pm, not in the lobby at noon.",
    accent: "sky" as Accent,
  },
  {
    number: "05",
    key: "kitchen" as FacilityKey,
    title: "Kitchen",
    description:
      "What is actually in it, who cleans it, and whether cooking is allowed at all.",
    accent: "ink" as Accent,
  },
  {
    number: "06",
    key: "parking" as FacilityKey,
    title: "Parking",
    description:
      "Space for everyone's motorbike, a roof over it, and a gate at night.",
    accent: "amber" as Accent,
  },
];

export const NAV_LINKS = [
  { label: "Browse kos", href: "#browse" },
  { label: "How scoring works", href: "#scoring" },
  { label: "Reviews", href: "#reviews" },
  { label: "For owners", href: "#owners" },
];

export const STATS = { reviews: 11_907, kos: 2_418, cities: 38 };
