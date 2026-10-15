import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "LootMall Admin", template: "%s | LootMall Admin" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-maroon-50/40">{children}</div>;
}
