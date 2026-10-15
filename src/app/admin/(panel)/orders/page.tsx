import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatPKR } from "@/lib/format";
import { sanitizeSearch } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, type Order } from "@/lib/types";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Pagination } from "@/components/shop/Pagination";

export const metadata: Metadata = { title: "Orders" };
const PAGE = 30;
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function AdminOrders({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = sanitizeSearch(first(sp.q) ?? "");
  const status = first(sp.status) ?? "";
  const page = Math.max(1, parseInt(first(sp.page) ?? "1", 10) || 1);
  const from = (page - 1) * PAGE;

  let query = supabase.from("orders").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(from, from + PAGE - 1);
  if ((ORDER_STATUSES as readonly string[]).includes(status)) query = query.eq("status", status);
  if (q) query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,phone.ilike.%${q}%`);
  const { data, count } = await query;
  const orders = (data ?? []) as Order[];

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Orders</h1>
      <form className="flex flex-wrap items-end gap-3" role="search">
        <div className="min-w-[14rem] flex-1">
          <label htmlFor="q" className="label">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Order number, name or phone" className="input" />
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" defaultValue={status} className="input">
            <option value="">All</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <button type="submit" className="btn-primary">Filter</button>
      </form>

      {orders.length === 0 ? (
        <div className="card text-sm text-ink/70">No orders found.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-maroon-100 bg-maroon-50 text-xs">
              <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">City</th><th className="p-3">Total</th><th className="p-3">Payment</th><th className="p-3">Status</th><th className="p-3">Date</th></tr>
            </thead>
            <tbody className="divide-y divide-maroon-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-maroon-50/50">
                  <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-maroon-700 hover:underline">{o.order_number}</Link></td>
                  <td className="p-3">{o.customer_name}<span className="block text-xs text-ink/60">{o.phone}</span></td>
                  <td className="p-3">{o.city}</td>
                  <td className="p-3 font-medium">{formatPKR(o.total)}</td>
                  <td className="p-3 text-xs">{PAYMENT_METHOD_LABELS[o.payment_method]}<span className={`block ${o.payment_status === "paid" ? "text-emerald-700" : "text-amber-700"}`}>{PAYMENT_STATUS_LABELS[o.payment_status]}</span></td>
                  <td className="p-3"><StatusBadge status={o.status} /></td>
                  <td className="p-3 whitespace-nowrap text-xs">{new Date(o.created_at).toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} total={count ?? 0} pageSize={PAGE} basePath="/admin/orders" params={{ q: q || undefined, status: status || undefined }} />
    </div>
  );
}
