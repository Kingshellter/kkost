/**
 * The body of a page that has nothing to show: 404s and the error boundary.
 * One card in the middle of the space between navbar and footer. No hooks, so
 * it renders from a Server Component (not-found) and a Client Component
 * (error.tsx) alike.
 */
export function StatusCard({
  code,
  title,
  children,
  actions,
}: {
  /** A short label above the title, e.g. "404". */
  code?: string;
  title: string;
  children: React.ReactNode;
  /** Buttons, stacked full width on a phone and side by side from sm. */
  actions: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 sm:py-24">
      <div className="w-full max-w-[520px] rounded-panel bg-white p-6 text-center shadow-float sm:p-10">
        {code && (
          <p className="text-sm font-extrabold tabular-nums text-action">
            {code}
          </p>
        )}
        <h1 className={`${code ? "mt-3" : ""} font-extrabold text-ink text-heading`}>
          {title}
        </h1>
        <div className="mx-auto mt-3 max-w-[40ch] text-base font-medium text-muted">
          {children}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {actions}
        </div>
      </div>
    </main>
  );
}
