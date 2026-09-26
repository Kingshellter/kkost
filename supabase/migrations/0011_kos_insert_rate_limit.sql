-- Batas menambah kos: paling banyak 10 kos per akun dalam 24 jam.
--
-- Sampai 0010, akun mana pun yang sudah login bisa memanggil REST Supabase
-- langsung (tanpa form di peta) dan membuat kos sebanyak apa pun. Semua isian
-- sudah dibatasi 0008, tapi jumlahnya tidak: satu akun bisa memenuhi peta dan
-- daftar dengan ribuan entri spam.
--
-- Perbaikannya: trigger BEFORE INSERT yang menghitung kos buatan akun yang
-- sama (`created_by`, diisi database dari auth.uid() sejak 0008) dalam 24 jam
-- terakhir, dan menolak yang ke-11 dengan pesan `kos_rate_limit`
-- (dipetakan ke bahasa Indonesia oleh explain() di src/lib/kos-repository.ts).
-- Satu advisory lock per akun supaya dua insert serentak tidak sama-sama lolos
-- hitungan. Baris tanpa created_by (dibuat dari dashboard / service role)
-- tidak dibatasi.
--
-- Jalankan di Supabase Dashboard -> SQL Editor, setelah 0010. Aman dijalankan
-- dua kali.

create or replace function public.limit_kos_inserts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtext('kos_insert:' || new.created_by::text));

  if (
    select count(*) from public.kos
    where created_by = new.created_by
      and created_at > now() - interval '1 day'
  ) >= 10 then
    raise exception 'kos_rate_limit: batas 10 kos per akun per 24 jam';
  end if;

  return new;
end;
$$;

-- Hanya dijalankan oleh trigger, tidak boleh dipanggil lewat REST (lihat 0005).
revoke execute on function public.limit_kos_inserts() from public, anon, authenticated;

drop trigger if exists kos_insert_rate_limit on public.kos;
create trigger kos_insert_rate_limit
  before insert on public.kos
  for each row execute function public.limit_kos_inserts();
