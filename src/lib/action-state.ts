import type { FacilityKey } from "@/data/kos";

/**
 * `useActionState` initial values live here, not next to the actions:
 * a "use server" module may only export async functions, so exporting a plain
 * object from one breaks the build.
 */

export type AuthState = {
  error: string | null;
  /** Set when sign-up succeeded but the address still needs confirming. */
  notice: string | null;
};

export const AUTH_INITIAL: AuthState = { error: null, notice: null };

export type ReviewState = { error: string | null; ok: boolean };

export const REVIEW_INITIAL: ReviewState = { error: null, ok: false };

export type FacilityScores = Record<FacilityKey, number>;
