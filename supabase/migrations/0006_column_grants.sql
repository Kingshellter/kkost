-- Menutup tiga celah yang tidak terlihat oleh linter Supabase, dijalankan
-- setelah 0001-0005 terpasang.
--
-- Akar masalahnya sama: Supabase memberi role `anon` dan `authenticated` hak
-- INSERT/UPDATE atas SEMUA kolom setiap tabel di schema public. Policy RLS
-- hanya memeriksa SIAPA yang menulis dan BARIS mana — bukan KOLOM apa. Jadi:
--
--   1. Pengguna login bisa INSERT kos dengan `score = 5.0, reviews = 999`
--      langsung lewat REST. Trigger skor hanya berjalan saat `reviews` berubah,
--      sehingga angka palsu itu bertahan.
--   2. `profiles_update_self` membolehkan pengguna mengubah `is_student` miliknya
--      sendiri — lencana "penghuni terverifikasi" bisa diklaim tanpa email kampus.
--   3. `reviews_update_own_30` membolehkan mengubah `created_at` (jendela 30 hari
--      bisa di-reset tanpa batas) dan `kos_id` (review dipindah ke kos lain,
--      dan skor kos asal tidak ikut dihitung ulang).
--
-- Perbaikannya: cabut hak tingkat tabel, lalu beri ulang hanya kolom yang
-- memang diisi pengguna. REVOKE tingkat tabel ikut mencabut hak tingkat kolom,
-- jadi urutan revoke -> grant membuat berkas ini aman dijalankan dua kali.
--
-- Jalankan di Supabase Dashboard -> SQL Editor.

-- ─── 1. kos: skor turunan tidak bisa ditulis ───────────────────────────────
-- Tidak ada GRANT UPDATE: tidak ada policy UPDATE di kos, dan satu-satunya
-- penulis score/reviews adalah refresh_kos_score() (SECURITY DEFINER).

revoke insert, update on public.kos from anon, authenticated;
grant insert (name, area, city, campus, price, distance_m, lat, lng)
  on public.kos to authenticated;

-- ─── 2. profiles: is_student hanya ditetapkan database ─────────────────────
-- Baris profil dibuat oleh handle_new_user() (SECURITY DEFINER), jadi klien
-- tidak butuh INSERT sama sekali. Yang boleh diubah pengguna hanya namanya.

revoke insert, update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

-- ─── 3. reviews: hanya skor dan catatan yang boleh disunting ───────────────
-- `average` generated, `updated_at` diisi trigger, `created_at` jadi jangkar
-- jendela 30 hari, dan `kos_id`/`author_id` menentukan milik siapa untuk apa.

revoke insert, update on public.reviews from anon, authenticated;
grant insert (kos_id, author_id, room, bathroom, water, wifi, kitchen, parking, body)
  on public.reviews to authenticated;
grant update (room, bathroom, water, wifi, kitchen, parking, body)
  on public.reviews to authenticated;

-- ─── 4. Trigger skor menghitung ulang kos lama DAN kos baru ────────────────
-- Versi 0002 memakai coalesce(new.kos_id, old.kos_id): saat UPDATE memindah
-- review, hanya kos tujuan yang dihitung ulang. Hak kolom di atas sudah
-- mencegah pemindahan dari klien, tetapi dashboard dan service role tidak
-- terikat hak itu — skor harus tetap benar siapa pun yang mengubah baris.
-- OLD bernilai NULL saat INSERT dan NEW saat DELETE; NULL disaring.

create or replace function public.refresh_kos_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.kos k
  set score   = agg.avg_score,
      reviews = agg.n
  from (
    select t.id,
           coalesce(round(avg(r.average), 1), 0) as avg_score,
           count(r.id)                           as n
    from (
      select distinct id
      from unnest(array[old.kos_id, new.kos_id]) as id
      where id is not null
    ) t
    left join public.reviews r on r.kos_id = t.id
    group by t.id
  ) agg
  where k.id = agg.id;

  return null;
end;
$$;

-- create or replace mempertahankan ACL, tetapi ditegaskan ulang agar berkas
-- ini utuh dibaca sendiri (lihat 0005 bagian 1).
revoke execute on function public.refresh_kos_score() from public, anon, authenticated;

-- ─── 5. Deteksi email kampus tidak peka huruf besar ────────────────────────
-- `like` peka huruf besar: RINA@UGM.AC.ID tidak terdeteksi, padahal
-- isCampusEmail() di aplikasi memakai toLowerCase().

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
    lower(new.email) like '%.ac.id'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Samakan profil yang sudah terlanjur dibuat dengan aturan di atas. Idempoten.
update public.profiles p
set is_student = (lower(u.email) like '%.ac.id')
from auth.users u
where u.id = p.id
  and p.is_student is distinct from (lower(u.email) like '%.ac.id');
