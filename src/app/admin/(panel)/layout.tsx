import { requireAdmin } from "@/lib/admin";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl font-bold text-maroon-700">LootMall <span className="text-gold-500">Admin</span></p>
        <form action={logoutAction} className="flex items-center gap-3 text-sm">
          <span className="hidden text-ink/60 sm:inline">{user.email}</span>
          <button type="submit" className="btn-outline px-4 py-1.5">Log out</button>
        </form>
      </header>
      <div className="grid gap-6 lg:grid-cols-[13rem_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
