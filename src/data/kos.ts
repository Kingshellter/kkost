/**
 * Domain types plus the site's static copy. Live data comes from Supabase;
 * `KOS_LIST` below is only the fallback for a checkout with no database.
 *
 * All user-facing copy here is Indonesian, like the rest of the site.
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
  /**
   * `profiles.id`. Identity checks compare this, never `authorName` — display
   * names are neither unique nor fixed.
   */
  authorId: string;
  authorName: string;
  /** Signed up with a .ac.id address — shown as a "verified tenant" badge. */
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
  /** Picks the fallback illustration and its tint when there is no photo. */
  photoAccent: Accent;
  /** Public URL of the newest uploaded photo (0009), or null — then the illustration shows. */
  photoUrl: string | null;
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
    photoUrl: null,
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
    photoUrl: null,
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
    photoUrl: null,
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
    photoUrl: null,
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
    description:
      "Luas yang sebenarnya, cahaya matahari, kondisi kasur, dan tempat untuk menyimpan baju.",
    accent: "amber" as Accent,
  },
  {
    number: "02",
    key: "bathroom" as FacilityKey,
    title: "Kamar mandi",
    description:
      "Seberapa bersih, seberapa panjang antrean pagi, dan apakah air panasnya benar-benar ada.",
    accent: "rose" as Accent,
  },
  {
    number: "03",
    key: "water" as FacilityKey,
    title: "Air & listrik",
    description:
      "Seberapa sering mati, tekanan air di lantai atas, dan apakah token listrik dibagi adil.",
    accent: "blue" as Accent,
  },
  {
    number: "04",
    key: "wifi" as FacilityKey,
    title: "WiFi",
    description: "Diukur di kamar jam sembilan malam, bukan di ruang tamu siang hari.",
    accent: "sky" as Accent,
  },
  {
    number: "05",
    key: "kitchen" as FacilityKey,
    title: "Dapur",
    description:
      "Apa saja isinya, siapa yang membersihkan, dan apakah memasak diperbolehkan.",
    accent: "ink" as Accent,
  },
  {
    number: "06",
    key: "parking" as FacilityKey,
    title: "Parkir",
    description:
      "Cukup untuk motor semua penghuni, beratap, dan ada gerbang di malam hari.",
    accent: "amber" as Accent,
  },
];

/** In page order, so the menu reads top to bottom like the page does. */
export const NAV_LINKS = [
  { label: "Dampak", href: "#dampak" },
  { label: "Cara menilai", href: "#scoring" },
  { label: "Kenapa terpercaya", href: "#trust" },
  { label: "Cari kos", href: "#browse" },
];

/**
 * The problem statement on the `#dampak` section. Qualitative on purpose: no
 * figure appears here that the project cannot source.
 */
export const PROBLEMS = [
  {
    title: "Yang penting tidak terlihat di foto",
    detail:
      "Air yang mati tiap pagi, WiFi yang hanya kuat di ruang tamu, antrean kamar mandi. Semuanya baru ketahuan setelah sewa dibayar.",
  },
  {
    title: "Ulasan tercecer dan bisa hilang",
    detail:
      "Pengalaman penghuni tersebar di grup chat dan kolom komentar — tanpa struktur, tidak bisa dibandingkan, dan bisa dihapus pengelolanya.",
  },
  {
    title: "Mahasiswa baru memilih dari jauh",
    detail:
      "Banyak yang harus menyewa sebelum pernah melihat kotanya, justru saat informasi yang mereka punya paling sedikit.",
  },
];

/**
 * SDG contribution, shown on the page and mirrored in the root README. Each
 * target number is a real SDG target; keep the two in sync.
 */
export const SDG_GOALS = [
  {
    number: 11,
    name: "Kota dan Permukiman Berkelanjutan",
    target: "11.1",
    detail:
      "Akses ke hunian yang layak, aman, dan terjangkau. Kamar, kamar mandi, dan parkir dinilai sebagai indikator kelayakan, berdampingan dengan harga.",
    accent: "amber" as Accent,
    primary: true,
  },
  {
    number: 6,
    name: "Air Bersih dan Sanitasi",
    target: "6.2",
    detail:
      "Dua dari enam kriteria — air dan kamar mandi — adalah indikator sanitasi langsung yang selama ini tidak terdokumentasi.",
    accent: "sky" as Accent,
    primary: false,
  },
  {
    number: 4,
    name: "Pendidikan Berkualitas",
    target: "4.3",
    detail:
      "Akses setara ke pendidikan tinggi juga soal tempat tinggal yang terjangkau. Filter budget dan jarak ke kampus membantu menemukannya.",
    accent: "rose" as Accent,
    primary: false,
  },
  {
    number: 9,
    name: "Industri, Inovasi, dan Infrastruktur",
    target: "9.c",
    detail:
      "Akses internet diperlakukan sebagai kebutuhan belajar, bukan fasilitas tambahan: WiFi diukur di kamar, bukan di lobi.",
    accent: "blue" as Accent,
    primary: false,
  },
];

/**
 * The competition theme is "NextGen Secure: Building the Future of Trusted Web
 * Ecosystems", and these are kkost's answer to it. Every claim here is enforced
 * by a database constraint, policy, trigger, or privilege — never by the
 * interface.
 *
 * Keep this list honest: if a guarantee stops being true in
 * supabase/migrations/, it comes out of here the same day. Nothing about owner
 * replies belongs here until replies exist.
 */
export const TRUST_GUARANTEES = [
  {
    where: "Trigger database",
    claim: "Skor dihitung, tidak pernah diketik",
    detail:
      "Skor setiap kos dihitung ulang database begitu ada review yang berubah. Tidak ada peran pengguna yang punya hak menulis kolom skor — lewat API sekalipun.",
    accent: "rose" as Accent,
  },
  {
    where: "Row level security",
    claim: "Pemilik kos tidak bisa menghapus review",
    detail:
      "Hak menghapus review hanya dimiliki penulisnya. Bukan disembunyikan dari tampilan — haknya memang tidak pernah diberikan.",
    accent: "amber" as Accent,
  },
  {
    where: "Unique constraint",
    claim: "Satu review per orang, per kos",
    detail:
      "Ditegakkan oleh tabelnya sendiri, jadi review kedua ditolak database, bukan oleh pengecekan yang bisa dilewati aplikasi.",
    accent: "blue" as Accent,
  },
  {
    where: "Server action",
    claim: "Browser tidak pernah dipercaya",
    detail:
      "Formulir review hanya menyebut kos mana dan berapa skornya. Siapa penulisnya dibaca ulang dari sesi di server, dan setiap isian divalidasi di sana.",
    accent: "sky" as Accent,
  },
];
