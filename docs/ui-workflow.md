# Alur Kerja UI/UX & Animasi — kkost

Skill: `design-taste-frontend` (Leonxlnx), `emil-design-eng`, `animate`, `mobile-native`, `review-animations` (Emil Kowalski).

Ganti bagian `[kurung]` sesuai project. Jalankan langkah **berurutan**, satu prompt per kirim.

## Cara ganti mode

| | CLI (terminal VS Code) | Desktop (tab Code) |
|---|---|---|
| Ganti mode | `Shift+Tab` (lihat indikator di bawah input) | Selector di samping tombol kirim |
| Bersihkan konteks | `/clear` | `Cmd/Ctrl+N` (sesi baru) |

**Alur Plan mode:** kirim prompt di Plan → baca rencana → setujui → pindah ke Accept edits → Claude eksekusi.

## Aturan commit

**Semua commit dilakukan manual oleh kamu.** Claude tidak boleh menjalankan `git commit`, `git push`, `git merge`, atau `git reset`. Aturan ini dikunci di 2 tempat:

1. `.claude/settings.json` — memblokir perintahnya (lihat Persiapan).
2. `CLAUDE.md` — memberi tahu Claude aturannya (Fase 0).

Setiap tanda ✅ **commit** di bawah = kamu jalankan sendiri di terminal kedua:

```bash
git add -A && git commit -m "ui: fase X - ringkasan"
```

## Persiapan (terminal, sekali saja)

```bash
git checkout -b ui-revamp
```

Buat `.claude/settings.json` di root project (kalau file sudah ada, gabungkan bagian `permissions.deny`):

```json
{
  "permissions": {
    "deny": [
      "Bash(git commit:*)",
      "Bash(git push:*)",
      "Bash(git merge:*)",
      "Bash(git reset:*)",
      "Bash(git rebase:*)"
    ]
  }
}
```

---

## Fase 0 — Setup konteks

**Mode: Accept edits**

```
Analisis struktur project ini lalu buat/perbarui CLAUDE.md berisi:
- Deskripsi: kkost, website pencarian kost untuk mahasiswa, mayoritas akses via HP
- Stack, struktur folder, dan cara menjalankan dev server
- Aturan UI: mobile-first (375px, 768px, 1280px), animasi halus & cepat,
  wajib hormati prefers-reduced-motion
- Aturan kode: pakai design tokens, jangan hardcode warna/spacing
- Aturan git: JANGAN PERNAH menjalankan git commit, push, merge, reset,
  atau rebase. Semua commit dilakukan manual oleh user. Setelah selesai
  mengerjakan sesuatu, cukup sarankan pesan commit-nya.
Jangan ubah file lain.
```

✅ Cek isi CLAUDE.md → commit (manual): `git add -A && git commit -m "ui: fase 0 - claude.md"` → `/clear`

---

## Fase 1 — Audit

**Mode: Accept edits**

```
/design-taste-frontend audit seluruh UI kkost. Jangan ubah kode.
Tulis hasilnya ke docs/ui-audit.md berisi:
1. Masalah per halaman (layout, hierarchy, tipografi, spacing, konsistensi)
2. Masalah mobile
3. Animasi yang ada: mana yang buruk, mana yang hilang
4. Prioritas perbaikan (tinggi/sedang/rendah)
5. Daftar semua halaman/route yang ada
```

✅ Baca audit, hapus/koreksi poin yang tidak setuju → commit (manual) → `/clear`

---

## Fase 2 — Design tokens

### 2a. Buat tokens — **Mode: Plan → setujui → Accept edits**

```
/design-taste-frontend berdasarkan docs/ui-audit.md, buat design system kkost:
warna (termasuk dark mode jika relevan), skala tipografi, spacing, radius,
shadow, dan motion tokens (durasi + easing).
Kesan yang diinginkan: [bersih, terpercaya, ramah mahasiswa].
Dial: VARIANCE 4, MOTION 3, DENSITY 5.
Simpan di [src/styles/tokens.css / tailwind config].
```

### 2b. Review tokens — **Mode: Accept edits**

```
/emil-design-eng review motion tokens dan shadow/border yang baru dibuat.
Perbaiki jika ada yang tidak sesuai prinsipmu.
```

✅ Cek hasil di browser. **Ini fondasi — pastikan kamu suka sebelum lanjut.** → commit (manual) → `/clear`

---

## Fase 3 — Komponen dasar

### 3a. Refactor — **Mode: Accept edits**

```
/design-taste-frontend refactor komponen dasar agar memakai design tokens:
Button, Input, Card kost, Navbar, [Bottom nav mobile], Badge harga/fasilitas.
Lokasi: [src/components]. Jangan ubah API/props komponen.
```

### 3b. Polish — **Mode: Accept edits**

```
/emil-design-eng polish komponen tersebut: hover, active (terasa ditekan),
focus-visible, disabled, dan loading state. Jangan ubah API/props komponen.
```

✅ Jalankan build → commit (manual) → `/clear`

---

## Fase 4 — Redesign per halaman

Ulangi 4a–4b untuk tiap halaman. Urutan: **Beranda → Listing → Detail kost → [Form booking/kontak] → lainnya** (lihat daftar di `docs/ui-audit.md`).

### 4a. Redesign — **Mode: Plan → setujui → Accept edits**

```
/design-taste-frontend redesign halaman [Beranda] ([path file]).
Ikuti docs/ui-audit.md, design tokens, dan komponen dasar yang sudah ada.
Mobile-first. Fokus: [hierarchy info kost (foto, harga, lokasi, fasilitas)
mudah dipindai]. Jangan ubah logic/data fetching.
```

### 4b. Verifikasi — **Mode: Accept edits**

Desktop:
```
Preview halaman [Beranda] di viewport 375px dan 1280px, screenshot,
lalu perbaiki yang masih janggal.
```

CLI: cek manual via browser dev tools (device toolbar), lalu:
```
Di halaman [Beranda], perbaiki: [tulis masalah yang kamu lihat].
```

✅ Commit per halaman (manual) → `/clear` → halaman berikutnya

---

## Fase 5 — Mobile pass

**Mode: Accept edits**

```
/mobile-native cek seluruh halaman kkost untuk masalah mobile:
100vh, input yang memicu zoom, safe area, tap highlight, hover di touch device,
ukuran tap target, dan scroll. Perbaiki semua temuan.
```

✅ Tes di HP asli (buka via IP lokal, mis. `http://192.168.x.x:3000`) → commit (manual) → `/clear`

---

## Fase 6 — Animasi

**Mode: Plan → setujui → Accept edits**

```
/animate identifikasi bagian kkost yang benar-benar butuh animasi
(maksimal 5 prioritas), jelaskan alasannya, lalu implementasikan.
Kandidat: card kost muncul, buka detail kost, filter/sort, modal/sheet,
feedback tombol simpan/favorit. Gunakan motion tokens yang sudah ada.
```

✅ Coba semua animasi di browser & HP → commit (manual) → `/clear`

---

## Fase 7 — Review & QA

### 7a. Review — **Mode: Accept edits**

```
/review-animations review semua animasi di kkost.
```

### 7b. Terapkan — **Mode: Accept edits**

```
Terapkan semua perbaikan dari tabel review tadi.
```

### 7c. Cek akhir — **Mode: Accept edits**

```
Cek akhir: prefers-reduced-motion berjalan, tidak ada layout shift,
animasi hanya pakai transform/opacity, kontras warna lolos WCAG AA.
Jalankan build. Laporkan yang gagal lalu perbaiki.
```

✅ Commit (manual) → merge ke main (manual):

```bash
git checkout main && git merge ui-revamp
```

---

## Ringkasan mode

| Langkah | Mode |
|---|---|
| 0, 1, 2b, 3a, 3b, 4b, 5, 7a–7c | Accept edits |
| 2a, 4a, 6 | Plan → setujui → Accept edits |

## Checklist progres

- [ ] Fase 0 — CLAUDE.md
- [ ] Fase 1 — docs/ui-audit.md
- [ ] Fase 2 — Design tokens
- [ ] Fase 3 — Komponen dasar
- [ ] Fase 4 — Beranda
- [ ] Fase 4 — Listing
- [ ] Fase 4 — Detail kost
- [ ] Fase 4 — [Halaman lain]
- [ ] Fase 5 — Mobile pass
- [ ] Fase 6 — Animasi
- [ ] Fase 7 — Review & QA
