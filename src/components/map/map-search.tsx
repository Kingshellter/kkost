"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { searchPlaces, type Place } from "@/lib/geocode";

/** Below this the geocoder mostly returns noise, so it is not worth a request. */
const MIN_QUERY = 3;
/** Nominatim asks callers not to fire a request on every keystroke. */
const DEBOUNCE_MS = 450;

type Props = {
  /** A result was chosen — the map should move there and drop a pin. */
  onPick: (place: Place) => void;
  /** The box was emptied — the map should drop the place pin, not the view. */
  onClear: () => void;
};

/**
 * Search box for streets, neighbourhoods, campuses and landmarks.
 *
 * It renders *outside* `MapContainer` (see `KosMap`) so Leaflet never sees the
 * clicks and keystrokes — inside the map, every one of them would also drag,
 * zoom, or open the add-kos draft.
 */
export function MapSearch({ onPick, onClear }: Props) {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  /** Index of the keyboard-highlighted option; -1 is "none". */
  const [active, setActive] = useState(-1);

  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  /**
   * The label a pick wrote into the input. Without it, choosing a result would
   * immediately re-search for its own name and reopen the dropdown.
   */
  const pickedLabel = useRef<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    // `pickedLabel` is what a pick wrote into the box, and anything shorter
    // than MIN_QUERY was already reset by `type()`. Neither is worth a request.
    if (trimmed.length < MIN_QUERY || trimmed === pickedLabel.current) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const result = await searchPlaces(trimmed, { signal: controller.signal });
      // An abort comes from this effect's own cleanup, which means a newer
      // query is already in flight and this answer is stale.
      if (controller.signal.aborted) return;

      setLoading(false);
      setError(result.status === "error" ? result.message : null);
      setPlaces(result.status === "ok" ? result.places : []);
      setActive(-1);
      setOpen(true);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // A press anywhere else — including on the map — dismisses the results.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  /**
   * Every state change the typing causes lives here rather than in the effect
   * above: React's lint rejects a synchronous setState inside an effect body,
   * and the debounced fetch is the only thing that genuinely needs one.
   */
  function type(value: string) {
    setQuery(value);
    // Typing means the box no longer holds a pick. Without this, editing a
    // picked label back to itself showed "Mencari…" while the effect skipped
    // the request, and the spinner never cleared.
    pickedLabel.current = null;

    if (value.trim().length < MIN_QUERY) {
      setPlaces([]);
      setError(null);
      setLoading(false);
      setOpen(false);
      setActive(-1);
      return;
    }

    // Show "Mencari…" the moment a request becomes inevitable, not one
    // debounce later.
    setLoading(true);
    setOpen(true);
  }

  function pick(place: Place) {
    pickedLabel.current = place.name;
    setQuery(place.name);
    setOpen(false);
    setActive(-1);
    onPick(place);
  }

  function clear() {
    pickedLabel.current = null;
    setQuery("");
    setPlaces([]);
    setError(null);
    setOpen(false);
    setActive(-1);
    onClear();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!places.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i + 1) % places.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => (i <= 0 ? places.length - 1 : i - 1));
    }
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    // Enter with nothing highlighted takes the geocoder's best match.
    const chosen = places[active] ?? places[0];
    if (chosen) pick(chosen);
  }

  // `open` alone decides this: it is only ever true once a query is long
  // enough to search, so the panel always has something to say — results, a
  // spinner, an error, or "nothing matched".
  return (
    <div ref={rootRef} className="pointer-events-auto relative w-full">
      <form role="search" onSubmit={onSubmit}>
        <label htmlFor={`${listId}-input`} className="sr-only">
          Cari jalan atau tempat
        </label>
        <div className="flex items-center gap-2 rounded-full bg-white/95 pl-4 pr-1.5 shadow-lift focus-within:ring-2 focus-within:ring-focus">
          <SearchIcon />
          <input
            id={`${listId}-input`}
            type="search"
            role="combobox"
            autoComplete="off"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              active >= 0 ? `${listId}-${active}` : undefined
            }
            value={query}
            placeholder="Cari jalan atau tempat…"
            enterKeyHint="search"
            onChange={(e) => type(e.target.value)}
            onFocus={() => places.length && setOpen(true)}
            onKeyDown={onKeyDown}
            // The last variant hides WebKit's own clear button, which would
            // otherwise sit next to ours doing the same job.
            className="min-w-0 flex-1 bg-transparent py-3 text-base font-bold text-ink outline-none placeholder:font-medium placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={clear}
              aria-label="Hapus pencarian"
              // 36px drawn so the pill stays slim; the ::before takes the
              // target to 44px.
              className="relative grid size-9 shrink-0 place-items-center rounded-full bg-cream text-muted transition-[background-color,color,scale] duration-(--duration-fast) ease-out before:absolute before:-inset-1 before:content-[''] hover:bg-cream-deep hover:text-ink active:scale-(--press-scale) active:duration-(--duration-press)"
            >
              <X aria-hidden className="size-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </form>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Hasil pencarian tempat"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] max-h-64 overflow-y-auto overscroll-contain rounded-media bg-white p-2 shadow-float"
        >
          {loading && (
            <li className="px-3 py-2.5 text-sm font-bold text-muted">
              Mencari…
            </li>
          )}

          {!loading && error && (
            <li className="px-3 py-2.5 text-sm font-bold text-danger">
              {error}
            </li>
          )}

          {!loading && !error && places.length === 0 && (
            <li className="px-3 py-2.5 text-sm font-bold text-muted">
              Tidak ada tempat yang cocok.
            </li>
          )}

          {!loading &&
            !error &&
            places.map((place, index) => (
              <li key={place.id}>
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === active}
                  onClick={() => pick(place)}
                  onMouseEnter={() => setActive(index)}
                  className={
                    index === active
                      ? "block w-full rounded-box bg-cream px-3 py-2.5 text-left transition-colors"
                      : "block w-full rounded-box px-3 py-2.5 text-left transition-colors"
                  }
                >
                  <span className="block truncate text-sm font-extrabold text-ink">
                    {place.name}
                  </span>
                  {place.detail && (
                    <span className="mt-0.5 block truncate text-xs font-medium text-muted">
                      {place.detail}
                    </span>
                  )}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className="size-4 shrink-0 text-muted"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </svg>
  );
}
