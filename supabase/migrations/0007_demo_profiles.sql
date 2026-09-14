-- Penanda akun contoh.
--
-- Demo lomba butuh review supaya halaman detail tidak kosong, tetapi review
-- buatan tim yang tampil seolah ditulis penghuni adalah review palsu — persis
-- hal yang ingin dicegah kkost. Jadi akun contoh ditandai di database, dan
-- setiap review dari akun itu diberi label "Review contoh" di tampilan.
--
-- Datanya sendiri ada di supabase/seed_demo_reviews.sql. Jalankan berkas ini
-- lebih dulu, di Supabase Dashboard -> SQL Editor, setelah 0006.

alter table public.profiles
  add column if not exists is_demo boolean not null default false;

comment on column public.profiles.is_demo is
  'Akun contoh untuk demonstrasi. Review-nya diberi label di UI. Tidak bisa diubah pengguna.';

-- 0006 mencabut hak UPDATE tingkat tabel dan hanya memberi `display_name`,
-- jadi kolom baru ini sudah tidak bisa ditulis klien. Ditegaskan ulang supaya
-- berkas ini utuh dibaca sendiri.
revoke insert (is_demo), update (is_demo) on public.profiles from anon, authenticated;
