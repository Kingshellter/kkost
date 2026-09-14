-- Review contoh untuk demo lomba.
--
-- PRASYARAT: 0001-0007 dan supabase/seed.sql sudah dijalankan.
-- Jalankan di Supabase Dashboard -> SQL Editor. Aman dijalankan berulang kali.
--
-- Kejujurannya dijaga dengan tiga cara:
--   1. Keempat akun ditandai `profiles.is_demo = true`, dan setiap review-nya
--      tampil dengan label "Review contoh".
--   2. Alamat email memakai domain `.invalid` (dicadangkan RFC 2606), jadi
--      jelas bukan orang sungguhan dan tidak mungkin berakhiran `.ac.id` —
--      tidak satu pun mendapat lencana "penghuni terverifikasi".
--   3. `encrypted_password` kosong: akun ini tidak bisa dipakai masuk.
--
-- Skor kos tetap dihitung trigger refresh_kos_score() dari review ini, sama
-- seperti review lain. Tiga kos sengaja dibiarkan tanpa review supaya status
-- "Baru" juga terlihat saat demo.

-- ─── 1. Akun contoh ────────────────────────────────────────────────────────
-- Kolom token diisi string kosong, bukan NULL: Supabase Auth gagal membaca
-- baris dengan token NULL saat menampilkan daftar pengguna di dashboard.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  v.id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  v.email, '', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  jsonb_build_object('display_name', v.display_name),
  now(), now(), '', '', '', ''
from (values
  ('00000000-0000-4000-a000-00000000d001'::uuid, 'rina@demo.kkost.invalid',  'Rina A.'),
  ('00000000-0000-4000-a000-00000000d002'::uuid, 'dimas@demo.kkost.invalid', 'Dimas P.'),
  ('00000000-0000-4000-a000-00000000d003'::uuid, 'sari@demo.kkost.invalid',  'Sari W.'),
  ('00000000-0000-4000-a000-00000000d004'::uuid, 'bagus@demo.kkost.invalid', 'Bagus H.')
) as v(id, email, display_name)
on conflict (id) do nothing;

-- Profil dibuat trigger on_auth_user_created; tinggal ditandai.
update public.profiles
set is_demo = true
where id in (
  '00000000-0000-4000-a000-00000000d001',
  '00000000-0000-4000-a000-00000000d002',
  '00000000-0000-4000-a000-00000000d003',
  '00000000-0000-4000-a000-00000000d004'
);

-- ─── 2. Review ─────────────────────────────────────────────────────────────
-- Kos dicocokkan lewat `name`, sama seperti seed.sql. Urutan skor:
-- room, bathroom, water, wifi, kitchen, parking.

insert into public.reviews (
  kos_id, author_id, room, bathroom, water, wifi, kitchen, parking, body,
  created_at, updated_at
)
select
  k.id, v.author_id::uuid, v.room, v.bathroom, v.water, v.wifi, v.kitchen, v.parking,
  v.body, now() - make_interval(days => v.days_ago), now() - make_interval(days => v.days_ago)
from (values
  ('Kos Puri Melati', '00000000-0000-4000-a000-00000000d001', 5, 5, 5, 4, 4, 5,
   'Air tidak pernah mati sekali pun selama setahun. WiFi agak lambat kalau semua penghuni sedang online malam hari.', 41),
  ('Kos Puri Melati', '00000000-0000-4000-a000-00000000d002', 5, 4, 5, 4, 5, 4,
   'Kamar mandi dalam, bersih, dan air panasnya benar-benar jalan. Ibu kos tegas soal jam malam.', 23),
  ('Kos Puri Melati', '00000000-0000-4000-a000-00000000d003', 4, 5, 5, 5, 4, 4,
   'Dekat stasiun dan kampus. Harganya di atas rata-rata, tapi sebanding dengan fasilitasnya.', 9),

  ('Kos Dago Asri', '00000000-0000-4000-a000-00000000d002', 5, 4, 4, 5, 4, 5,
   'Parkir luas dan beratap, satpam jaga sampai pagi. Dapur bersama cukup lengkap.', 30),
  ('Kos Dago Asri', '00000000-0000-4000-a000-00000000d004', 4, 4, 4, 5, 3, 5,
   'WiFi kencang untuk kerja kelompok online. Dapurnya kecil untuk sepuluh kamar.', 12),

  ('Kos Tembalang', '00000000-0000-4000-a000-00000000d003', 4, 4, 3, 4, 4, 5,
   'Air sering kecil di lantai dua saat pagi. Selebihnya nyaman dan dekat gerbang kampus.', 35),
  ('Kos Tembalang', '00000000-0000-4000-a000-00000000d001', 4, 3, 4, 3, 5, 4,
   'Dapur paling enak yang pernah saya pakai di kos. Kamar mandi luar harus antre jam tujuh pagi.', 16),

  ('Kos Bu Har', '00000000-0000-4000-a000-00000000d004', 5, 5, 4, 4, 5, 4,
   'Ibu kos ramah dan rutin membersihkan dapur. Token listrik dibagi per kamar, jadi adil.', 52),
  ('Kos Bu Har', '00000000-0000-4000-a000-00000000d002', 4, 5, 5, 4, 5, 4,
   'Bersepeda ke kampus sepuluh menit. Kamar mandi selalu bersih.', 27),
  ('Kos Bu Har', '00000000-0000-4000-a000-00000000d003', 5, 5, 5, 5, 4, 4,
   'Kamar luas dengan jendela besar. Parkir motor agak sempit kalau semua penghuni sudah pulang.', 4),

  ('Wisma Kenanga', '00000000-0000-4000-a000-00000000d001', 4, 4, 4, 5, 3, 3,
   'WiFi stabil, cocok untuk yang sering begadang mengerjakan tugas. Parkirnya sempit.', 19),
  ('Wisma Kenanga', '00000000-0000-4000-a000-00000000d004', 3, 4, 4, 5, 3, 4,
   'Kamarnya kecil untuk harga segini, tapi bisa jalan kaki ke kampus.', 7),

  ('Kos Anggrek 3', '00000000-0000-4000-a000-00000000d003', 4, 3, 4, 4, 4, 5,
   'Parkir aman karena ada kanopi. Kamar mandi luar perlu dibersihkan lebih sering.', 44),
  ('Kos Anggrek 3', '00000000-0000-4000-a000-00000000d002', 3, 3, 4, 3, 4, 5,
   'Agak jauh dari kampus, jadi perlu motor. WiFi sering putus saat hujan.', 13),

  ('Kos Kentingan', '00000000-0000-4000-a000-00000000d004', 5, 4, 5, 4, 5, 4,
   'Murah untuk fasilitasnya. Dapur boleh dipakai bebas dan ada kulkas bersama.', 38),
  ('Kos Kentingan', '00000000-0000-4000-a000-00000000d001', 4, 4, 5, 4, 5, 4,
   'Dekat pintu belakang kampus. Air sumurnya jernih dan tidak pernah mati.', 11),

  ('Kos Mas Amba', '00000000-0000-4000-a000-00000000d002', 4, 4, 4, 3, 3, 4,
   'Tenang dan jauh dari keramaian, tapi WiFi hanya kuat di ruang depan.', 21)
) as v(kos_name, author_id, room, bathroom, water, wifi, kitchen, parking, body, days_ago)
join public.kos k on k.name = v.kos_name
on conflict (kos_id, author_id) do nothing;
