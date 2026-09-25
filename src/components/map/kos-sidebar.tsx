"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/controls";
import { KosScoreBadge } from "@/components/ui/kos-score-badge";
import { SectionLink } from "@/components/ui/section-link";
import type { Kos } from "@/data/kos";
import { formatRupiah } from "@/lib/format";
import type { KosFilter } from "@/lib/kos-browse";
import { mergeKos, useKosStore } from "@/store/kos-store";

export function KosSidebar({
  kos: fromServer,
  filter,
}: {
  kos: Kos[];
  filter: KosFilter;
}) {
  const added = useKosStore((s) => s.added);
  const kosList = mergeKos(added, fromServer, filter);

  return (
    <aside className="flex flex-col rounded-panel bg-white p-7 lg:min-h-0">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        {kosList.length} kos di peta
      </p>

      {kosList.length > 0 ? (
        <ul className="mt-6 max-h-[360px] min-h-0 flex-1 space-y-6 overflow-y-auto lg:max-h-none">
          {kosList.map((kos) => (
            <li key={kos.id}>
              {/* A `local-` kos never reached the database, so it has no
                  detail page to link to. */}
              {kos.id.startsWith("local-") ? (
                <div className="flex items-start gap-4">
                  <SidebarRow kos={kos} />
                </div>
              ) : (
                <Link
                  href={`/kos/${kos.id}`}
                  className="flex items-start gap-4 rounded-box transition-opacity duration-(--duration-fast) hover:opacity-70 active:opacity-60"
                >
                  <SidebarRow kos={kos} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 flex-1 text-base font-medium text-muted">
          Tidak ada kos yang cocok dengan filter ini.
        </p>
      )}

      <SectionLink
        href="/#browse"
        className={buttonClass("dark", "md", "mt-8 w-full")}
      >
        Lihat daftar lengkap
      </SectionLink>
    </aside>
  );
}

function SidebarRow({ kos }: { kos: Kos }) {
  return (
    <>
      <KosScoreBadge kos={kos} size="sm" />
      <div className="min-w-0">
        <h3 className="text-lg font-extrabold leading-tight text-ink">
          {kos.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-muted">
          {kos.area}, {kos.city} · {formatRupiah(kos.price)}
        </p>
      </div>
    </>
  );
}
