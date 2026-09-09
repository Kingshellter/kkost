-- Data awal supaya peta dan halaman detail punya isi.
--
-- Jalankan SETELAH 0001, 0002, dan 0003. Aman dijalankan berulang kali:
-- baris dicocokkan berdasarkan `name`, jadi menjalankan ulang hanya memperbarui.

-- 1. Baris lama (id/name/created_at saja) dilengkapi. Namanya sudah menyebut
--    daerah asal, jadi ditempatkan sesuai itu.
update public.kos set
  area = 'Ngaglik', city = 'Sleman', campus = 'UII', price = 850000,
  distance_m = 900, lat = -7.6890, lng = 110.4090
where name = 'Kos Mas Amba';

update public.kos set
  area = 'Ngawi Kota', city = 'Ngawi', campus = 'Politeknik Negeri Madiun',
  price = 650000, distance_m = 2100, lat = -7.4034, lng = 111.4464
where name = 'Kos Ngawi Selatan';

update public.kos set
  area = 'Pontianak Tenggara', city = 'Pontianak', campus = 'Universitas Tanjungpura',
  price = 780000, distance_m = 1200, lat = -0.0577, lng = 109.3468
where name = 'Kos Anggrek Mekar Pontianak';

-- 2. Sebaran kos di beberapa kota supaya demo terlihat nasional.
--    Harga dibuat wajar per kota.
insert into public.kos (name, area, city, campus, price, distance_m, lat, lng)
select v.name, v.area, v.city, v.campus, v.price, v.distance_m, v.lat, v.lng
from (values
  ('Kos Puri Melati',   'Depok',              'Jakarta',    'Universitas Indonesia',              1650000,  700, -6.3690, 106.8270),
  ('Kos Dago Asri',     'Coblong',            'Bandung',    'Institut Teknologi Bandung',         1250000,  600, -6.8890, 107.6100),
  ('Wisma Kenanga',     'Sukolilo',           'Surabaya',   'Institut Teknologi Sepuluh Nopember', 1100000,  400, -7.2820, 112.7950),
  ('Kos Bu Har',        'Caturtunggal',       'Sleman',     'Universitas Gadjah Mada',             950000, 1100, -7.7700, 110.3875),
  ('Kos Anggrek 3',     'Lowokwaru',          'Malang',     'Universitas Brawijaya',               800000, 1800, -7.9520, 112.6150),
  ('Kos Tembalang',     'Tembalang',          'Semarang',   'Universitas Diponegoro',              900000,  850, -7.0500, 110.4380),
  ('Kos Kentingan',     'Jebres',             'Surakarta',  'Universitas Sebelas Maret',           750000,  500, -7.5590, 110.8560),
  ('Kos Griya Manahan', 'Banjarsari',         'Surakarta',  'Universitas Muhammadiyah Surakarta',  700000, 1400, -7.5560, 110.8080)
) as v(name, area, city, campus, price, distance_m, lat, lng)
where not exists (select 1 from public.kos k where k.name = v.name);

-- 3. Baris yang sudah ada dari seed lama (masih beralamat Jogja) diperbarui
--    supaya ikut sebaran di atas.
update public.kos k set
  area = v.area, city = v.city, campus = v.campus,
  price = v.price, distance_m = v.distance_m, lat = v.lat, lng = v.lng
from (values
  ('Kos Puri Melati', 'Depok',        'Jakarta',   'Universitas Indonesia',              1650000,  700, -6.3690, 106.8270),
  ('Kos Dago Asri',   'Coblong',      'Bandung',   'Institut Teknologi Bandung',         1250000,  600, -6.8890, 107.6100),
  ('Wisma Kenanga',   'Sukolilo',     'Surabaya',  'Institut Teknologi Sepuluh Nopember', 1100000,  400, -7.2820, 112.7950),
  ('Kos Bu Har',      'Caturtunggal', 'Sleman',    'Universitas Gadjah Mada',             950000, 1100, -7.7700, 110.3875),
  ('Kos Anggrek 3',   'Lowokwaru',    'Malang',    'Universitas Brawijaya',               800000, 1800, -7.9520, 112.6150)
) as v(name, area, city, campus, price, distance_m, lat, lng)
where k.name = v.name;
