import type { Metadata } from "next";
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
