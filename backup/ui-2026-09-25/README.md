# Backup UI — 25 September 2026

Salinan utuh UI kkost **sebelum dirombak**. Hanya untuk referensi/pemulihan —
folder ini tidak ikut di-compile (dikecualikan di `tsconfig.json` dan
`eslint.config.mjs`).

- Diambil dari commit `88e5694` (branch `ui-h-1`), working tree bersih.
- Kondisi saat backup: `npm run lint`, `npx tsc --noEmit`, `npm run build`
  semuanya bersih. Versi ini yang live di <https://kkost.vercel.app>
  per 25 Sep 2026.

## Isi

| Path | Isi |
|---|---|
| `src/` | Seluruh `src/` — app routes, komponen, `globals.css` (token Tailwind v4), plus `lib/`, `data/`, `store/`, `utils/` supaya UI bisa dipulihkan dengan logika yang cocok |
| `public/` | Aset statis |
| `next.config.ts`, `postcss.config.mjs` | Config yang memengaruhi styling/gambar |
| `docs/04-design-system.md` | Token warna, radius, bayangan, sistem aksen, primitif UI — versi saat backup |
| `docs/05-file-map.md` | Peta file saat backup |

## Cara memulihkan

Pulihkan semua UI (menimpa `src/` sekarang — cek `git diff` dulu):

```bash
rm -rf src && cp -R backup/ui-2026-09-25/src src
```

Pulihkan satu file saja, mis. hero:

```bash
cp backup/ui-2026-09-25/src/components/sections/hero.tsx src/components/sections/hero.tsx
```

Alternatif lewat git (tanpa folder ini): `git checkout 88e5694 -- src`.

Setelah memulihkan: `npm run lint && npx tsc --noEmit && npm run build`.
Kalau `lib/` atau skema database berubah sesudah backup, komponen lama mungkin
perlu disesuaikan.
