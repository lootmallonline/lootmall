import type { Metadata, Viewport } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "../lib/site";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Shop Smart, Save Big Every Day`, template: `%s | ${SITE_NAME}` },
  description:
    "Shop online in Pakistan with LootMall. Browse products, add to cart and order with delivery to your door. Prices in PKR.",
  openGraph: { type: "website", locale: "en_PK", siteName: SITE_NAME, url: SITE_URL },
};

export const viewport: Viewport = { themeColor: "#751b2d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}

export const dynamic = "force-dynamic";
