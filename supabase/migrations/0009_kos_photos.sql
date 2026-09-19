-- Foto kos lewat Supabase Storage.
--
-- Sampai 0008 setiap kos hanya punya ilustrasi SVG berlabel "Ilustrasi".
-- Berkas ini menambahkan:
--
--   1. Bucket Storage `kos-photos` — publik untuk dibaca, hanya jpeg/png/webp,
--      maksimal 2 MB per berkas. Batas itu ditegakkan oleh Storage sendiri,
--      bukan oleh form.
--   2. Tabel `kos_photos` — satu baris per foto, boleh lebih dari satu per kos.
--      Kolom `kos` tidak disentuh, jadi foto tidak bisa "ditempelkan" lewat
--      update bebas pada baris kos.
--   3. Policy Storage: unggah hanya `authenticated`, hanya ke folder milik kos
--      yang benar-benar ada (`<kos_id>/...`). TIDAK ADA policy update/delete —
--      tidak seorang pun (termasuk pengunggah) bisa menimpa atau menghapus foto
--      lewat API. Moderasi dilakukan pemilik proyek dari dashboard.
--   4. Trigger yang memastikan baris `kos_photos` menunjuk berkas yang memang
--      ada di bucket dan diunggah oleh akun yang sama.
--
-- Jalankan di Supabase Dashboard -> SQL Editor, setelah 0008.

-- ─── 1. Bucket ─────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kos-photos',
  'kos-photos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ─── 2. Policy Storage ─────────────────────────────────────────────────────
-- Bucket publik disajikan lewat URL publik tanpa policy SELECT, jadi tidak ada
-- policy SELECT di sini — menambahkannya justru membuka daftar semua berkas
-- (linter: public_bucket_allows_listing).

drop policy if exists kos_photos_upload on storage.objects;
create policy kos_photos_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'kos-photos'
    and (storage.foldername(name))[1] in (select id::text from public.kos)
  );

-- ─── 3. Tabel kos_photos ───────────────────────────────────────────────────

create table if not exists public.kos_photos (
  id          uuid primary key default gen_random_uuid(),
  kos_id      uuid not null references public.kos (id) on delete cascade,
  path        text not null unique,
  uploaded_by uuid not null default auth.uid()
                references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- Berkas harus berada di folder kos yang ditunjuk, bukan di folder kos lain.
  constraint kos_photos_path_in_kos_folder
    check (path like kos_id::text || '/%' and char_length(path) <= 200)
);

create index if not exists kos_photos_kos_id_idx on public.kos_photos (kos_id, created_at desc);
create index if not exists kos_photos_uploaded_by_idx on public.kos_photos (uploaded_by);

alter table public.kos_photos enable row level security;

drop policy if exists kos_photos_select on public.kos_photos;
create policy kos_photos_select on public.kos_photos
  for select using (true);

drop policy if exists kos_photos_insert on public.kos_photos;
create policy kos_photos_insert on public.kos_photos
  for insert to authenticated
  with check ((select auth.uid()) = uploaded_by);

-- Pola 0006: klien hanya boleh mengisi kos_id dan path. uploaded_by selalu
-- dari default auth.uid(); tidak ada UPDATE atau DELETE sama sekali.
revoke insert, update, delete on public.kos_photos from anon, authenticated;
grant select on public.kos_photos to anon, authenticated;
grant insert (kos_id, path) on public.kos_photos to authenticated;

-- ─── 4. Baris harus menunjuk berkas milik pengunggahnya ────────────────────
-- Tanpa ini, seseorang bisa mendaftarkan path berkas orang lain sebagai
-- "fotonya", atau path yang tidak pernah diunggah.

create or replace function public.check_kos_photo_object()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'kos-photos'
      and o.name = new.path
      and o.owner_id = new.uploaded_by::text
  ) then
    raise exception 'Foto belum diunggah atau bukan milik akun ini'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke execute on function public.check_kos_photo_object() from public, anon, authenticated;

drop trigger if exists kos_photos_check_object on public.kos_photos;
create trigger kos_photos_check_object
  before insert on public.kos_photos
  for each row execute function public.check_kos_photo_object();
