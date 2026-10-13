import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { formatPKR, whatsappUrl } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import type { Order, OrderItem } from "@/lib/types";

export const metadata: Metadata = { title: "Order details" };
type Props = { params: Promise<{ id: string }> };

export default async function AdminOrderDetail({ params }: Props) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: order }, { data: itemRows }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);
  if (!order) notFound();
  const o = order as Order;
  const items = (itemRows ?? []) as OrderItem[];

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-maroon-700 hover:underline">← All orders</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-2xl font-bold text-maroon-700">{o.order_number}</h1>
          <StatusBadge status={o.status} />
        </div>
        <p className="text-sm text-ink/60">
          Placed {new Date(o.created_at).toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "long", timeStyle: "short" })}
        </p>
      </div>

      <section className="card"><OrderStatusForm orderId={o.id} status={o.status} /></section>

      <section className="card space-y-2 text-sm">
        <h2 className="font-display text-lg font-bold text-maroon-700">Customer</h2>
        <p><span className="font-medium">Name:</span> {o.customer_name}</p>
        <p><span className="font-medium">Phone:</span> <a href={`tel:${o.phone}`} className="text-maroon-700 hover:underline">{o.phone}</a>{" · "}
          <a href={whatsappUrl(o.phone, `Hello ${o.customer_name}, this is LootMall about your order ${o.order_number}.`)} target="_blank" rel="noopener noreferrer" className="text-maroon-700 hover:underline">WhatsApp</a></p>
        <p><span className="font-medium">City:</span> {o.city}</p>
        <p><span className="font-medium">Address:</span> {o.address}</p>
        {o.notes && <p><span className="font-medium">Notes:</span> {o.notes}</p>}
      </section>

      <section className="card">
        <h2 className="mb-3 font-display text-lg font-bold text-maroon-700">Items</h2>
        <ul className="divide-y divide-maroon-100 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2">
              <span>{i.name} {i.sku && <span className="text-ink/50">({i.sku})</span>} <span className="text-ink/60">× {i.quantity} @ {formatPKR(i.unit_price)}</span></span>
              <span className="font-medium">{formatPKR(i.line_total)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-maroon-100 pt-3 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPKR(o.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{formatPKR(o.delivery_charge)}</dd></div>
          <div className="flex justify-between text-base font-bold text-maroon-700"><dt>Total</dt><dd>{formatPKR(o.total)}</dd></div>
        </dl>
      </section>
    </div>
  );
}
