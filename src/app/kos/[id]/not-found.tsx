import { Footer } from "@/components/sections/footer";
import { Navbar } from "@/components/sections/navbar";
import { SectionLink } from "@/components/ui/section-link";
import { buttonClass } from "@/components/ui/controls";
import { StatusCard } from "@/components/ui/status-card";

/**
 * Rendered by `notFound()` in the kos page: the id is well-formed or not, but
 * no kos has it. The tab title comes from that page's `generateMetadata`
 * ("Kos tidak ditemukan · kkost").
 */
export default function KosNotFound() {
  return (
    <>
      <Navbar />
      <StatusCard
        code="404"
        title="Kos ini tidak ditemukan"
        actions={
          <>
            <SectionLink href="/#browse" className={buttonClass("primary", "md")}>
              Lihat semua kos
            </SectionLink>
            <SectionLink href="/#peta" className={buttonClass("soft", "md")}>
              Buka peta
            </SectionLink>
          </>
        }
      >
        <p>
          Tautannya mungkin salah ketik, atau kosnya belum pernah tersimpan ke
          database.
        </p>
      </StatusCard>
      <Footer />
    </>
  );
}
