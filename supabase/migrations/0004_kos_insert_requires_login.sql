-- Menambahkan kos sekarang wajib login.
--
-- 0002 sengaja membuka INSERT untuk anon supaya alur "klik peta -> tambah kos"
-- bisa didemokan tanpa mendaftar. Itu bertentangan dengan tema lomba
-- ("Trusted Web Ecosystems"): entri kos bisa dispam tanpa identitas sama sekali.
--
-- Batasnya: MENULIS wajib login, MEMBACA tetap terbuka untuk siapa pun.
-- Peta, daftar kos, halaman detail, dan seluruh review tetap bisa dilihat
-- tanpa akun — hanya kontribusi yang butuh identitas.
--
-- Jalankan di Supabase Dashboard -> SQL Editor, setelah 0003.

drop policy if exists kos_insert_any           on public.kos;
drop policy if exists kos_insert_authenticated on public.kos;

create policy kos_insert_authenticated on public.kos
  for insert to authenticated
  with check (auth.uid() is not null);

-- Ditegaskan ulang supaya berkas ini utuh dibaca sendiri: membaca tetap publik.
drop policy if exists kos_select_all on public.kos;
create policy kos_select_all on public.kos for select using (true);
