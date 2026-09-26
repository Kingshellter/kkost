import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Options for the Supabase session cookies, shared by the server client, the
 * browser client and the proxy so all three write the same cookie.
 *
 * `secure` in production: the cookie is only ever sent over HTTPS. Not in
 * development, where `next dev` is opened over plain http from a phone on
 * the LAN (http://<ip>:3000) and a Secure cookie would never be stored.
 *
 * Not `httpOnly`, and it cannot be: the browser client reads the session to
 * upload review photos and add a kos straight to Supabase. XSS is therefore
 * kept out at the source (see "Security" in docs/02-architecture.md).
 * `sameSite: "lax"` and `path: "/"` stay the library defaults.
 */
export const SUPABASE_COOKIE_OPTIONS: CookieOptionsWithName = {
  secure: process.env.NODE_ENV === "production",
};
