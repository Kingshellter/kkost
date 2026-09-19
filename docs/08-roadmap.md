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
0001–0010 terpasang). Jangan menambah hardening keamanan lagi sebelum langkah
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
- [ ] Migrasi **tidak perlu** dijalankan ulang: 0001–0010 sudah terpasang di
      database live.

## 1. Dua pengaturan di dashboard Supabase (±5 menit, tanpa kode)

Butuh akses pemilik proyek Supabase. Menu **Authentication**:

- [~] **Leaked password protection** — tidak bisa: fitur ini hanya ada di
      paket Pro Supabase, proyek ini paket FREE. Ini satu-satunya temuan
      linter keamanan yang tersisa (`auth_leaked_password_protection`); sebut
      sebagai batasan yang diketahui bila juri bertanya.
- [x] **Confirm email** dinyalakan, SMTP Gmail diisi, Site URL diatur
      (19 Sep 2026). Kode: `/auth/confirm` + `emailRedirectTo`; lencana
      diganti "Mahasiswa terverifikasi".
- [x] **URL Configuration → Redirect URLs**: `http://localhost:3000/**`
      ditambahkan (19 Sep 2026).
- [ ] **Setelah deploy**: tambahkan juga `https://<url-live>/**` ke Redirect
      URLs, dan ganti **Site URL** ke URL live. Tanpa ini tautan konfirmasi
      yang diterima juri mengarah ke localhost.
- [x] Uji ujung-ke-ujung (lolos 19 Sep 2026): daftar dengan email sungguhan → surel dari
      "kkost" masuk → klik tautan → kembali ke situs dengan pesan "Email
      terkonfirmasi — kamu sudah masuk".

## 2. Uji satu perbaikan yang belum diverifikasi (±10 menit)

Kodenya sudah ditinjau dan sesuai pola; yang belum adalah uji manual dengan
akun sungguhan (agen tidak boleh membuat akun atau memasukkan kata sandi).

- [ ] **Form review mempertahankan pilihan setelah error.** Masuk, buka kos
      yang sudah pernah kamu review lewat URL langsung — atau review satu kos,
      lalu kirim lagi dari tab lain yang masih memuat form. Server menolak
      ("sudah menulis review"). Harapan: keenam skor tetap terpilih dan
      catatan tetap ada, dan tombol kirim tidak diblokir validasi browser.
      Jika gagal, lihat `ScoreInput` di `src/components/review/review-form.tsx`
      dan aturan "React 19 resets a form" di `06-conventions.md`.

## 3. Foto dalam review — jalankan 0010 dan uji (±20 menit)

Sejak 19 Sep 2026 foto adalah **bukti milik review**, bukan foto kos: penulis
melampirkan hingga 3 foto saat menulis review, dan foto hanya tampil di kartu
review itu. Kodenya selesai; `0009` (foto kos) sudah terpasang dan
digantikan `0010`.

- [x] Tempel `supabase/migrations/0010_review_photos.sql` ke **SQL Editor** dan
      jalankan. Ini **menghapus** tabel `kos_photos` beserta satu foto uji
      coba di dalamnya. *(Selesai 19 Sep 2026, diverifikasi di database live.)*
- [x] Hapus bucket lama `kos-photos` dari dashboard **Storage**.
      *(Selesai 19 Sep 2026.)*
- [x] Jalankan linter Supabase (Security **dan** Performance). *(Tidak ada
      temuan baru.)*
- [ ] Masuk, buka kos yang **belum** kamu review, isi skor, pilih 1–3 foto JPG
      < 2 MB, kirim → foto muncul di kartu review-mu.
- [ ] Uji penolakan: pilih `.gif` atau berkas > 2 MB → pesan galat berbahasa
      Indonesia sebelum dikirim.
- [ ] Setelah lolos, hapus kalimat "has not been tested yet" di
      `01-overview.md`.

## 4. Sebelum submit (wajib — pengumpulan BATCH II ditutup 27 September 2026)

- [ ] **Deploy.** Guidebook (bagian F, Lampiran proposal) meminta
      "Link Website/Demo". Mis. Vercel: impor repo, isi dua env var, deploy.
      `next.config.ts` membaca `NEXT_PUBLIC_SUPABASE_URL` saat build untuk
      mengizinkan gambar dari bucket — env var harus ada **sebelum** build.
- [ ] Uji alur penuh di URL live: daftar, masuk, tambah kos, tulis review,
      tulis review dengan foto, cari tempat, filter, buka `/kos/salah` (harus 404 Indonesia).
- [ ] README akar bagian **Tim**: isi nama ketua dan anggota (masih `—`).
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` — terakhir bersih
      pada 19 September 2026; ulangi setelah perubahan apa pun.
- [ ] Siapkan skenario demo/presentasi: masalah (hero: "Iklan kos ditulis
      pemiliknya") → solusi → tunjukkan bagian `#trust` dan panel "Dari mana
      angka ini" sebagai jawaban atas tema.

## Selesai 19 September 2026 (untuk konteks; hapus setelah dibaca)

Audit HP 375/768px (map fit di bawah kotak cari, tinggi peta HP 440px, harga
tidak terpotong, titik pemisah CTA), hero dibuka dengan masalahnya dan klaim
"mahasiswa yang benar-benar membayar sewanya" dihapus karena tidak
terverifikasi, tiga bug kecil di peta, fitur foto (kode + 0009), focus trap
dialog, header keamanan, halaman error & 404 berbahasa Indonesia. Semua
tercatat di `01-overview.md`.
