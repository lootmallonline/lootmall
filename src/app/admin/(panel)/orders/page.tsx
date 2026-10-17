import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type Order } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { supabase } = await requireAdmin();
  const { status, q } = await searchParams;

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  const term = (q ?? "").replace(/[%,()*\\]/g, " ").trim();
  if (term) query = query.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%,phone.ilike.%${term}%`);
  const { data } = await query;
  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Orders</h1>

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/orders" className={`rounded-full border px-3 py-1 text-sm ${!status ? "bg-maroon-600 text-white" : "hover:bg-maroon-50"}`}>
          All
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={`rounded-full border px-3 py-1 text-sm ${status === s ? "bg-maroon-600 text-white" : "hover:bg-maroon-50"}`}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
        <form action="/admin/orders" className="ml-auto flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q ?? ""} placeholder="Order no, name or phone" className="input w-56" />
          <button type="submit" className="btn-outline">Search</button>
        </form>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Order</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t align-top">
                <td className="px-4 py-2 font-mono">
                  <Link href={`/admin/orders/${o.id}`} className="text-maroon-600 hover:underline">{o.order_number}</Link>
                </td>
                <td className="px-4 py-2">
                  {o.customer_name}
                  <div className="text-xs text-gray-500">{o.phone}</div>
                </td>
                <td className="px-4 py-2">{o.city}</td>
                <td className="px-4 py-2">{formatPrice(o.total)}</td>
                <td className="px-4 py-2">
                  <div className="text-xs text-gray-500">{PAYMENT_METHOD_LABELS[o.payment_method] ?? o.payment_method}</div>
                  <PaymentStatusBadge status={o.payment_status} />
                </td>
                <td className="px-4 py-2"><OrderStatusBadge status={o.status} /></td>
                <td className="px-4 py-2 text-gray-500">{formatDateTime(o.created_at)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
