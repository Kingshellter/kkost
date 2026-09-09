/**
 * Demo content for the landing page, transcribed from the design deck.
 * Swap this module for a Supabase query once the `kos` table is seeded —
 * the section components only depend on the types below.
 */

export type Accent = "rose" | "amber" | "blue" | "sky" | "ink";

export type FacilityScore = {
  label: string;
  score: number;
  accent: Accent;
};

export type Kos = {
  id: string;
  name: string;
  area: string;
  /** Walking distance to campus, in metres. */
  distance: number;
  price: number;
  score: number;
  reviews: number;
  /** Placeholder tint until real photography lands. */
  photoAccent: Accent;
  coords: [number, number];
  highlights: FacilityScore[];
};

export const CAMPUS = {
  name: "UGM campus",
  coords: [-7.7713, 110.3776] as [number, number],
};

export const KOS_LIST: Kos[] = [
  {
    id: "puri-melati",
    name: "Kos Puri Melati",
    area: "Condongcatur",
    distance: 700,
    price: 950_000,
    score: 4.8,
    reviews: 64,
    photoAccent: "amber",
    coords: [-7.765, 110.38],
    highlights: [
      { label: "Water", score: 4.9, accent: "amber" },
      { label: "Bathroom", score: 4.8, accent: "rose" },
    ],
  },
  {
    id: "wisma-kenanga",
    name: "Wisma Kenanga",
    area: "Caturtunggal",
    distance: 400,
    price: 1_150_000,
    score: 4.6,
    reviews: 88,
    photoAccent: "sky",
    coords: [-7.7745, 110.3796],
    highlights: [
      { label: "Parking", score: 4.9, accent: "blue" },
      { label: "WiFi", score: 4.5, accent: "sky" },
    ],
  },
  {
    id: "bu-har",
    name: "Kos Bu Har",
    area: "Seturan",
    distance: 1100,
    price: 825_000,
    score: 4.5,
    reviews: 41,
    photoAccent: "rose",
    coords: [-7.77, 110.3875],
    highlights: [
      { label: "Kitchen", score: 4.9, accent: "amber" },
      { label: "Room", score: 4.5, accent: "ink" },
    ],
  },
  {
    id: "anggrek-3",
    name: "Kos Anggrek 3",
    area: "Depok",
    distance: 1800,
    price: 675_000,
    score: 3.9,
    reviews: 27,
    photoAccent: "blue",
    coords: [-7.762, 110.391],
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
    title: "Room & bed",
    description:
      "Real floor space, daylight, the state of the mattress, somewhere to put your clothes.",
    accent: "amber" as Accent,
  },
  {
    number: "02",
    title: "Bathroom",
    description:
      "How clean it stays, how long the morning queue is, whether hot water actually exists.",
    accent: "rose" as Accent,
  },
  {
    number: "03",
    title: "Water & power",
    description:
      "Outages, pressure on the top floor, and whether the meter is split fairly.",
    accent: "blue" as Accent,
  },
  {
    number: "04",
    title: "WiFi",
    description: "Measured in your room at 9pm, not in the lobby at noon.",
    accent: "sky" as Accent,
  },
  {
    number: "05",
    title: "Kitchen",
    description:
      "What is actually in it, who cleans it, and whether cooking is allowed at all.",
    accent: "ink" as Accent,
  },
  {
    number: "06",
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

export const STATS = { reviews: 11_907, kos: 2_418, nearCampus: 214 };
