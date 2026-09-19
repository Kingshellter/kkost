import type { NextConfig } from "next";

// Derived from the env var (e.g. lznureigcxhlpxfdynuu.supabase.co) rather than
// hardcoded, so a fork pointed at another Supabase project keeps its photos.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  images: {
    // Kos photos uploaded to the public `kos-photos` bucket (0009). Only that
    // bucket's public path is allowed, not the whole Supabase domain.
    remotePatterns: URL.canParse(supabaseUrl ?? "")
      ? [
          new URL(
            "/storage/v1/object/public/kos-photos/**",
            supabaseUrl,
          ),
        ]
      : [],
  },

  // Basic hardening only. A full Content-Security-Policy is deliberately left
  // out: the map pulls tiles and Nominatim results from other origins, and a
  // wrong CSP breaks the demo in ways that are hard to see.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
