import { requireAdmin } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

/** Print pages: only the admin check, no menu, so the paper shows just the label or invoice. */
export default async function PrintLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <div className="min-h-screen bg-gray-100 p-4 print:bg-white print:p-0">{children}</div>;
}
