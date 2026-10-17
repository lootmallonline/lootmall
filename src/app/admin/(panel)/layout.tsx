import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { adminLogoutAction } from "@/app/admin/actions";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-gray-50 md:flex">
      <aside className="bg-maroon-800 text-white md:min-h-screen md:w-56 md:shrink-0">
        <div className="flex items-center justify-between px-4 py-3 md:block">
          <Link href="/admin" className="font-display text-xl font-bold text-gold-300">
            LootMall Admin
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2 md:flex-col md:overflow-visible md:pb-0">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-maroon-700">
              {n.label}
            </Link>
          ))}
          <Link href="/" className="whitespace-nowrap rounded-lg px-3 py-2 text-sm text-gold-300 hover:bg-maroon-700">
            View store
          </Link>
          <form action={adminLogoutAction}>
            <button type="submit" className="w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm hover:bg-maroon-700">
              Log out
            </button>
          </form>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
