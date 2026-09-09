-- Kolom yang dibutuhkan fitur "tambah kos lewat klik peta".
-- Tabel `kos` awalnya hanya punya: id, name, created_at.
--
-- Jalankan di Supabase Dashboard → SQL Editor.

alter table public.kos
  add column if not exists area        text,
  add column if not exists price       integer,
  add column if not exists distance_m  integer,
  add column if not exists lat         double precision,
  add column if not exists lng         double precision,
  add column if not exists score       numeric(2,1) not null default 0,
  add column if not exists reviews     integer      not null default 0;

-- Baris lama (Kos Mas Amba, dll.) belum punya nilai ini, jadi kolomnya
-- sengaja dibiarkan nullable supaya migrasi tidak gagal. Setelah data lama
-- dilengkapi, kolom di bawah ini bisa dijadikan NOT NULL:
--
--   alter table public.kos
--     alter column area       set not null,
--     alter column price      set not null,
--     alter column distance_m set not null,
--     alter column lat        set not null,
--     alter column lng        set not null;

-- Jaga-jaga agar koordinat tetap masuk akal
alter table public.kos
  drop constraint if exists kos_lat_lng_valid;

alter table public.kos
  add constraint kos_lat_lng_valid check (
    (lat is null and lng is null)
    or (lat between -90 and 90 and lng between -180 and 180)
  );

create index if not exists kos_lat_lng_idx on public.kos (lat, lng);
