# kkost

**Pilih kos dari orang yang pernah tinggal di dalamnya.**

Harga sewa kos transparan; kualitasnya tidak. Mahasiswa membayar di muka untuk
kamar yang belum pernah mereka lihat, berdasarkan foto yang dipilih pemiliknya
sendiri. kkost membuat kualitas itu terukur: setiap penghuni menilai **enam
fasilitas** dari 1 sampai 5, dan skor kos adalah rata-rata polos dari semua
penilaian — tanpa bobot, tanpa bisa dibeli.

Pemilik kos tidak pernah bisa menghapus review — dan itu
ditegakkan di level database, bukan sekadar janji di halaman depan.

Berlaku untuk seluruh Indonesia.

## Enam kriteria

| # | Kriteria | Yang dinilai |
|---|---|---|
| 01 | Kamar & kasur | Luas sebenarnya, cahaya, kondisi kasur, tempat menyimpan pakaian |
| 02 | Kamar mandi | Kebersihan, antrean pagi, air panas benar-benar ada atau tidak |
| 03 | Air & listrik | Mati air/listrik, tekanan di lantai atas, pembagian meteran |
| 04 | WiFi | Diukur di kamar jam 9 malam, bukan di lobi tengah hari |
| 05 | Dapur | Isinya apa, siapa yang membersihkan, boleh masak atau tidak |
| 06 | Parkir | Muat untuk semua motor, beratap, ada gerbang malam hari |

## Kesesuaian dengan tema

> **"NextGen Secure: Building the Future of Trusted Web Ecosystems"**

Ulasan daring hanya bernilai kalau bisa dipercaya. Platform ulasan properti
umumnya gagal justru di titik ini: skor bisa dipengaruhi pemilik, ulasan buruk
bisa hilang, dan tidak ada cara membedakan penghuni asli dari akun karangan.
kkost dirancang dengan asumsi bahwa **pihak yang paling berkepentingan
memanipulasi data adalah pemilik kos itu sendiri.**

Karena itu setiap jaminan integritas ditegakkan di **lapisan data**, bukan di
antarmuka. Antarmuka bisa dilewati; kebijakan database tidak.

| Jaminan | Cara penegakan | Berkas |
|---|---|---|
| **Skor tidak dapat ditulis siapa pun** | `kos.score` dan `kos.reviews` adalah nilai turunan yang dihitung ulang oleh trigger `refresh_kos_score()` setiap kali review berubah. Aplikasi tidak pernah menulisnya, dan peran klien tidak memegang hak kolom untuk menulisnya lewat REST sekalipun | `0002_reviews.sql`, `0006_column_grants.sql` |
| **Rata-rata review tidak dapat dipalsukan** | Kolom `average` adalah *generated column* di PostgreSQL — turunan matematis dari enam skor, mustahil menyimpang | `0002_reviews.sql` |
| **Pemilik kos tidak dapat menghapus ulasan** | Tidak ada policy RLS `DELETE` untuk siapa pun selain penulis ulasan. Bukan disembunyikan dari UI — memang tidak ada haknya | `0002_reviews.sql` |
| **Satu ulasan per kos per orang** | Constraint `unique (kos_id, author_id)` di database, bukan pengecekan di aplikasi | `0002_reviews.sql` |
| **Jendela penyuntingan 30 hari** | Policy RLS `UPDATE` mensyaratkan `created_at > now() - interval '30 days'`; `created_at` dan `kos_id` tidak dapat diubah klien, sehingga jendela tidak bisa di-reset | `0002_reviews.sql`, `0006_column_grants.sql` |
| **Identitas penulis tidak berasal dari klien** | Server Action membaca ulang pengguna dari sesi (`getSessionUser()`); formulir hanya mengirim *kos mana* dan penilaiannya | `review-actions.ts` |
| **Setiap masukan divalidasi di server** | Skema Zod di dalam Server Action. `FormData` diperlakukan sebagai data tidak tepercaya | `review-actions.ts`, `auth-actions.ts` |
| **Row Level Security aktif di semua tabel** | `kos`, `profiles`, `reviews` — akses ditentukan kebijakan eksplisit, bukan default terbuka | `0002_reviews.sql` |
| **Menulis wajib identitas, membaca tetap terbuka** | Menambah kos dan menulis review hanya untuk pengguna terautentikasi, ditegakkan policy RLS. Melihat peta, daftar kos, halaman detail, dan seluruh review tidak memerlukan akun | `0004_kos_insert_requires_login.sql` |
| **Penghuni terverifikasi** | Pendaftaran dengan surel kampus (`.ac.id`); status `is_student` ditetapkan trigger database saat pendaftaran, tidak dapat diubah pengguna (hak UPDATE hanya untuk `display_name`) | `0002_reviews.sql`, `0006_column_grants.sql` |

Prinsipnya satu: **klien tidak pernah dipercaya, dan antarmuka bukan batas
keamanan.** Setiap klaim yang ditampilkan kkost kepada pengunjung dapat
dibuktikan dari skema database, bukan dari kode tampilan.

Argumen ini juga disampaikan di dalam situsnya sendiri, bukan hanya di berkas
ini: bagian **"Kenapa bisa dipercaya"** di halaman utama menyebutkan setiap jaminan
beserta tempat penegakannya, dan setiap halaman detail kos memuat panel
**"Dari mana angka ini"** yang menjelaskan asal skornya kepada pengunjung.

### Hasil audit database

Skema ini diperiksa dengan **database linter bawaan Supabase**, bukan hanya
dibaca sendiri. Pemeriksaan pertama menemukan empat hal, dan seluruhnya
ditutup di `0005_linter_fixes.sql`:

| Temuan | Tindakan |
|---|---|
| Dua fungsi `SECURITY DEFINER` dapat dipanggil peran `anon` sebagai endpoint RPC | Hak `execute` dicabut dari `public`, `anon`, dan `authenticated`. Trigger tetap berjalan karena eksekusi trigger tidak memeriksa hak pemanggil |
| `auth.uid()` dievaluasi ulang untuk setiap baris pada lima policy RLS | Dibungkus `(select auth.uid())` agar dievaluasi sekali per kueri |
| Dua policy `SELECT` permissive menumpuk di tabel `kos` | Policy lama peninggalan dashboard dihapus; membaca kos tetap terbuka |
| Foreign key `reviews.author_id` tanpa index | Index ditambahkan |

Pemeriksaan ulang setelah perbaikan: **nol temuan keamanan.** Sisa laporan
performa hanya berupa catatan `unused_index` bertingkat INFO — wajar untuk
index yang baru dibuat pada basis data yang belum menerima lalu lintas.

Linter tidak memeriksa **hak tingkat kolom**. Audit manual berikutnya menemukan
bahwa policy RLS membatasi *baris*, sementara peran klien masih memegang hak
INSERT/UPDATE atas *semua kolom*: skor kos bisa diisi saat insert, `is_student`
bisa diubah sendiri, dan `created_at` review bisa di-reset. Ketiganya ditutup di
`0006_column_grants.sql` dengan hak per kolom, dan trigger skor kini menghitung
ulang kos lama maupun kos baru.

## Kontribusi terhadap SDG

Panduan juga mensyaratkan karya berkontribusi pada minimal satu dari 17
Sustainable Development Goals. Keenam kriteria penilaian memetakan langsung:

| SDG | Kaitan |
|---|---|
| **11 — Kota dan Permukiman Berkelanjutan** *(utama)* | Target 11.1: akses hunian yang **layak, aman, dan terjangkau**. Kamar, kamar mandi, dan parkir adalah indikator kelayakan hunian yang selama ini tidak terdokumentasi di pasar kos |
| **6 — Air Bersih dan Sanitasi** | Target 6.2: dua dari enam kriteria — air dan kamar mandi — adalah indikator sanitasi langsung |
| **4 — Pendidikan Berkualitas** | Target 4.3: akses setara ke pendidikan tinggi juga soal tempat tinggal yang terjangkau; filter budget dan jarak ke kampus membantu menemukannya |
| **9 — Industri, Inovasi, dan Infrastruktur** | Target 9.c: ketersediaan konektivitas sebagai kebutuhan dasar, bukan fasilitas tambahan |

Pemetaan yang sama ditampilkan di situs sendiri, pada bagian **Dampak**
(`#dampak`), bersama rumusan masalahnya.

## Fitur

- **Penilaian enam fasilitas** — 1–5 per kriteria, dengan seluruh jaminan
  integritas di tabel atas
- **Autentikasi** — pendaftaran dan masuk lewat Supabase Auth, penanda penghuni
  terverifikasi untuk surel kampus. **Berkontribusi perlu akun; menjelajah
  tidak** — seluruh isi kkost dapat dibaca tanpa mendaftar
- **Peta interaktif** — pin skor di seluruh Indonesia, tampilan menyesuaikan
  sendiri ke sebaran data; klik peta untuk menambahkan kos baru
- **Pencarian jalan dan tempat** — ketik nama jalan, kelurahan, kampus, atau
  landmark; peta terbang ke sana dan menandainya. Memakai Nominatim
  (OpenStreetMap), tanpa kunci API
- **Halaman detail kos** — rata-rata per fasilitas, seluruh review, form penilaian
- **Cari dan saring kos** — kota, budget, dan urutan (skor, harga, jarak ke
  kampus). Filter tersimpan di URL, jadi hasilnya bisa dibagikan dan tetap
  berjalan tanpa JavaScript
- **Angka yang jujur** — jumlah review, kos, dan kota di halaman utama dihitung
  dari data, bukan diketik
- **Review contoh berlabel** — data demo ditulis akun contoh yang ditandai di
  database (tanpa kata sandi, surel `.invalid`), dan setiap review-nya diberi
  label "Review contoh"
- **Responsif** — diuji pada 375px dan 1280px

## Teknologi

| Lapisan | Pilihan |
|---|---|
| Framework | Next.js 16 (App Router, React Server Components) |
| UI | React 19, Tailwind CSS v4 (konfigurasi CSS-first), TypeScript `strict` |
| Backend | Supabase — PostgreSQL + Auth, Row Level Security |
| Peta | Leaflet 1.9 + react-leaflet 5, ubin OpenStreetMap, geocoding Nominatim |
| Form | React Hook Form + Zod, Server Actions |
| State | Zustand |

Seluruh antarmuka ditulis dari nol. Tidak ada template, theme, atau UI kit
pihak ketiga.

## Menjalankan secara lokal

```bash
npm install
```

Salin `.env.example` menjadi `.env.local`, lalu isi dari Supabase Dashboard →
Project Settings → API:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Jalankan skrip database lewat **Supabase Dashboard → SQL Editor**, berurutan:

| # | Berkas | Isi |
|---|---|---|
| 1 | `supabase/migrations/0001_kos_location_fields.sql` | Kolom lokasi, harga, skor |
| 2 | `supabase/migrations/0002_reviews.sql` | Tabel `profiles` & `reviews`, trigger skor, RLS |
| 3 | `supabase/migrations/0003_city_and_campus.sql` | Kolom kota & kampus |
| 4 | `supabase/migrations/0004_kos_insert_requires_login.sql` | Menambah kos wajib login; membaca tetap publik |
| 5 | `supabase/migrations/0005_linter_fixes.sql` | Perbaikan temuan linter Supabase |
| 6 | `supabase/migrations/0006_column_grants.sql` | Hak tulis per kolom; skor, `is_student`, dan `created_at` tidak bisa ditulis klien |
| 7 | `supabase/migrations/0007_demo_profiles.sql` | Penanda akun contoh (`profiles.is_demo`) |
| 8 | `supabase/seed.sql` | Data awal lintas kota |
| 9 | `supabase/seed_demo_reviews.sql` | Review contoh berlabel dari empat akun demo |

Terakhir, matikan **Authentication → Providers → Email → Confirm email** agar
pendaftaran tidak memerlukan konfirmasi lewat surel.

```bash
npm run dev
```

Buka <http://localhost:3000>.

Tanpa kredensial Supabase aplikasi tetap berjalan menggunakan data contoh —
peta, kartu, dan navigasi tetap berfungsi.

## Perintah

```bash
npm run dev     # server pengembangan
npm run build   # build produksi
npm run start   # menjalankan hasil build
npm run lint    # ESLint
```

## Struktur

```
src/app/          rute — / dan /kos/[id]
src/components/   section halaman, peta, autentikasi, review, primitif UI
src/lib/          repository, Server Actions, util
src/data/         tipe domain dan konten statis
supabase/         migrasi dan data awal
docs/             dokumentasi teknis lengkap
```

Dokumentasi arsitektur, model data, sistem desain, dan konvensi kode ada di
[`docs/`](docs/) — mulai dari [`docs/README.md`](docs/README.md).

## Tim

**Tim atom** — Universitas Sebelas Maret

<!-- TODO: lengkapi nama tiga anggota sesuai identitas resmi (syarat C.2 panduan) -->

| Peran | Nama |
|---|---|
| Ketua | — |
| Anggota | — |
| Anggota | — |

Diajukan untuk **Web Development Competition, SwitchFest 2026** —
HMJ Teknologi Informasi, UIN Walisongo Semarang.

Tema: *"NextGen Secure: Building the Future of Trusted Web Ecosystems"*.
