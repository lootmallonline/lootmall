import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/admin";
import { getSettings } from "@/lib/data";
import { formatPKR, whatsappUrl } from "@/lib/format";
import { ORDER_STATUS_LABELS, type Order, type OrderItem, type OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmation", robots: { index: false, follow: false } };

type Props = { params: Promise<{ orderNumber: string }> };

export default async function OrderPage({ params }: Props) {
  const { orderNumber } = await params;
  if (!/^LM-\d{6}-[A-Z0-9]{6}$/.test(orderNumber)) notFound();

  const supabase = createServiceClient();
  const { data: order } = await supabase.from("orders").select("*").eq("order_number", orderNumber).maybeSingle();
  if (!order) notFound();
  const o = order as Order;
  const { data: itemRows } = await supabase.from("order_items").select("*").eq("order_id", o.id);
  const items = (itemRows ?? []) as OrderItem[];
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center">
        <CheckCircle2 className="mx-auto text-emerald-600" size={56} aria-hidden />
        <h1 className="mt-3 font-display text-3xl font-bold text-maroon-700">Thank you, {o.customer_name.split(" ")[0]}!</h1>
        <p className="mt-2 text-sm text-ink/70">Your order has been received. We will contact you on your phone number to confirm it.</p>
      </div>

      <div className="card mt-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-maroon-100 pb-4">
          <div>
            <p className="text-xs text-ink/60">Order number</p>
            <p className="font-mono text-lg font-bold text-maroon-700">{o.order_number}</p>
          </div>
          <span className="rounded-full bg-gold-300/50 px-3 py-1 text-sm font-semibold">{ORDER_STATUS_LABELS[o.status as OrderStatus]}</span>
        </div>

        <ul className="divide-y divide-maroon-100 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-3 py-2">
              <span>{i.name} <span className="text-ink/60">× {i.quantity}</span></span>
              <span className="font-medium">{formatPKR(i.line_total)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPKR(o.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery charges</dt><dd>{formatPKR(o.delivery_charge)}</dd></div>
          <div className="flex justify-between border-t border-maroon-100 pt-2 text-base font-bold text-maroon-700"><dt>Total</dt><dd>{formatPKR(o.total)}</dd></div>
        </dl>

        <p className="text-sm text-ink/70">Delivering to {o.city}. Please keep your order number for any questions.</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a href={whatsappUrl(settings.contact_phone, `Hello LootMall, my order number is ${o.order_number}.`)} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Message us on WhatsApp
        </a>
        <Link href="/products" className="btn-outline">Continue shopping</Link>
      </div>
    </div>
  );
}
