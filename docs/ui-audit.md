# Audit UI/UX kkost (Fase 1)

Tanggal: 25 Sep 2026 · Branch: `ui-h-1` · Skill: `design-taste-frontend`
(dibaca manual dari `.agents/skills/`). **Tidak ada kode yang diubah.**

Metode: baca semua komponen UI di `src/`, lalu cek langsung di browser
(`npm run dev`, data Supabase live) pada **375×812, 768×1024, 1280×800**.
Kontras dihitung dengan rumus WCAG 2.x dari nilai token di `globals.css`.

> **Design read:** situs cari & review kos untuk mahasiswa Indonesia yang
> kebanyakan pakai HP. Nuansanya *trust-first* tapi ramah, dibangun di atas
> brand "Review Kos v5 Rounded" yang sudah ada. Mode: **redesign, brand tetap**
> (warna, logo, bentuk pill, dan font Plus Jakarta Sans dipertahankan).
>
> **Dial sekarang (perkiraan):** VARIANCE 3 · MOTION 4 · DENSITY 2–3
> (semua di tengah, banyak dekorasi yang bergerak saat scroll, jarak sangat lega).
> **Target (dari `ui-workflow.md`):** VARIANCE 4 · MOTION 3 · DENSITY 5.
> Artinya: **padatkan konten (terutama di HP), kurangi animasi dekoratif**,
> dan buat layout sedikit kurang simetris.

Kode masalah (`B-3`, `M-2`, dst.) dipakai lagi di tabel prioritas (bagian 4).

### Status perbaikan

**Fase 2a (25 Sep 2026), token selesai:**

| Kode | Status | Sisa pekerjaan |
|---|---|---|
| **G-1** | Sebagian | `muted` sudah digelapkan ke `#62677a` (4,77 di cream) dan otomatis berlaku di seluruh situs. Token `rose-deep` / `action` / `danger` (lolos AA) dan `field` (border ≥ 3:1) sudah ada. |
| **G-2** | Token siap | `text-display/title/heading`, dengan minimal 16px untuk body/input/tombol. |
| **G-3** | Token siap | `rounded-panel/media/box` + aturan pemakaiannya. |
| **G-4** | Token siap | `--color-map` dan `--shadow-control` sudah dipakai di `globals.css`. |
| **G-5** | Sebagian | Skala skor baru sudah aktif: teal ≥ 4,3, amber ≥ 3,5, `rose-deep` di bawahnya. |
| **M-1** | Token siap | Aturan minimal 16px sudah ada. |

**Fase 3a (25 Sep 2026), komponen dasar pakai token:**

| Kode | Status | Catatan |
|---|---|---|
| **G-1** | Selesai untuk kontrol | Semua tombol → `bg-action` (5,65:1). Teks error → `text-danger`. Border input → `border-field`. Sisa: eyebrow section masih `text-rose` (Fase 4). |
| **G-3** | Selesai | Tidak ada lagi radius arbitrary di `src/`. `--radius-card` dihapus. |
| **G-4** | Selesai | Hex sudah hilang dari komponen. Pin peta, `ScoreBadge`, dan `FacilityBar` sekarang memakai class token. |
| **M-1** | Selesai | Semua input/select/textarea 16px, termasuk search peta. |
| **M-2** | Sebagian | Tombol ≥ 44px (sm 44, md 48, lg 56), hamburger 44, tab masuk/daftar 44, select hero 48. Sisa: tombol zoom Leaflet 30px, link "← Semua kos", link teks di kartu hero (Fase 4/5). |
| **B-7** | Sebagian | Lubang kosong di kartu (highlights kosong) sudah hilang. Ilustrasi dan skor fasilitas menunggu Fase 4. |
| **G-2** | Sebagian | Komponen bebas `text-[Npx]`. Teks isi section dan judul section menunggu Fase 4. |

**Fase 3b (25 Sep 2026), state komponen:**

| Kode | Status | Catatan |
|---|---|---|
| **G-7** | Selesai | Ada satu aturan `:focus-visible` global (outline biru). Select di hero dan pill skor memakai `focus-ring-within`. Semua tombol, kartu, hamburger, tab, panah carousel, dan tombol × di search punya efek tekan (`:active`). Loading = spinner + `aria-busy`. Field sekarang punya state hover, fokus, `aria-invalid`, dan disabled. |
| **M-7** | Sebagian | Menu HP sekarang tertutup saat diketuk di luar. Animasi buka/tutup menunggu Fase 6. |

**Fase 4a Beranda (25 Sep 2026):**

| Kode | Status | Catatan |
|---|---|---|
| **B-1 / M-5** | Selesai | Section Masalah dan Cara menilai digabung jadi satu section "Cara kerja" (`#cara-kerja`). Di 375px halaman turun dari 9.254px ke ±6.750px, dan `#browse` mulai di ±4.500px (sebelumnya ±6.800px). |
| **B-3 / B-4** | Selesai | Tidak ada lagi 3 kartu kembar dan nomor 01–06. Masalah tampil sebagai daftar ringkas; tiap kriteria diwakili ikon lucide dengan warna kriterianya. Section Cara kerja setinggi 1.788px di 375px (sebelumnya 3.851px untuk dua section). |
| **B-2** | Selesai | Subteks hero ±22 kata tanpa em-dash, judul tanpa `<br>`, eyebrow berupa kalimat tanpa titik dekoratif. |
| **B-8** | Sebagian | Eyebrow dan label ganda di bagian Masuk dihapus, strip tagline pindah ke footer. Halaman login tersendiri + `?next=` (D-5) belum dikerjakan. |
| **G-6** | Selesai | Eyebrow tinggal 1 (hero). |
| **G-9** | Sebagian | Tidak ada lagi em-dash di teks yang tampil di `/`. Halaman detail menunggu pass-nya sendiri. |
| **G-10** | Selesai (di `/`) | Footer: tagline, link nav, kredit data OpenStreetMap. |
| **G-11 / M-6** | Selesai | Navbar sticky di bawah `lg`. Anchor diberi `scroll-mt`, z-index nav 1100 di atas peta, dan dialog tambah kos lewat portal. |
| **B-5** | Sebagian | Navbar sekarang punya link "Peta" (`#peta`). Pin yang bisa diklik ke halaman detail menunggu pass Listing. |

**Fase 4b Beranda (25 Sep 2026), verifikasi 375px + 1280px:**
- Avatar ilustrasi di kartu hero disembunyikan di bawah `sm`, karena membuat meta lokasi jadi 4 baris; sekarang 2.
- Judul section peta rata kiri, seperti semua section lain.
- Masih lolos: tinggi section = 1 layar di 1280×800, tidak ada overflow di 375px, halaman 6.709px.
- Dicatat untuk pass Listing: label "9 KOS DI PETA" (huruf kapital), ruang kosong di tengah kartu kos saat tinggi kartu disamakan, tombol ▶ menimpa kartu ketiga, dan copy "tidak bisa direnovasi".
- Diterima apa adanya: kolom kiri section Masuk terasa lega di 1280px setelah strip tagline pindah ke footer.

**Fase 4a Listing (25 Sep 2026), peta + Cari kos:**

| Kode | Status | Catatan |
|---|---|---|
| **B-5** | Selesai | Setiap pin punya popup (skor, harga, tombol "Lihat kos" ke halaman detail). Hint pindah dari atas peta ke baris legenda. Copy intro diganti "Ketuk pin untuk melihat skornya…". Clustering pin tidak dikerjakan; dengan 9 kos belum perlu. |
| **G-5** | Selesai | Legenda warna pin di bawah peta, dengan ambang dari `SCORE_HIGH`/`SCORE_MID`. |
| **M-3** | Selesai | Di layar sentuh peta awalnya terkunci (scroll halaman lewat). Ketuk untuk membuka, "Kunci peta" untuk mengunci lagi. |
| **M-4** | Selesai | Copy "Klik peta" hilang. Tooltip hover hanya muncul di perangkat yang bisa hover. |
| **B-6 / M-8** | Selesai | Filter terlipat di bawah `lg` (tanpa JS, otomatis terbuka kalau ada filter). Di 768px 3 kolom rapi. Carousel punya toolbar "1-3 dari 9", dan panah tidak lagi menimpa kartu. |
| **flyTo** | Selesai | Pencarian tempat melompat tanpa animasi saat reduced motion. |
| Sidebar | Selesai | Hanya tampil mulai `lg`; label huruf kapital jadi teks biasa. |

Hasil: di 375px halaman 6.709px → 5.952px. Tinggi peta di laptop 423px → 444px (1366×768) dan 576px (1440×900). Semua section tetap 1 layar di 1024/1280/1366/1440.

**Fase 4b Listing (25 Sep 2026), verifikasi 375px + 1280px (diukur lewat DOM karena browser pane tersembunyi):**
- **Bug diperbaiki:** tipe pointer dibaca sekali saat mount, sehingga peta bisa tetap terkunci di desktop. Sekarang dibaca live (`useSyncExternalStore`), jadi kunci dan tooltip ikut berubah saat perangkat berganti mouse/sentuh tanpa reload.
- Pill kunci: 40px → 44px, dan dinaikkan ke `bottom-6` supaya tidak menumpuk dengan atribusi Leaflet. Toast di HP naik ke `bottom-20`.
- Tombol zoom Leaflet di layar sentuh: 30px → 44px.
- Ringkasan filter di HP tidak lagi terpotong (2 baris, bukan ellipsis).
- Popup pin: auto-pan diberi padding supaya tidak masuk ke bawah kotak search. Auto-pan-nya sendiri tidak bisa diuji selama pane tersembunyi (rAF berhenti).
- Diterima apa adanya: tinggi kartu disamakan dalam carousel (harga sejajar), jadi kartu yang isinya pendek punya ruang ±45–65px sebelum harga.
- Masih lolos: tidak ada tap target < 44px di kedua section, tidak ada overflow, 1280×800 tetap 1 layar per section, peta dan sidebar sejajar.

**Fase 4a Detail kos (25 Sep 2026):**

| Kode | Status | Catatan |
|---|---|---|
| **D-1** | Selesai | Rata-rata fasilitas langsung setelah header. "Dari mana angka ini" pindah ke aside (di HP setelah rata-rata; di `lg` jadi kolom kanan yang sticky). |
| **D-2** | Selesai | Rata-rata memakai `FacilityBar` + angka, sama seperti kartu hero. |
| **D-3** | Selesai | Ilustrasi 200px → 140px di HP. Nama, harga, skor, dan tombol aksi masuk layar pertama (tombol berakhir di 639px pada layar 812px). |
| **D-4** | Selesai | Kartu Lokasi: link OpenStreetMap di koordinat kos + "Lihat di peta kkost" (`/?kota=…#peta`). |
| **D-5 / B-8** | Selesai | Login di tempat: `AuthCard` di `#tulis-review`. Setelah masuk, halaman ter-render ulang dengan form review. Server action tidak diubah. **Belum diuji dengan akun sungguhan.** |
| **D-6** | Selesai | Tombol "Tulis review" / "Masuk untuk menulis" di header (ke `#tulis-review`) + "Lihat lokasi". |
| **D-7** | Selesai | Skor per review jadi grid ringkas. Kartu review 424px → 319px di 375px. |
| Lainnya | Selesai | Link kembali 44px dengan ikon, label "DARI MANA ANGKA INI" jadi `h2` biasa, tidak ada em-dash di teks maupun `<title>` (termasuk judul global di `layout.tsx`), footer di halaman detail. |

**Fase 4b Detail kos (25 Sep 2026), verifikasi 375px + 1280px (lewat DOM, pane tersembunyi):**
- Tombol di header 96px di HP karena "Masuk untuk menulis" turun baris. Label jadi selalu "Tulis review" dan padding HP diperkecil, sekarang 48px, satu baris.
- **Bug sistemik ditemukan:** override `px-4` di argumen ketiga `buttonClass` kalah dari `px-7` bawaan ukuran (Tailwind mengurutkan CSS-nya sendiri). Override yang perlu diberi `!` (`px-4!`, `px-8!`, `text-sm!`); `px-4` yang tidak berpengaruh di dialog dan popup dihapus. Aturannya dicatat di `controls.ts` dan `06-conventions.md`.
- Kartu login di `lg`: 460px sendirian di kolom 820px. Sekarang 2 kolom mulai `md` (judul + penjelasan kiri, kartu kanan).
- Masih lolos: tidak ada teks terpotong (termasuk label di grid skor review 2 kolom), tidak ada tap target < 44px, tidak ada overflow. Aside 562px < tinggi layar, jadi sticky aman.

**Fase 4a Form (25 Sep 2026):**

| Kode | Status | Catatan |
|---|---|---|
| **F-1** | Selesai | Tab ARIA lengkap: `aria-controls`, `tabpanel`, roving tabindex, panah/Home/End. Tombol lihat/sembunyikan password (44px). "Minimal 8 karakter" jadi teks bantu tetap di mode Daftar (bukan placeholder). Tombol: "Masuk" / "Buat akun". Padding HP 32 → 24px. Transisi pergantian mode ditunda ke Fase 6. |
| **F-2** | Selesai | Progres "x dari 6 dinilai" + rata-rata sementara + bar (`scaleX`). Ikon kriteria + skala "Buruk … Sangat baik". Input file diganti kotak "Pilih foto" + thumbnail 93px dengan tombol hapus 44px (ikon X). Validasi sendiri ("Masih ada n fasilitas yang belum dinilai", fokus ke grup pertama yang kosong) menggantikan bubble browser. Kartu sukses dengan ikon, fokus otomatis, dan "Lihat review" → `#ulasan`. Animasinya ditunda ke Fase 6. |
| **F-3** | Selesai | Eyebrow uppercase dan koordinat mentah dihapus. Subjudul: "Kos langsung muncul di peta setelah disimpan." Tombol tutup X 44px di pojok. Petunjuk lokasi `text-xs` → `text-sm`. |

Bug yang ditemukan dan diperbaiki di fase ini:
- **Harga ditolak browser:** `type="number" step={50000}` membuat 975.000 ditolak dengan pesan bawaan browser (bahasa Inggris). Sekarang field teks numerik: "975000" dan "950.000" sama-sama lolos, dengan pratinjau "Rp950.000 / bulan". Harga awal kosong, bukan "0". `noValidate`, jadi semua pesan dari zod.
- **Kartu sukses review tidak pernah tampil:** revalidasi membalik `alreadyReviewed`, `page.tsx` mengganti cabang, dan `ReviewForm` ter-unmount. Sekarang `ReviewForm` memegang ketiga state. **Belum diuji dengan akun sungguhan** (checklist di `08-roadmap.md`).
- **Error nyasar mode:** error "Masuk" tetap tampil di tab "Daftar". Form sekarang di-key per mode; email yang sudah diketik tetap ada.
- Em-dash di copy ketiga form dan pesan pendaftaran (`auth-actions.ts`).

Verifikasi (DOM, 375/768/1280): tidak ada overflow, semua kontrol ≥ 44px, input 16px, panah/Home pada tab, email bertahan antar-tab, tombol mata mengganti `type`, progres dan rata-rata, batas 3 foto dan hapus, validasi lalu error server, dan radio tetap tercentang setelah reset form. Dialog tidak dikirim sungguhan (akan menulis ke database).

Yang masih harus dikerjakan:
- **Fase 4 (lainnya):** E-1, `error.tsx` tanpa Navbar/Footer dan `not-found.tsx` tanpa Footer.
- **Fase 4:**
  - G-5: legenda warna pin di peta.
  - Eyebrow `text-rose`.
  - Teks section (`text-[15px]`) dan judul section (`text-title`).

Detail token lengkap ada di `04-design-system.md`.

---

## 1. Masalah per halaman

### 1.1 Lintas halaman (berlaku di semua halaman)

**Kontras warna — gagal WCAG AA (4,5:1 untuk teks biasa)**

| Pasangan | Rasio | Dipakai di | Status |
|---|---|---|---|
| Putih di atas `rose` | **3,63** | Semua tombol utama (Cari, Terapkan, Masuk dan lanjutkan, Kirim review, Simpan kos). Teksnya 15–17px, jadi tidak termasuk "teks besar" | ❌ |
| `rose` di atas putih | **3,63** | Teks error, eyebrow `text-rose`, angka `01/02/03` | ❌ |
| `rose` di atas `cream` | **3,09** | Eyebrow "Masalahnya" | ❌ |
| `muted` di atas putih | **3,73** | Area/kota di kartu, jumlah review, "/ bulan", catatan kecil di form | ❌ |
| `muted` di atas `cream` | **3,17** | Placeholder input, label "Kota"/"Budget" di hero, link "← Semua kos" | ❌ |
| `cream-deep` di atas `cream` (border input) | 1,11 | Border semua input dan select | ❌ untuk batas komponen (minimal 3:1) |
| `ink`/`ink-soft` di atas cream/putih | 10+ | Teks utama | ✅ |
| `amber` ↔ `ink`, `blue` ↔ putih | 5,7–8 | Eyebrow CTA, badge mahasiswa | ✅ |

- **G-1 Kontras.** Warna aksi utama (`rose`) dan warna teks sekunder (`muted`)
  sama-sama di bawah AA. Karena dipakai di ratusan tempat, ini harus
  diselesaikan di **token** (Fase 2), bukan diperbaiki satu per satu.
- **G-2 Tidak ada skala tipografi.** Ada 9 ukuran font yang ditulis manual:
  `text-[15px]` ×56, `[13px]` ×10, `[17px]` ×7, `[22px]`, `[26px]`, `[28px]`,
  `[32px]`, `[11px]`, `[12px]`. Judul section pakai `clamp()` yang
  berbeda-beda (5vw, 5.5vw, 6.5vw), lalu ditimpa lagi dengan `lg:text-[3rem]` di
  sebagian section saja.
- **G-3 Radius tidak konsisten.** Ada 6 nilai: `full`, `--radius-panel` (32),
  `--radius-card` (28, cuma dipakai **1×**), `rounded-[22px]` (×6, hardcode),
  `rounded-2xl` (16, ×10), `rounded-[32px]` (×1, sama dengan panel tapi
  hardcode). Aturannya belum tertulis: kapan 22, kapan 16, kapan 28?
- **G-4 Warna hardcode di luar token.** Ada di `kos-map.tsx` (`#1c2a4e`,
  `#f93a5a`, `#3b59df`, `#ffffff`, bayangan `rgba(28,42,78,.55)`),
  `score-badge.tsx` (`#1c2a4e`, `#ffffff`), `map-frame.tsx` (`#eee9e1`, yang
  juga ditulis ulang di `globals.css`). Bayangan Leaflet juga ditulis manual,
  tidak memakai `--shadow-*`.
- **G-5 Satu warna, banyak arti.** `rose` berarti brand, tombol utama, **skor
  terbaik** (≥ 4,6), dan **error** sekaligus. `blue` berarti **skor terendah**
  (< 4,3), badge "mahasiswa terverifikasi", dan pesan info. Warna per kriteria
  (amber/rose/blue/sky/ink) di `#scoring` dan bar fasilitas tidak berhubungan
  dengan warna skor. Akibatnya pengunjung tidak bisa "membaca" warna. Di peta
  juga tidak ada legenda warna pin.
- **G-6 Eyebrow di setiap section.** Semua 6 section punya eyebrow pill,
  ditambah 5 label kecil huruf kapital lain (kartu login, sidebar peta, panel
  "Dari mana angka ini", dialog tambah kos, kartu "Masuk sebagai"). Total 11.
  Skill membatasi maksimal 1 per 3 section (= 2 untuk beranda). Iramanya jadi
  terasa template.
- **G-7 Tidak ada state `:active` dan `:focus-visible`.** Tombol hanya punya
  efek naik saat hover (`hover:-translate-y-0.5`), yang tidak ada di HP.
  Select di hero pakai `outline-none` **tanpa pengganti**, jadi pengguna
  keyboard tidak melihat fokus. Input lain hanya mengganti warna border ke
  rose (kontras border 1,11 → rose), dan itu lemah.
- **G-8 Ikon campur-campur.** `lucide-react` terpasang tapi tidak dipakai. Yang
  ada: SVG kaca pembesar buatan sendiri, dan karakter teks `‹ › × ← +` sebagai
  ikon.
- **G-9 Em-dash (—) di copy.** Ada ±20 teks yang terlihat pengguna memakai
  "—" (hero, impact, scoring, form, notice, provenance). Skill menganggap ini
  tanda "tulisan AI". Prioritas rendah, tapi murah diperbaiki saat halamannya
  di-redesign.
- **G-10 Tidak ada footer.** Halaman berhenti mendadak di section kuning. Tidak
  ada info tentang kkost, tautan, atau kredit data (OSM hanya di peta).
- **G-11 Navbar tidak sticky.** Di halaman yang panjangnya 9.254px (HP),
  satu-satunya cara kembali ke pencarian adalah scroll manual ke atas.

### 1.2 Beranda `/`

Urutan section: Navbar → Hero → `#dampak` → `#scoring` → peta (`#reviews`) →
`#browse` → `#login`.

- **B-1 Tugas utama ada di urutan ke-5.** Orang datang untuk *mencari kos*,
  tapi daftar kos (`#browse`) baru mulai di **±6.800px** pada HP, setelah dua
  section teks penuh (Masalah + Cara menilai). Hero memang punya form cari yang
  langsung melompat ke `#browse`, tapi pengunjung yang scroll biasa harus
  melewati ±4.000px teks dulu.
- **B-2 Hero.**
  - ✅ Split layout dan data asli (angka, kos unggulan, kutipan review) sudah
    bagus.
  - Subteks 37 kata (batas skill 20) dan memakai em-dash.
  - Eyebrow statistik pakai titik dekoratif dan pemisah `·` dua kali.
  - Di HP, select "Kota"/"Budget" tingginya 37px dan labelnya abu-abu
    (kontras 3,17).
  - Judul dipotong paksa dengan `<br>`, jadi pemotongan baris tidak mengikuti
    lebar layar.
- **B-3 `#dampak` (Masalahnya).**
  - Pola "3 kartu sama besar + nomor 01/02/03" (keduanya masuk daftar larangan
    skill).
  - Semua rata tengah, ditambah paragraf penutup tebal yang juga rata tengah.
    Jadi ada 4 blok teks berturut-turut tanpa satu pun visual.
  - Di 768px, 3 kolom terlalu sempit (±180px per kartu) sehingga teks turun
    per 2–3 kata.
- **B-4 `#scoring` (Cara menilai).**
  - Enam kriteria dengan lingkaran angka besar (110px di HP). **Tingginya
    2.266px di HP**, section terpanjang di situs, padahal isinya cuma 6 judul
    dan 6 kalimat.
  - Angka 01–06 hanya dekorasi, dan warna lingkarannya tidak punya arti
    (lihat G-5).
- **B-5 Peta (`id="reviews"`).**
  - ID anchor `reviews` padahal isinya peta. Navbar juga tidak punya link ke
    peta.
  - Pin di peta **tidak bisa diklik ke halaman detail**. Pin hanya
    menampilkan tooltip, jadi dari peta ke detail tidak ada jalan kecuali
    lewat sidebar.
  - Pada zoom nasional, pin di Jawa saling tumpuk (Jakarta, Bandung,
    Semarang). Belum ada clustering.
  - Pill "Klik peta untuk menambah kos — perlu masuk" selalu menutupi peta.
    Di HP, kolom search + pill memakan ±96px dari tinggi peta 440px.
  - Sidebar, pin peta, dan carousel `#browse` menampilkan **daftar kos yang
    sama tiga kali**. Di HP, sidebar menambah ±500px.
  - Copy "Jarak ke kampus adalah satu hal yang tidak bisa direnovasi" terdengar
    manis tapi tidak jelas maksudnya. Selain itu jarak hanya tersedia di kos
    seed.
- **B-6 `#browse` (Cari kos).**
  - Form filter mengulang form hero (kota + budget) ditambah urutan. Di HP ada
    3 select bertumpuk + tombol (±400px) sebelum kartu pertama.
  - Di 768px grid filter `sm:grid-cols-2` membuat "Urutkan" sendirian setengah
    lebar, jadi tidak seimbang.
  - Carousel horizontal di HP: hanya 1 kartu terlihat, tanpa indikator posisi
    (tidak ada titik atau "3/9"). Dengan 9+ kos, pengguna harus swipe 9×
    tanpa tahu sisa berapa.
  - Tombol ▶ di tablet/desktop menimpa tepi kartu terakhir yang terlihat.
- **B-7 Kartu kos (`KosCard`).**
  - Ilustrasi memakan 190px (±45% tinggi kartu) padahal **tidak membawa
    informasi**: hanya ada 4 adegan, dan kartu yang bersebelahan sering
    identik (Kos Bu Har dan Kos Puri Melati sama-sama rumah merah).
  - Pill "Ilustrasi" ditumpuk di atas gambar.
  - `highlights` kosong untuk kos dari database, jadi ada ruang kosong besar
    di tengah kartu (terlihat di 375px).
  - Kartu tidak menunjukkan satu pun skor fasilitas, padahal enam skor itulah
    inti produk.
- **B-8 `#login` (CTA + form).**
  - Eyebrow "MASUK UNTUK MENULIS" lalu di kartu ada label "MASUK UNTUK
    MENULIS" lagi, ditambah tab "Masuk" dan tombol "Masuk dan lanjutkan".
    Empat kali "masuk" dalam satu layar.
  - Tagline "Gratis mencari, gratis menilai. Seluruh Indonesia." di bawah logo
    adalah strip dekoratif.
  - Login hanya ada sebagai section beranda, tidak punya halaman sendiri
    (lihat D-5).

### 1.3 Detail kos `/kos/[id]`

- **D-1 Urutan informasi terbalik.** Setelah header langsung muncul panel
  teks "Dari mana angka ini" (meta, 5–7 baris), **baru kemudian** rata-rata
  per fasilitas. Penjelasan muncul sebelum data yang dijelaskan.
- **D-2 Rata-rata fasilitas tampil sebagai daftar polos** dengan garis di
  setiap baris. Di tempat lain (kartu hero, setiap review) datanya berupa bar.
  Satu data, dua bentuk.
- **D-3 Header.** Ilustrasi setinggi 200px mengisi layar pertama di HP. Nama,
  lokasi, harga, dan skor baru terlihat setelah gambar tanpa informasi itu.
  Ringkasan fasilitas tidak ada di atas.
- **D-4 Tidak ada peta lokasi kos**, padahal koordinatnya ada. Pengunjung
  tidak bisa melihat letak kos relatif terhadap kampus atau kota.
- **D-5 Alur "Masuk untuk menulis" memutus konteks.** Tombolnya ke `/#login`,
  yaitu ujung bawah beranda. Setelah login pengguna **tetap di beranda** dan
  harus mencari kos tadi lagi.
- **D-6 Form review ada di paling bawah**, setelah semua review. Tidak ada
  tombol "Tulis review" di dekat header.
- **D-7 Kartu review** mengulang 6 bar dengan track abu-abu di setiap review,
  sehingga halaman memanjang cepat. Belum ada urutan atau filter review.
- Link "← Semua kos" kecil, abu-abu (kontras 3,17), dan pakai karakter teks
  sebagai ikon.

### 1.4 Form

- **F-1 Kartu login/daftar** (`auth-card.tsx`): tab pakai
  `role="tablist"` tapi tanpa `tabpanel` atau navigasi panah. Pergantian mode
  tidak ada transisi. Placeholder "Rina A." dan "rina@email.com" oke, tapi
  kontras placeholder 3,17.
- **F-2 Form review** (`review-form.tsx`): skala 1–5 berupa radio, aksesibel.
  Masalahnya:
  - Tidak ada tanda progres (berapa dari 6 sudah diisi).
  - Input file masih tampilan bawaan browser.
  - Tombol "Hapus" foto kecil (±20px) tanpa ikon.
  - Pesan sukses mengganti form secara mendadak.
- **F-3 Dialog tambah kos** (`add-kos-dialog.tsx`): fokus, Esc, dan klik
  backdrop sudah benar. Tapi dialog muncul tanpa transisi, dan koordinat
  mentah (`-7.77123, 110.37…`) tampil sebagai subjudul. Informasi ini tidak
  berguna bagi pengguna.

### 1.5 Error & 404

- **E-1** `not-found.tsx` punya Navbar, sedangkan `error.tsx` tidak (hanya
  logo). Tidak konsisten. Kodenya sendiri sudah rapi dan pakai Bahasa
  Indonesia.

---

## 2. Masalah mobile

Diukur di 375×812. Total tinggi beranda **9.254px**:

| Section | Tinggi di 375px |
|---|---|
| Hero | 1.381 |
| `#dampak` | 1.585 |
| `#scoring` | **2.266** |
| Peta + sidebar | 1.461 |
| `#browse` | 1.287 |
| `#login` | 1.191 |

- **M-1 Input memicu zoom otomatis di iOS.** Safari melakukan zoom saat input
  yang ukuran fontnya < 16px difokuskan. **Semua** input dan select di kkost
  berukuran 15px, dan search peta 13px. Setiap kali pengguna iPhone mengetuk
  form, halaman ter-zoom dan harus di-pinch kembali.
- **M-2 Tap target < 44px:**
  - tombol hamburger 40×40
  - select hero tinggi 37
  - tombol zoom peta 30×30
  - tombol × di search peta ±28
  - tab Masuk/Daftar tinggi 40
  - tombol "Hapus" foto
  - link "← Semua kos"
- **M-3 Peta menjebak scroll.** Di HP, geser satu jari di atas peta (440px,
  lebih dari setengah layar) akan menggeser peta, bukan halaman. Pengguna yang
  sedang scroll ke bawah "tersangkut" di peta.
- **M-4 Teks bergantung pada hover/klik mouse.** Copy "**Klik** peta untuk
  menambah kos" (di HP seharusnya "Ketuk"). Nama kos di pin hanya ada di
  tooltip. Efek angkat saat hover di kartu dan tombol tidak ada padanannya di
  layar sentuh (tidak ada `:active`).
- **M-5 Halaman terlalu panjang dan tugas utama terlalu jauh** (lihat B-1,
  B-4). Sekitar 60% tinggi beranda di HP adalah teks penjelasan.
- **M-6 Tidak ada navigasi tetap.** Navbar ikut ter-scroll, tidak ada bottom
  nav, dan tidak ada tombol kembali ke atas atau ke pencarian (G-11).
- **M-7 Menu HP** tidak menutup saat pengguna mengetuk di luar menu (hanya
  lewat Esc atau saat memilih link), dan muncul tanpa transisi.
- **M-8 Carousel kos** di HP: 1 kartu per layar tanpa indikator posisi (B-6).
- **M-9 Detail kos di HP:** gambar 200px di layar pertama (D-3), dan tombol
  menulis review baru ditemukan di dasar halaman (D-6).
- **M-10 Detail kecil:**
  - `-webkit-tap-highlight-color` belum diatur, jadi ada kilatan abu-abu
    bawaan saat mengetuk kartu atau link.
  - Belum ada `env(safe-area-inset-*)`. Aman untuk sekarang karena belum ada
    elemen `fixed` di tepi layar, tapi wajib kalau nanti menambah sticky
    nav/CTA.
  - Kunci scroll dialog lewat `overflow: hidden` di `<html>` kadang tetap
    bocor di iOS Safari.
- ✅ Tidak ada horizontal overflow di 375, 768, maupun 1280.

---

## 3. Animasi

### 3.1 Yang sudah ada

| Animasi | Lokasi | Penilaian |
|---|---|---|
| `.reveal`: fade + naik 40px, **terikat posisi scroll** (`animation-timeline: view()`) | `#dampak`, `#scoring`, peta, `#browse`, `#login` | ⚠️ **Buruk.** Karena terikat scroll, bukan waktu, konten setengah transparan kalau pengguna berhenti scroll di tengah rentang. Jarak 40px terlalu jauh untuk MOTION 3. Efek ini juga dipasang di container form login, jadi form yang mau diisi masih bergerak dan memudar. |
| `.drift`: lingkaran dekoratif naik-turun ±40px mengikuti scroll | hero, peta, CTA | ⚠️ **Tidak punya tujuan.** Tidak menyampaikan hierarki atau status apa pun. Untuk target MOTION 3, hapus atau diamkan. |
| `.drift-page`: dua setengah `BoundaryCircle` bergerak + scale 0,9→1,1 mengikuti scroll halaman | 3 sambungan section | ⚠️ Sama seperti di atas. Scale pada elemen besar juga memicu repaint terus-menerus selama scroll di HP. |
| `hover:-translate-y-0.5 / -1` | tombol, kartu kos | ⚠️ Hanya hover, dan tidak ada efek ditekan (`:active`). Durasi dan easing bawaan Tailwind (150ms, `ease`), bukan token. |
| Ikon hamburger → X (`transition-transform`) | `MobileNav` | ✅ Oke. Tapi panel menunya muncul/hilang mendadak. |
| Smooth scroll saat klik `SectionLink` | navbar, CTA | ✅ Sudah menghormati `prefers-reduced-motion`. |
| Smooth `scrollBy` carousel | `KosCarousel` | ✅ Sudah menghormati `prefers-reduced-motion`. |
| Leaflet `flyTo` / `flyToBounds` setelah search tempat | `kos-map.tsx` → `FocusPlace` | ❌ **Tidak menghormati `prefers-reduced-motion`.** Melanggar aturan wajib di `CLAUDE.md`. |
| `prefers-reduced-motion` global | `globals.css` | ✅ `.reveal`/`.drift` sudah digate `no-preference` + `@supports`. |

Catatan: semua animasi yang ada sudah hanya memakai `transform`/`opacity`. ✅

### 3.2 Yang hilang (kandidat Fase 6, urut dari yang paling berguna)

1. **Feedback tekan (`:active` scale 0.97–0.98)** di semua tombol dan kartu.
   Ini satu-satunya feedback sentuh yang terasa di HP.
2. **Dialog tambah kos**: backdrop fade + panel scale/fade masuk dan keluar.
3. **Menu HP**: panel fade + turun sedikit, dan tutup saat mengetuk di luar.
4. **Toast "berhasil ditambahkan"** di peta: masuk/keluar, sekarang
   muncul/hilang mendadak.
5. **Pilihan skor 1–5 di form review**: transisi warna pill + progres "4/6
   dinilai".
6. **State sukses form review/login**: transisi, bukan penggantian mendadak.
7. **Dropdown search peta**: fade masuk.
8. **Loading peta**: skeleton yang bentuknya sama dengan peta, bukan teks
   "Memuat peta…".
9. **Tab Masuk/Daftar**: indikator yang bergeser.

Belum ada **motion tokens** (durasi dan easing). Semua transisi memakai
bawaan Tailwind. Ini dibuat di Fase 2.

---

## 4. Prioritas perbaikan

| # | Masalah | Prioritas | Dikerjakan di |
|---|---|---|---|
| G-1 | Kontras `rose` (tombol, error) dan `muted` (teks sekunder, placeholder) gagal AA | **Tinggi** | Fase 2 (token) |
| M-1 | Semua input < 16px → zoom otomatis di iOS | **Tinggi** | Fase 2 (skala tipe) + 3 |
| G-7 | Tidak ada `:focus-visible`, select hero tanpa indikator fokus, tidak ada `:active` | **Tinggi** | Fase 3 |
| B-1 / M-5 | Tugas utama (`#browse`) di ±6.800px pada HP, `#scoring` 2.266px | **Tinggi** | Fase 4 (Beranda) |
| M-3 | Peta menjebak scroll di HP | **Tinggi** | Fase 5 |
| B-5 | Pin peta tidak bisa dibuka ke halaman detail | **Tinggi** | Fase 4 (Listing) |
| M-2 | Tap target < 44px | **Tinggi** | Fase 3 + 5 |
| — | `flyTo` peta mengabaikan `prefers-reduced-motion` | **Tinggi** | Fase 5 atau 6 |
| D-5 | Login dari detail kehilangan konteks (tidak kembali ke kos) | **Tinggi** | Fase 4 (Form). Perlu keputusan: halaman `/masuk` terpisah + `?next=` |
| G-2, G-3, G-4 | Skala tipe, radius, dan warna hardcode | Sedang | Fase 2 |
| G-5 | Warna punya banyak arti, tidak ada legenda skor | Sedang | Fase 2 (putuskan semantik) + 4 |
| D-1, D-2, D-3, D-6 | Hierarki detail kos | Sedang | Fase 4 (Detail) |
| B-7 | Kartu kos: ilustrasi kosong informasi, ruang kosong, tanpa skor fasilitas | Sedang | Fase 3 (Card) |
| B-6 / M-8 | Carousel tanpa indikator, filter duplikat hero | Sedang | Fase 4 (Listing) |
| G-6 | Eyebrow di setiap section + label ganda | Sedang | Fase 4 |
| M-6 / G-11 | Tidak ada navigasi tetap di HP | Sedang | Fase 3 (Navbar/Bottom nav) |
| M-7 | Menu HP tidak menutup saat ketuk luar | Sedang | Fase 3 |
| 3.1 | `.reveal` terikat scroll, `.drift` tanpa tujuan | Sedang | Fase 6 |
| 3.2 | Transisi dialog/menu/toast/form hilang | Sedang | Fase 6 |
| D-4 | Tidak ada peta lokasi di detail | Sedang | Fase 4 (Detail) |
| G-8 | Ikon campur (teks glyph, SVG manual, lucide tak terpakai) | Rendah | Fase 3 |
| B-3, B-4 | Pola 3 kartu + nomor 01/02/03, semua rata tengah | Rendah | Fase 4 (Beranda) |
| G-9 | Em-dash di copy | Rendah | Fase 4 (per halaman) |
| G-10 | Tidak ada footer | Rendah | Fase 4 |
| F-1–F-3 | Detail form (progres, file input, koordinat mentah) | Rendah | ✅ Fase 4a Form |
| M-10 | Tap highlight, safe-area, scroll lock iOS | Rendah | Fase 5 |
| E-1 | `error.tsx` tanpa Navbar | Rendah | Fase 4 (lainnya) |
| — | Mode gelap belum ada | Rendah | Fase 2: **putuskan dulu** mau dibuat atau tidak. Brand-nya terang (cream) |

**Catatan yang perlu keputusanmu sebelum Fase 2:**

1. **Semantik warna skor.** Sekarang `rose` = skor terbaik. Kalau `rose` tetap
   jadi warna tombol dan error, skor sebaiknya memakai skala sendiri.
2. **Rose untuk tombol.** Supaya teks putih lolos AA, rose perlu digelapkan
   (±`#d91f45` atau lebih gelap), atau teks tombol dibuat ≥ 18,66px bold.
   Menggelapkan rose akan mengubah kesan brand sedikit.
3. **Dark mode:** buat atau lewati?

---

## 5. Daftar halaman/route

| Route | File | Isi |
|---|---|---|
| `/` | `src/app/page.tsx` | Beranda: Hero, `#dampak`, `#scoring`, peta (`#reviews`), `#browse`, `#login`. Query: `?kota=&harga=&urut=` (filter), `?konfirmasi=` (hasil konfirmasi email) |
| `/kos/[id]` | `src/app/kos/[id]/page.tsx` | Detail kos: header, "Dari mana angka ini", rata-rata fasilitas, daftar review, form review / ajakan masuk |
| `/auth/confirm` | `src/app/auth/confirm/route.ts` | Route handler tanpa UI. Memproses link email lalu redirect ke `/?konfirmasi=…` |
| 404 | `src/app/not-found.tsx` | "Kos ini tidak ditemukan" |
| Error | `src/app/error.tsx` | "Halaman ini gagal dimuat" |

**Belum ada:**
- halaman listing terpisah (listing = section `#browse`)
- halaman masuk/daftar sendiri (login = section `#login`)
- halaman tentang
- form booking/kontak (kkost memang tidak punya booking)

**Pemetaan ke Fase 4 di `ui-workflow.md`:**

| Di workflow | Di kkost |
|---|---|
| Beranda | Hero + `#dampak` + `#scoring` |
| Listing | `#browse` + section peta |
| Detail kos | `/kos/[id]` |
| Form booking/kontak | Form login/daftar + form review + dialog tambah kos |
| Lainnya | 404 + error |
