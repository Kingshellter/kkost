-- Perbaikan atas temuan database linter bawaan Supabase, dijalankan setelah
-- 0001-0004 terpasang. Empat temuan, semuanya nyata:
--
--   1. WARN  SECURITY DEFINER function dapat dipanggil lewat REST oleh anon
--   2. WARN  auth.uid() dievaluasi ulang per baris di policy RLS
--   3. WARN  dua policy SELECT permissive menumpuk di tabel kos
--   4. INFO  foreign key reviews.author_id tanpa index
--
-- Jalankan di Supabase Dashboard -> SQL Editor.

-- ─── 1. Fungsi trigger tidak boleh jadi endpoint RPC ───────────────────────
-- handle_new_user() dan refresh_kos_score() adalah SECURITY DEFINER dan berada
-- di schema public, sehingga PostgREST mengeksposnya sebagai /rest/v1/rpc/...
-- Memanggilnya langsung memang gagal ("trigger functions can only be called as
-- triggers"), jadi dampak praktisnya kecil — tetapi fungsi berhak-elevasi tidak
-- punya alasan untuk bisa dipanggil publik sama sekali.
--
-- Trigger tetap berjalan: eksekusi trigger tidak memeriksa hak EXECUTE pemanggil.

revoke execute on function public.handle_new_user()   from public, anon, authenticated;
revoke execute on function public.refresh_kos_score() from public, anon, authenticated;

-- ─── 2. auth.uid() dibungkus subquery ──────────────────────────────────────
-- Tanpa (select ...), Postgres mengevaluasi ulang auth.uid() untuk SETIAP baris
-- yang diperiksa policy. Dibungkus subquery, ia dievaluasi satu kali per query.
-- Semantiknya identik; yang berubah hanya rencana eksekusinya.

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using      ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews for insert to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists reviews_update_own_30 on public.reviews;
create policy reviews_update_own_30 on public.reviews for update to authenticated
  using      ((select auth.uid()) = author_id
              and created_at > now() - interval '30 days')
  with check ((select auth.uid()) = author_id);

drop policy if exists reviews_delete_own on public.reviews;
create policy reviews_delete_own on public.reviews for delete to authenticated
  using ((select auth.uid()) = author_id);

drop policy if exists kos_insert_authenticated on public.kos;
create policy kos_insert_authenticated on public.kos for insert to authenticated
  with check ((select auth.uid()) is not null);

-- ─── 3. Policy SELECT ganda di tabel kos ───────────────────────────────────
-- "Kos are viewable by everyone" dibuat lewat dashboard sebelum migrasi ini
-- ada, dan isinya sama persis dengan kos_select_all. Dua policy permissive
-- untuk aksi yang sama berarti keduanya dievaluasi tiap query, tanpa menambah
-- akses apa pun. Yang lama dibuang; membaca kos tetap terbuka untuk siapa saja.

drop policy if exists "Kos are viewable by everyone" on public.kos;

-- ─── 4. Index untuk foreign key ────────────────────────────────────────────
-- Tanpa ini, "review milik pengguna X" dan penghapusan profil memindai tabel.

create index if not exists reviews_author_id_idx on public.reviews (author_id);
