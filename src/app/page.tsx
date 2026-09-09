import { Cta } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { MapSection } from "@/components/sections/map-section";
import { Navbar } from "@/components/sections/navbar";
import { Scoring } from "@/components/sections/scoring";
import { TopRated } from "@/components/sections/top-rated";
import { getSessionUser } from "@/lib/auth";
import { fetchKosList, isSupabaseConfigured } from "@/lib/kos-repository";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = isSupabaseConfigured ? await createClient() : null;
  const [kos, user] = await Promise.all([
    fetchKosList(supabase),
    getSessionUser(),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero featured={kos[0]} />
        <Scoring />
        <MapSection kos={kos} signedIn={Boolean(user)} />
        <TopRated kos={kos} />
        <Cta />
      </main>
    </>
  );
}
