import type { ReactNode } from "react";
import { REVEAL_LINE, step } from "./reveal-classes";

/**
 * One line of a section headline that rises from under a mask when its
 * `<Reveal>` block is shown. The mask keeps 4px of bottom padding for
 * descenders; `text-balance` stops a narrow screen from leaving one word
 * alone on the wrapped line.
 */
export function MaskLine({
  beat,
  children,
}: {
  /** The entrance beat (`step(n)`). */
  beat: number;
  children: ReactNode;
}) {
  return (
    <span className="block overflow-hidden pb-1">
      <span style={step(beat)} className={`block text-balance ${REVEAL_LINE}`}>
        {children}
      </span>
    </span>
  );
}
