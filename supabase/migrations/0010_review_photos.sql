-- Foto pindah dari kos ke review.
--
-- 0009 membuat foto milik KOS: siapa pun yang login bisa menempelkan foto ke
-- kos mana pun, dan foto itu tampil sebagai banner tanpa jelas siapa yang
-- menjamin isinya. Foto yang lebih bermakna adalah BUKTI dari sebuah review:
-- penulis review menunjukkan kamar dan fasilitas yang ia nilai. Jadi:
--
--   1. Tabel `kos_photos` dan policy unggahnya dihapus. PERHATIAN: baris foto
--      uji coba yang ada ikut terhapus. Berkasnya tetap di bucket `kos-photos`
--      — Supabase melarang menghapus isi Storage lewat SQL — dan tidak lagi
--      ditampilkan di mana pun. Hapus bucket itu dari dashboard Storage bila
--      ingin bersih.
--   2. Bucket baru `review-photos` — publik untuk dibaca, jpeg/png/webp,
--      maksimal 2 MB per berkas.
--   3. Tabel `review_photos` — foto hanya bisa ditempelkan ke review MILIK
--      SENDIRI, maksimal 3 per review, dan harus menunjuk berkas yang memang
--      diunggah akun itu. Tidak ada UPDATE/DELETE lewat API, sama seperti
--      review dan foto sebelumnya.
--
-- Menghapus review (penulisnya boleh) ikut menghapus baris fotonya.
--
-- Jalankan di Supabase Dashboard -> SQL Editor, setelah 0009.

-- ─── 1. Bongkar foto kos (0009) ────────────────────────────────────────────

drop policy if exists kos_photos_upload on storage.objects;
drop table if exists public.kos_photos;
drop function if exists public.check_kos_photo_object();

-- Tanpa policy INSERT, bucket kos-photos tidak bisa diisi lagi oleh siapa pun.

-- ─── 2. Bucket review-photos ───────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'review-photos',
  'review-photos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Unggah hanya ke folder review milik sendiri: `<review_id>/<berkas>`.
-- Tidak ada policy SELECT — bucket publik disajikan lewat URL publik, dan
-- policy SELECT justru membuka daftar semua berkas (lihat 0009).
drop policy if exists review_photos_upload on storage.objects;
create policy review_photos_upload on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'review-photos'
    and (storage.foldername(name))[1] in (
      select r.id::text from public.reviews r
      where r.author_id = (select auth.uid())
    )
  );

-- ─── 3. Tabel review_photos ────────────────────────────────────────────────

create table if not exists public.review_photos (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null references public.reviews (id) on delete cascade,
  path        text not null unique,
  uploaded_by uuid not null default auth.uid()
                references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint review_photos_path_in_review_folder
    check (path like review_id::text || '/%' and char_length(path) <= 200)
);

create index if not exists review_photos_review_id_idx
  on public.review_photos (review_id, created_at);
create index if not exists review_photos_uploaded_by_idx
  on public.review_photos (uploaded_by);

alter table public.review_photos enable row level security;

drop policy if exists review_photos_select on public.review_photos;
create policy review_photos_select on public.review_photos
  for select using (true);

-- Hanya penulis review yang boleh menempelkan foto ke review itu.
drop policy if exists review_photos_insert on public.review_photos;
create policy review_photos_insert on public.review_photos
  for insert to authenticated
  with check (
    (select auth.uid()) = uploaded_by
    and exists (
      select 1 from public.reviews r
      where r.id = review_id and r.author_id = (select auth.uid())
    )
  );

-- Pola 0006: klien hanya mengisi review_id dan path; uploaded_by selalu dari
-- default auth.uid(). Tidak ada UPDATE atau DELETE.
revoke insert, update, delete on public.review_photos from anon, authenticated;
grant select on public.review_photos to anon, authenticated;
grant insert (review_id, path) on public.review_photos to authenticated;

-- ─── 4. Berkas harus ada, milik pengunggah, dan paling banyak 3 ────────────

create or replace function public.check_review_photo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Kunci baris review supaya dua unggahan serentak tidak sama-sama lolos
  -- hitungan di bawah.
  perform 1 from public.reviews where id = new.review_id for update;

  if (select count(*) from public.review_photos where review_id = new.review_id) >= 3 then
    raise exception 'Satu review maksimal 3 foto'
      using errcode = '23514';
  end if;

  if not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'review-photos'
      and o.name = new.path
      and o.owner_id = new.uploaded_by::text
  ) then
    raise exception 'Foto belum diunggah atau bukan milik akun ini'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke execute on function public.check_review_photo() from public, anon, authenticated;

drop trigger if exists review_photos_check on public.review_photos;
create trigger review_photos_check
  before insert on public.review_photos
  for each row execute function public.check_review_photo();
