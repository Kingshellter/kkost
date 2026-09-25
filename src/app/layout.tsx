import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "kkost · Pilih kos dari orang yang pernah tinggal di dalamnya",
  description:
    "Iklan kos ditulis pemiliknya. Di kkost, penghuni menilai enam fasilitas satu per satu, di seluruh Indonesia. Pemilik kos tidak pernah bisa menghapus review.",
};

/*
 * - viewportFit "cover": in landscape the dark map and amber CTA bands run
 *   under the notch instead of stopping at a cream letterbox. Content stays
 *   clear of it through `px-gutter` / `pb-safe` (globals.css); without this
 *   the env(safe-area-inset-*) values those use are all 0.
 * - interactiveWidget "resizes-content": Android Chrome shrinks the layout
 *   for the keyboard, as iOS does, so the add-kos dialog's fields scroll
 *   into view above it.
 * - themeColor mirrors --color-cream (a meta tag cannot read a CSS
 *   variable; change both together), the colour at the top of every page.
 *   One value: the site has no dark scheme.
 * - Zoom stays enabled. Inputs are 16px, which is what stops iOS zooming.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: "#f1ece3",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
      </body>
    </html>
  );
}
