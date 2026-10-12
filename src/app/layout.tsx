import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
const heading = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const ui = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-ui",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "UndangKita — Setiap momen layak dikenang",
    template: "%s | UndangKita",
  },
  description:
    "Undangan digital elegan. Beli template sekali, buat undangan tanpa batas dan tanpa masa aktif.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="id"
      className={`${heading.variable} ${ui.variable}`}
    >
      <body>
        <a href="#main" className="skip-link">
          Langsung ke konten
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
