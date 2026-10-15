import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/data";
import { formatPKR } from "@/lib/format";
import { LOGO_SRC, SITE_NAME } from "@/lib/site";
import { PrintBar } from "@/components/admin/PrintBar";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, type Order, type OrderItem } from "@/lib/types";

export const metadata: Metadata = { title: "Invoice" };
type Props = { params: Promise<{ id: string }> };

export default async function Invoice({ params }: Props) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: order }, { data: itemRows }, settings] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
    getSettings(),
  ]);
  if (!order) notFound();
  const o = order as Order;
  const items = (itemRows ?? []) as OrderItem[];

  const css = `@page { size: A4; margin: 12mm; }
html, body { background: #fff; }
@media print { .no-print { display: none !important; } .invoice-sheet { border: none !important; box-shadow: none !important; } body, div { background: transparent !important; } }`;

  return (
    <div className="p-4 print:p-0">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PrintBar backHref={`/admin/orders/${o.id}`} />
      <div className="invoice-sheet mx-auto max-w-3xl space-y-6 border border-maroon-100 bg-white p-8 text-sm text-black shadow">
        <div className="flex items-start justify-between gap-4">
          <div>
            {LOGO_SRC ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={LOGO_SRC} alt={SITE_NAME} style={{ height: 40, width: "auto" }} />
            ) : (
              <p className="font-display text-3xl font-bold">{SITE_NAME}</p>
            )}
            <p className="mt-1">{settings.tagline}</p>
            <p>{settings.contact_phone} · {settings.contact_email}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold">INVOICE</p>
            <p className="font-mono font-bold">{o.order_number}</p>
            <p>{new Date(o.created_at).toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "long" })}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-bold uppercase">Bill / Ship to</p>
            <p>{o.customer_name}</p>
            <p>{o.phone}</p>
            <p>{o.address}</p>
            <p>{o.city}</p>
          </div>
          <div>
            <p className="font-bold uppercase">Payment</p>
            <p>{PAYMENT_METHOD_LABELS[o.payment_method]}</p>
            <p>Status: {PAYMENT_STATUS_LABELS[o.payment_status]}</p>
            {o.payment_reference && <p>Reference: {o.payment_reference}</p>}
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="border-b-2 border-black">
            <tr><th className="py-2">Item</th><th className="py-2 text-right">Price</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Amount</th></tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b border-gray-300">
                <td className="py-2">{i.name}{i.sku ? ` (${i.sku})` : ""}</td>
                <td className="py-2 text-right">{formatPKR(i.unit_price)}</td>
                <td className="py-2 text-right">{i.quantity}</td>
                <td className="py-2 text-right">{formatPKR(i.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="ml-auto w-full max-w-xs space-y-1">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatPKR(o.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{formatPKR(o.delivery_charge)}</dd></div>
          <div className="flex justify-between border-t-2 border-black pt-1 text-base font-bold"><dt>Total</dt><dd>{formatPKR(o.total)}</dd></div>
        </dl>
        <p className="text-center text-xs">Thank you for shopping with {SITE_NAME}.</p>
      </div>
    </div>
  );
}
