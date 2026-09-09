-- kkost berlaku untuk seluruh Indonesia, bukan satu kota.
--
-- Sebelumnya jarak dihitung otomatis dari satu titik tetap (kampus UGM) di
-- aplikasi. Titik acuan tunggal itu tidak berlaku lagi, jadi setiap kos kini
-- menyimpan kotanya sendiri dan nama kampus acuannya; `distance_m` diisi
-- penambah kos, bukan dihitung.
--
-- Jalankan di Supabase Dashboard -> SQL Editor, setelah 0002_reviews.sql.

alter table public.kos
  add column if not exists city   text,
  add column if not exists campus text;

-- Dipakai untuk filter dan pengelompokan per kota.
create index if not exists kos_city_idx on public.kos (city);

-- Catatan: `city` sengaja tetap nullable supaya baris lama tidak menggagalkan
-- migrasi. Setelah supabase/seed.sql dijalankan, semua baris punya kota dan
-- kolom ini bisa dijadikan NOT NULL:
--
--   alter table public.kos alter column city set not null;
