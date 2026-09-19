-- Batas isi tabel kos ditegakkan di database, bukan hanya di form.
--
-- Sampai 0007, satu-satunya validasi kos ada di AddKosDialog (zod, di browser).
-- Pengguna login bisa melewati form dan memanggil REST langsung:
--
--   1. price = -5, distance_m = 999999, nama sepanjang satu megabyte, atau
--      koordinat di Eropa — semuanya diterima.
--   2. Tidak ada jejak siapa yang menambah kos, jadi entri spam tidak bisa
--      ditelusuri ke akun mana pun.
--
-- Perbaikannya: CHECK constraint untuk setiap kolom isian, dan kolom
-- `created_by` yang diisi database dari session. Kolom itu sengaja TIDAK
-- masuk GRANT INSERT di 0006, jadi klien tidak bisa mengisinya sendiri —
-- nilainya selalu berasal dari default auth.uid().
--
-- Kolom yang nullable (baris lama sebelum 0001/0003) tetap lolos: CHECK
-- menganggap NULL lulus. Data live sudah diperiksa sebelum berkas ini ditulis
-- — 11 kos, tidak ada yang melanggar.
--
-- Jalankan di Supabase Dashboard -> SQL Editor, setelah 0007.

-- ─── 1. Batas isian ────────────────────────────────────────────────────────
-- Angkanya sama dengan skema zod di add-kos-dialog.tsx; ubah keduanya bersama.

alter table public.kos drop constraint if exists kos_name_length;
alter table public.kos add constraint kos_name_length
  check (char_length(name) between 3 and 120);

alter table public.kos drop constraint if exists kos_area_length;
alter table public.kos add constraint kos_area_length
  check (char_length(area) between 2 and 120);

alter table public.kos drop constraint if exists kos_city_length;
alter table public.kos add constraint kos_city_length
  check (char_length(city) between 2 and 80);

alter table public.kos drop constraint if exists kos_campus_length;
alter table public.kos add constraint kos_campus_length
  check (char_length(campus) between 2 and 120);

alter table public.kos drop constraint if exists kos_price_range;
alter table public.kos add constraint kos_price_range
  check (price between 1 and 100000000);

alter table public.kos drop constraint if exists kos_distance_range;
alter table public.kos add constraint kos_distance_range
  check (distance_m between 0 and 50000);

-- kkost mencakup seluruh Indonesia, tidak lebih. Kotak ini melingkupi Sabang
-- sampai Merauke dan Rote sampai Miangas, dengan sedikit kelonggaran.
alter table public.kos drop constraint if exists kos_in_indonesia;
alter table public.kos add constraint kos_in_indonesia
  check (
    (lat is null and lng is null)
    or (lat between -11.5 and 6.5 and lng between 94 and 141.5)
  );

-- ─── 2. Siapa yang menambah kos ────────────────────────────────────────────
-- NULL untuk baris seed dan baris lama. Menghapus akun tidak menghapus kosnya:
-- kos adalah data bersama, dan review orang lain menempel padanya.

alter table public.kos
  add column if not exists created_by uuid
    default auth.uid()
    references public.profiles (id) on delete set null;

create index if not exists kos_created_by_idx on public.kos (created_by);

-- Ditegaskan ulang: created_by tidak ada di daftar ini, jadi tidak bisa
-- ditulis klien. Sama persis dengan 0006 bagian 1.
revoke insert, update on public.kos from anon, authenticated;
grant insert (name, area, city, campus, price, distance_m, lat, lng)
  on public.kos to authenticated;

-- Policy insert kini juga memastikan barisnya milik penulisnya. Dengan grant
-- di atas nilainya selalu dari default, tetapi policy adalah batas yang
-- dibaca orang — ia harus menyatakannya sendiri.
drop policy if exists kos_insert_authenticated on public.kos;
create policy kos_insert_authenticated on public.kos
  for insert to authenticated
  with check ((select auth.uid()) = created_by);
