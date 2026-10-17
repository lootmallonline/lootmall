import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

interface Stats {
  products: number;
  active_products: number;
  orders: number;
  pending: number;
  sales_total: number;
  delivered_total: number;
}

function Stat({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const body = (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-maroon-700">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();
  const [{ data: stats }, { data: recent }] = await Promise.all([
    supabase.rpc("admin_stats"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(8),
  ]);
  const s = (stats ?? {}) as Partial<Stats>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Orders" value={s.orders ?? 0} href="/admin/orders" />
        <Stat label="Pending orders" value={s.pending ?? 0} href="/admin/orders?status=pending" />
        <Stat label="Products (active)" value={`${s.products ?? 0} (${s.active_products ?? 0})`} href="/admin/products" />
        <Stat label="Sales (not cancelled)" value={formatPrice(s.sales_total ?? 0)} />
        <Stat label="Delivered sales" value={formatPrice(s.delivered_total ?? 0)} />
      </div>

      <section className="card overflow-x-auto">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-display text-xl font-bold">Latest orders</h2>
          <Link href="/admin/orders" className="text-sm font-semibold text-maroon-600">View all</Link>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {((recent ?? []) as Order[]).map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-4 py-2 font-mono">
                  <Link href={`/admin/orders/${o.id}`} className="text-maroon-600 hover:underline">{o.order_number}</Link>
                </td>
                <td className="px-4 py-2">{o.customer_name}</td>
                <td className="px-4 py-2">{formatPrice(o.total)}</td>
                <td className="px-4 py-2"><OrderStatusBadge status={o.status} /></td>
                <td className="px-4 py-2 text-gray-500">{formatDateTime(o.created_at)}</td>
              </tr>
            ))}
            {(!recent || recent.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
