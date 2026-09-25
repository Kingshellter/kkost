"use client";

import { Children, useEffect, useRef, useState } from "react";

/**
 * One swipeable row of kos cards, so the browse section fits a single screen
 * however many kos match. The cards are passed in as children and stay server
 * rendered; this only owns the scrolling.
 *
 * Touch and trackpad scroll it natively (with snap points); the ◀ ▶ buttons
 * are for a mouse, and each moves by one visible page. Tabbing through the
 * cards scrolls them into view on its own.
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
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft <= 4);
      setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
    };
    // The observer fires once on observe, which sets the first state; the
    // timeout covers a tab that is not rendering yet (observers wait for it).
    const observer = new ResizeObserver(update);
    observer.observe(el);
    const first = setTimeout(update, 0);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      clearTimeout(first);
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

  return (
    <div className="relative">
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

      {!(atStart && atEnd) && (
        <>
          <ArrowButton
            direction={-1}
            disabled={atStart}
            onClick={() => page(-1)}
          />
          <ArrowButton direction={1} disabled={atEnd} onClick={() => page(1)} />
        </>
      )}
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
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 1 ? "Kos berikutnya" : "Kos sebelumnya"}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-xl font-extrabold text-white shadow-float transition-[opacity,background-color,scale] duration-(--duration-fast) ease-out hover:bg-ink-soft active:scale-(--press-scale) active:duration-(--duration-press) disabled:pointer-events-none disabled:opacity-0 sm:flex ${
        direction === 1 ? "-right-4 lg:-right-6" : "-left-4 lg:-left-6"
      }`}
    >
      <span aria-hidden>{direction === 1 ? "›" : "‹"}</span>
    </button>
  );
}
