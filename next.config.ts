import type { NextConfig } from "next";

// Derived from the env var (e.g. lznureigcxhlpxfdynuu.supabase.co) rather than
// hardcoded, so a fork pointed at another Supabase project keeps its photos.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  // The "N" badge `next dev` draws in the bottom-left corner. Hidden because it
  // sits over the page during demos; compile and runtime errors still show.
  // It never appears in a production build either way.
  devIndicators: false,

  // No `X-Powered-By: Next.js`: it tells an attacker which exploits to try.
  poweredByHeader: false,

  images: {
    // Review photos uploaded to the public `review-photos` bucket (0010). Only that
    // bucket's public path is allowed, not the whole Supabase domain.
    remotePatterns: URL.canParse(supabaseUrl ?? "")
      ? [
          new URL(
            "/storage/v1/object/public/review-photos/**",
            supabaseUrl,
          ),
        ]
      : [],
  },

  // Hardening headers. The CSP is the safe subset: it forbids framing the
  // site, plugins, a rewritten <base>, and forms posting off-site, but does
  // not restrict scripts, styles, images or connections. A `script-src` CSP
  // needs a nonce per request (every page dynamic), and a wrong one breaks
  // the map's OSM tiles, Nominatim and Supabase in ways that are hard to see.
  // XSS is kept out at the source instead: React escaping, no
  // dangerouslySetInnerHTML, map text through React (docs/02-architecture).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
          },
          // The site uses none of these; nothing embedded may ask for them.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
