-- Fitur review: enam skor fasilitas per penghuni, satu review per kos per orang.
-- Skor kos = rata-rata dari rata-rata setiap review (tanpa bobot), dihitung
-- ulang oleh trigger supaya `kos.score` dan `kos.reviews` selalu konsisten.
--
-- PRASYARAT: jalankan 0001_kos_location_fields.sql lebih dulu.
-- Jalankan di Supabase Dashboard -> SQL Editor.

-- ─── profiles ──────────────────────────────────────────────────────────────
-- auth.users tidak bisa dibaca klien, jadi identitas publik penulis review
-- disimpan di sini. Diisi otomatis saat user mendaftar (trigger di bawah).

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  -- Email kampus (.ac.id) menandai review sebagai "penghuni terverifikasi".
  is_student   boolean     not null default false,
  created_at   timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, is_student)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.email like '%.ac.id'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── reviews ───────────────────────────────────────────────────────────────
-- Enam kolom skor, satu per kriteria di docs/01-overview.md. Disimpan terpisah
-- (bukan JSON) supaya bisa di-query, di-index, dan dirata-rata di database.

create table if not exists public.reviews (
  id         uuid primary key default gen_random_uuid(),
  kos_id     uuid not null references public.kos (id)      on delete cascade,
  author_id  uuid not null references public.profiles (id) on delete cascade,

  room      smallint not null check (room     between 1 and 5),
  bathroom  smallint not null check (bathroom between 1 and 5),
  water     smallint not null check (water    between 1 and 5),
  wifi      smallint not null check (wifi     between 1 and 5),
  kitchen   smallint not null check (kitchen  between 1 and 5),
  parking   smallint not null check (parking  between 1 and 5),

  -- Rata-rata satu review. Generated column: tidak mungkin melenceng dari
  -- keenam skor di atas karena tidak pernah ditulis tangan.
  average numeric(2,1) generated always as (
    round((room + bathroom + water + wifi + kitchen + parking)::numeric / 6, 1)
  ) stored,

  body       text check (char_length(body) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- "Satu review per kos, per masa sewa."
  unique (kos_id, author_id)
);

create index if not exists reviews_kos_id_idx     on public.reviews (kos_id);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

-- ─── agregasi skor ─────────────────────────────────────────────────────────
-- kos.score / kos.reviews adalah nilai turunan. Tidak pernah ditulis aplikasi.

create or replace function public.refresh_kos_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.kos_id, old.kos_id);
begin
  update public.kos k
  set score   = coalesce(agg.avg_score, 0),
      reviews = coalesce(agg.n, 0)
  from (
    select round(avg(average), 1) as avg_score, count(*) as n
    from public.reviews
    where kos_id = target
  ) agg
  where k.id = target;

  return null;
end;
$$;

drop trigger if exists reviews_refresh_kos_score on public.reviews;
create trigger reviews_refresh_kos_score
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_kos_score();

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists reviews_touch_updated_at on public.reviews;
create trigger reviews_touch_updated_at
  before update on public.reviews
  for each row execute function public.touch_updated_at();

-- ─── row level security ────────────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.reviews  enable row level security;
alter table public.kos      enable row level security;

-- profiles: publik boleh baca (nama penulis muncul di review), hanya pemilik
-- yang boleh mengubah miliknya.
drop policy if exists profiles_select_all  on public.profiles;
drop policy if exists profiles_update_self on public.profiles;

create policy profiles_select_all  on public.profiles for select using (true);
create policy profiles_update_self on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- reviews: siapa pun boleh baca; hanya user login yang boleh menulis, dan
-- hanya atas namanya sendiri.
drop policy if exists reviews_select_all    on public.reviews;
drop policy if exists reviews_insert_own    on public.reviews;
drop policy if exists reviews_update_own_30 on public.reviews;
drop policy if exists reviews_delete_own    on public.reviews;

create policy reviews_select_all on public.reviews for select using (true);

create policy reviews_insert_own on public.reviews for insert to authenticated
  with check (auth.uid() = author_id);

-- "Editable for 30 days" — setelah itu review membeku.
create policy reviews_update_own_30 on public.reviews for update to authenticated
  using      (auth.uid() = author_id and created_at > now() - interval '30 days')
  with check (auth.uid() = author_id);

-- Penulis boleh menghapus miliknya. Pemilik kos TIDAK PERNAH bisa — tidak ada
-- policy yang memberi mereka hak itu, dan itu memang inti produknya.
create policy reviews_delete_own on public.reviews for delete to authenticated
  using (auth.uid() = author_id);

-- kos: publik boleh baca. Insert di sini masih terbuka untuk anon —
-- DIGANTI oleh 0004_kos_insert_requires_login.sql, yang mewajibkan login untuk
-- menulis. Baris di bawah dipertahankan apa adanya supaya urutan migrasi tetap
-- merekam sejarahnya; jalankan 0004 setelah berkas ini.
drop policy if exists kos_select_all on public.kos;
drop policy if exists kos_insert_any on public.kos;

create policy kos_select_all on public.kos for select using (true);
create policy kos_insert_any on public.kos for insert with check (true);
