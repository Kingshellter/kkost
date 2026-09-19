# 08 · Roadmap — apa yang dikerjakan selanjutnya, berurutan

Ditulis 19 September 2026 sebagai serah-terima. Kerjakan **dari atas ke bawah**:
urutannya mengikuti bobot penilaian tahap penyisihan SWITCHFEST 2026, dari
yang paling menambah nilai per usaha.

| Kriteria penilaian | Bobot |
|---|---|
| User Interface & User Experience (UI/UX) | **25%** |
| Kejelasan Permasalahan dan Solusi | **20%** |
| Kreativitas | 15% |
| Fungsi dan Fitur Web | 15% |
| Kesesuaian dengan Tema | 15% |
| Pemanfaatan Teknologi Terkini | 10% |

**Kesesuaian Tema sudah kuat** (jaminan integritas di database, migrasi
0001–0008 terpasang). Jangan menambah hardening keamanan lagi sebelum langkah
UI/UX di bawah selesai — nilainya kecil dibanding usahanya.

Centang `[x]` setiap langkah yang selesai, dan hapus langkahnya dari berkas
ini begitu tercermin di `01-overview.md`.

---

## 0. Persiapan (sekali, ±15 menit)

- [ ] `git pull`, lalu `npm install`.
- [ ] Salin `.env.example` → `.env.local`, isi dua variabel Supabase (minta ke
      pemilik proyek Supabase `Project-kkost`).
- [ ] `npm run dev`, buka <http://localhost:3000>.
- [ ] Baca [README.md](README.md) (docs) → `01-overview.md` → `06-conventions.md`.
      Aturan terpenting: **setiap perubahan kode wajib memperbarui `docs/`**
      (lihat `07-maintaining-these-docs.md`), dan Next.js di sini versi 16 —
      baca `node_modules/next/dist/docs/` sebelum memakai API yang asing.
- [ ] Migrasi **tidak perlu** dijalankan ulang: 0001–0008 sudah terpasang di
      database live.

## 1. Dua pengaturan di dashboard Supabase (±5 menit, tanpa kode)

Butuh akses pemilik proyek Supabase. Menu **Authentication**:

- [ ] Nyalakan **Leaked password protection**. Ini satu-satunya temuan linter
      keamanan yang tersisa (`auth_leaked_password_protection`).
- [ ] Putuskan soal **Confirm email**. Saat ini mati, sehingga siapa pun bisa
      mendaftar dengan alamat `.ac.id` milik orang lain dan mendapat lencana
      "penghuni terverifikasi" — bertentangan dengan tema. Menyalakannya
      menutup celah itu; alur daftar sudah menangani pesan "cek email kamu".
      Konsekuensinya: README bagian setup menyuruh *mematikan* opsi ini —
      ubah juga kalimat itu, dan hapus poin ⚠️ `is_student` di `01-overview.md`.

## 2. Uji satu perbaikan yang belum diverifikasi (±10 menit)

- [ ] **Form review mempertahankan pilihan setelah error.** Masuk, buka kos
      yang sudah pernah kamu review lewat URL langsung — atau review satu kos,
      lalu kirim lagi dari tab lain yang masih memuat form. Server menolak
      ("sudah menulis review"). Harapan: keenam skor tetap terpilih dan
      catatan tetap ada, dan tombol kirim tidak diblokir validasi browser.
      Jika gagal, lihat `ScoreInput` di `src/components/review/review-form.tsx`
      dan aturan "React 19 resets a form" di `06-conventions.md`.

## 3. Audit tampilan HP — UI/UX 25% (±1–2 jam)

Uji di lebar **375px** (DevTools → mode perangkat, iPhone SE/12) dan 768px.

- [ ] Navbar + menu mobile (`mobile-nav.tsx`).
- [ ] Hero: judul, form cari kota/budget, kartu hero.
- [ ] `#dampak`, `#scoring`, `#trust`.
- [ ] Peta: kotak pencarian tempat, petunjuk "klik peta", sidebar, tombol zoom.
- [ ] Dialog "Tambah kos" — bisa di-scroll, keyboard HP tidak menutupi tombol.
- [ ] Grid browse + filter.
- [ ] Bagian login/daftar (`#login`).
- [ ] Halaman detail `/kos/[id]`: banner ilustrasi, header, form review.

Perbaiki yang rusak. Tidak boleh ada scroll horizontal di halaman.

## 4. Pertajam "masalah → solusi" — 20% (±1 jam, kebanyakan copywriting)

- [ ] Juri harus menangkap *masalahnya* dalam 10 detik pertama di halaman
      utama. Tinjau hero dan bagian `#dampak` (`hero.tsx`, `impact.tsx`,
      teks di `PROBLEMS` dan `SDG_GOALS` dalam `src/data/kos.ts`).
- [ ] Pastikan setiap klaim di halaman benar dan bisa dibuktikan — lihat
      "Claims about integrity" di `06-conventions.md`. Jangan menambah angka
      statistik tanpa sumber.

## 5. Bug kecil yang tersisa (±1 jam)

- [ ] **Kos baru mengabaikan filter URL.** `mergeKos` di
      `src/store/kos-store.ts` menambahkan kos hasil klik peta ke peta dan
      sidebar walaupun tidak cocok dengan `?kota=` / `?harga=`. Terapkan
      filter yang sama ke daftar `added`.
- [ ] **Notifikasi simpan kedua hilang terlalu cepat.** `setTimeout` di
      `handleSaved` (`src/components/map/kos-map.tsx`) tidak pernah di-clear;
      simpan dua kos dalam 6 detik → notifikasi kedua ikut hilang. Simpan id
      timer di `useRef`, clear sebelum memasang yang baru dan saat unmount.
- [ ] **Link 404 dalam mode tanpa Supabase.** Kos yang dibuat tanpa
      kredensial ber-id `local-…`; link-nya di sidebar menuju 404. Jangan
      jadikan link untuk id `local-`.

## 6. Upload foto lewat Supabase Storage — UI/UX + Fitur (±1 hari)

Saat ini setiap kos memakai ilustrasi SVG berlabel "Ilustrasi"
(`src/components/ui/kos-photo.tsx`). Semua gambar kos lewat komponen itu, jadi
tidak ada pemanggil yang perlu diubah.

- [ ] **Migrasi `0009_kos_photos.sql`** (ditulis di repo, dijalankan manual di
      SQL Editor):
      - bucket Storage `kos-photos`, publik untuk dibaca;
      - kolom `kos.photo_path text` — atau tabel `kos_photos` kalau ingin lebih
        dari satu foto per kos;
      - policy Storage: unggah hanya `authenticated`, batasi tipe (jpeg/png/
        webp) dan ukuran (mis. 2 MB); tidak ada yang boleh menghapus foto
        unggahan orang lain;
      - hak kolom mengikuti pola 0006/0008 — `photo_path` hanya boleh diisi
        lewat jalur yang disengaja, bukan update bebas.
- [ ] Form unggah — di dialog tambah kos dan/atau halaman detail.
- [ ] `KosPhoto`: tampilkan `<img>` / `next/image` jika `photo_path` ada;
      ilustrasi tetap jadi cadangan. Label "Ilustrasi" hanya untuk ilustrasi.
- [ ] `next.config.ts`: `images.remotePatterns` untuk domain
      `lznureigcxhlpxfdynuu.supabase.co`.
- [ ] Jalankan linter Supabase (security + performance) setelah migrasi.
- [ ] Dokumentasikan 0009 di `03-data-model.md` dan tabel migrasi di
      README; pindahkan "Real photos" di `01-overview.md` ke "works today".

## 7. Polesan kecil (kerjakan hanya jika waktu cukup)

- [ ] Aksesibilitas `AddKosDialog`: focus trap, dan fokus kembali ke peta
      saat ditutup.
- [ ] Header keamanan dasar di `next.config.ts` (`headers()`:
      `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`). CSP
      penuh tidak perlu — peta memuat tile dan Nominatim dari luar, CSP yang
      salah justru merusak demo.
- [ ] Halaman `src/app/error.tsx` berbahasa Indonesia. Sejak `fetchKos`
      melempar error saat database gagal, pengunjung melihat halaman error
      bawaan Next.

## 8. Sebelum submit (wajib, ±1 jam)

- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` — semua bersih.
- [ ] Cek guidebook: apakah butuh URL live? Jika ya, deploy (mis. Vercel),
      isi dua env var di sana, lalu uji alur penuh di URL live: daftar, masuk,
      tambah kos, tulis review, cari tempat, filter.
- [ ] README akar: bagian setup, tabel migrasi, daftar fitur, dan bagian
      **Tim** sudah benar.
- [ ] `01-overview.md` → bagian "What does NOT exist yet" jujur dan terbaru.
- [ ] Siapkan skenario demo/presentasi: masalah → solusi → tunjukkan bagian
      `#trust` dan panel "Dari mana angka ini" sebagai jawaban atas tema.
