import { Cta } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { MapSection } from "@/components/sections/map-section";
import { Navbar } from "@/components/sections/navbar";
import { Scoring } from "@/components/sections/scoring";
import { TopRated } from "@/components/sections/top-rated";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Scoring />
        <MapSection />
        <TopRated />
        <Cta />
      </main>
    </>
  );
}
