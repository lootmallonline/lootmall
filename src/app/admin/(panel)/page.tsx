import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatPKR } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { OrderStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Dashboard" };

type Stats = {
  products: number;
  active_products: number;
  orders: number;
  pending: number;
  sales_total: number;
  delivered_total: number;
};

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const [{ data: stats }, { data: recent }, { data: low }] = await Promise.all([
    supabase.rpc("admin_stats"),
    supabase.from("orders").select("id,order_number,customer_name,total,status,created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select("id,name,stock").eq("is_active", true).lte("stock", 5).order("stock", { ascending: true }).limit(6),
  ]);
  const s = (stats ?? { products: 0, active_products: 0, orders: 0, pending: 0, sales_total: 0, delivered_total: 0 }) as Stats;

  const cards = [
    { label: "Products", value: String(s.products), sub: `${s.active_products} visible` },
    { label: "Orders", value: String(s.orders), sub: `${s.pending} pending` },
    { label: "Sales (not cancelled)", value: formatPKR(s.sales_total), sub: "All orders except cancelled" },
    { label: "Delivered sales", value: formatPKR(s.delivered_total), sub: "Delivered orders only" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <p className="text-sm text-ink/70">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-maroon-700">{c.value}</p>
            <p className="text-xs text-ink/60">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-maroon-700">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-maroon-600 hover:underline">View all</Link>
          </div>
          {recent && recent.length > 0 ? (
            <ul className="divide-y divide-maroon-100 text-sm">
              {recent.map((o) => (
                <li key={o.id as string} className="flex items-center justify-between gap-3 py-2">
                  <Link href={`/admin/orders/${o.id}`} className="min-w-0 hover:underline">
                    <span className="font-mono font-semibold">{o.order_number as string}</span>
                    <span className="block truncate text-ink/60">{o.customer_name as string} · {formatPKR(o.total as number)}</span>
                  </Link>
                  <StatusBadge status={o.status as OrderStatus} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">No orders yet.</p>
          )}
        </section>

        <section className="card">
          <h2 className="mb-3 font-display text-lg font-bold text-maroon-700">Low stock</h2>
          {low && low.length > 0 ? (
            <ul className="divide-y divide-maroon-100 text-sm">
              {low.map((p) => (
                <li key={p.id as string} className="flex items-center justify-between gap-3 py-2">
                  <Link href={`/admin/products/${p.id}`} className="truncate hover:underline">{p.name as string}</Link>
                  <span className={`shrink-0 font-semibold ${(p.stock as number) === 0 ? "text-red-700" : "text-amber-700"}`}>{p.stock as number} left</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">No products are running low.</p>
          )}
        </section>
      </div>
    </div>
  );
}
