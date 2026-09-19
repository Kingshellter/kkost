"use client";

import Link from "next/link";
import { KosScoreBadge } from "@/components/ui/kos-score-badge";
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
    <aside className="flex flex-col rounded-[var(--radius-panel)] bg-white p-7">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">
        {kosList.length} kos di peta
      </p>

      {kosList.length > 0 ? (
        <ul className="mt-6 max-h-[360px] flex-1 space-y-6 overflow-y-auto lg:max-h-[400px]">
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
                  className="flex items-start gap-4 transition-opacity hover:opacity-70"
                >
                  <SidebarRow kos={kos} />
                </Link>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 flex-1 text-[15px] font-medium text-muted">
          Tidak ada kos yang cocok dengan filter ini.
        </p>
      )}

      <Link
        href="#browse"
        className="mt-8 rounded-full bg-ink py-4 text-center text-[15px] font-extrabold text-white transition-transform hover:-translate-y-0.5"
      >
        Lihat daftar lengkap
      </Link>
    </aside>
  );
}

function SidebarRow({ kos }: { kos: Kos }) {
  return (
    <>
      <KosScoreBadge kos={kos} size="sm" />
      <div className="min-w-0">
        <h3 className="text-[17px] font-extrabold leading-tight text-ink">
          {kos.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-muted">
          {kos.area}, {kos.city} · {formatRupiah(kos.price)}
        </p>
      </div>
    </>
  );
}
