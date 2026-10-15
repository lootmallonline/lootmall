import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/admin";
import { formatPKR, toLocalPhone } from "@/lib/format";
import { StatusTimeline } from "@/components/shop/StatusTimeline";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type Order,
  type OrderItem,
  type OrderStatusHistory,
} from "@/lib/types";

export const metadata: Metadata = { title: "Track your order", robots: { index: false } };

type TrackedOrder = Order & { order_items: OrderItem[]; order_status_history: OrderStatusHistory[] };
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function TrackPage({ searchParams }: Props) {
  const sp = await searchParams;
  const orderNumber = first(sp.order).trim().toUpperCase();
  const phoneInput = first(sp.phone).trim();
  const searched = orderNumber !== "" || phoneInput !== "";

  let order: TrackedOrder | null = null as TrackedOrder | null;
  const phone = toLocalPhone(phoneInput);

  if (/^LM-\d{6}-[A-Z0-9]{6}$/.test(orderNumber) && phone) {
    try {
      const supabase = createServiceClient();
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*), order_status_history(*)")
        .eq("order_number", orderNumber)
        .maybeSingle();
      // Both the order number AND the phone number must match.
      if (data && toLocalPhone(data.phone as string) === phone) order = data as TrackedOrder;
    } catch {
      order = null;
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Track your order</h1>
      <p className="mt-2 text-sm text-ink/70">Enter your order number and the phone number you used when ordering.</p>

      <form action="/track" className="card mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="order" className="label">Order number</label>
          <input id="order" name="order" defaultValue={orderNumber} placeholder="LM-261014-AB12CD" required className="input font-mono" />
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone number</label>
          <input id="phone" name="phone" type="tel" defaultValue={phoneInput} placeholder="03XXXXXXXXX" required className="input" />
        </div>
        <button type="submit" className="btn-primary sm:col-span-2">Track order</button>
      </form>

      {searched && !order && (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900" role="status">
          We could not find an order with these details. Please check the order number and phone number and try again.
        </p>
      )}

      {order && (
        <div className="card mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-lg font-bold text-maroon-700">{order.order_number}</p>
            <span className="rounded-full bg-gold-300/50 px-3 py-1 text-sm font-semibold">{ORDER_STATUS_LABELS[order.status]}</span>
          </div>
          <StatusTimeline status={order.status} history={order.order_status_history ?? []} />
          <ul className="divide-y divide-maroon-100 border-t border-maroon-100 text-sm">
            {(order.order_items ?? []).map((i) => (
              <li key={i.id} className="flex justify-between gap-3 py-2">
                <span>{i.name} <span className="text-ink/60">× {i.quantity}</span></span>
                <span>{formatPKR(i.line_total)}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <span>{PAYMENT_METHOD_LABELS[order.payment_method]} · {PAYMENT_STATUS_LABELS[order.payment_status]}</span>
            <span className="font-bold text-maroon-700">Total {formatPKR(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
