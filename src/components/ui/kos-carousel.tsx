"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, useEffect, useRef, useState } from "react";

/**
 * One swipeable row of kos cards, so the browse section fits a single screen
 * however many kos match. The cards are passed in as children and stay server
 * rendered; this only owns the scrolling.
 *
 * Touch and trackpad scroll it natively (with snap points). A toolbar above
 * the row says where you are ("1-3 dari 9", which a phone showing one card at
 * a time otherwise never tells you) and, from `sm`, holds the ◀ ▶ buttons for
 * a mouse, each moving one visible page. The buttons used to sit on the row's
 * edges, where they covered the outer cards. Tabbing through the cards
 * scrolls them into view on its own.
 */
export function KosCarousel({
  label,
  children,
}: {
  /** Accessible name of the list, e.g. "11 kos". */
  label: string;
  children: React.ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const count = Children.count(children);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  /** First visible card (0-based) and how many fit, for the position text. */
  const [first, setFirst] = useState(0);
  const [visible, setVisible] = useState(1);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 4);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
      // One card plus the gap after it is one step of the snap grid.
      const card = el.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const step = card ? card.offsetWidth + gap : el.clientWidth;
      setFirst(Math.round(el.scrollLeft / step));
      setVisible(Math.max(1, Math.floor((el.clientWidth + gap) / step)));
    };
    // The observer fires once on observe, which sets the first state; the
    // timeout covers a tab that is not rendering yet (observers wait for it).
    const observer = new ResizeObserver(update);
    observer.observe(el);
    const firstRun = setTimeout(update, 0);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      clearTimeout(firstRun);
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);

  function page(direction: 1 | -1) {
    const el = track.current;
    if (!el) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * el.clientWidth,
      behavior: still ? "auto" : "smooth",
    });
  }

  const start = Math.min(first + 1, count);
  const end = Math.min(first + visible, count);
  const scrollable = !(atStart && atEnd);

  return (
    <div>
      {scrollable && (
        // `relative` so the list's shadow allowance (-my-6) below does not
        // cover these buttons.
        <div className="relative mb-3 flex items-center justify-between gap-4">
          <p className="text-sm font-bold tabular-nums text-muted">
            {end > start ? `${start}-${end}` : start} dari {count}
          </p>
          <div className="hidden gap-2 sm:flex">
            <ArrowButton direction={-1} disabled={atStart} onClick={() => page(-1)} />
            <ArrowButton direction={1} disabled={atEnd} onClick={() => page(1)} />
          </div>
        </div>
      )}

      <ul
        ref={track}
        aria-label={label}
        // py/-my leave room for the cards' shadow and hover lift, which an
        // overflow container would otherwise clip.
        className="-mx-1 -my-6 flex snap-x snap-mandatory gap-7 overflow-x-auto px-1 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Children.map(children, (child) => (
          <li className="flex shrink-0 basis-[85%] snap-start sm:basis-[calc(50%-0.875rem)] lg:basis-[calc((100%-3.5rem)/3)] [&>*]:w-full">
            {child}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 1 | -1;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === 1 ? ChevronRight : ChevronLeft;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 1 ? "Kos berikutnya" : "Kos sebelumnya"}
      className="grid size-11 place-items-center rounded-full bg-ink text-white transition-[opacity,background-color,scale] duration-(--duration-fast) ease-out hover:bg-ink-soft active:scale-(--press-scale) active:duration-(--duration-press) disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon aria-hidden className="size-5" strokeWidth={2.5} />
    </button>
  );
}
