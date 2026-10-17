import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { PrintControls } from "@/components/admin/PrintControls";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, type Order } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Invoice" };

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [{ data }, settings] = await Promise.all([
    supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle(),
    getSettings(),
  ]);
  if (!data) notFound();
  const order = data as Order;
  const items = order.order_items ?? [];

  return (
    <div>
      <style>{`@page { size: A4; margin: 12mm; } @media print { html, body { margin: 0; background: #fff; } }`}</style>
      <PrintControls backHref={`/admin/orders/${order.id}`} />

      <div className="mx-auto max-w-[210mm] bg-white p-8 text-sm text-black shadow print:max-w-none print:p-0 print:shadow-none">
        <div className="flex items-start justify-between border-b-2 border-black pb-4">
          <div>
            <p className="font-display text-3xl font-bold">{settings.store_name}</p>
            <p>{settings.tagline}</p>
            <p>{settings.contact_phone} · {settings.contact_email}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold uppercase">Invoice</p>
            <p className="font-mono">{order.order_number}</p>
            <p>{formatDate(order.created_at)}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold uppercase text-gray-500">Bill to / Ship to</p>
            <p className="font-semibold">{order.customer_name}</p>
            <p>{order.phone}</p>
            <p className="whitespace-pre-line">{order.address}</p>
            <p>{order.city}</p>
          </div>
          <div className="text-right">
            <p>
              <span className="text-xs font-bold uppercase text-gray-500">Payment: </span>
              {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
            </p>
            <p>
              <span className="text-xs font-bold uppercase text-gray-500">Payment status: </span>
              {PAYMENT_STATUS_LABELS[order.payment_status] ?? order.payment_status}
            </p>
            <p>
              <span className="text-xs font-bold uppercase text-gray-500">Order status: </span>
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </p>
            {order.payment_reference && (
              <p>
                <span className="text-xs font-bold uppercase text-gray-500">Transaction ID: </span>
                {order.payment_reference}
              </p>
            )}
          </div>
        </div>

        <table className="mt-6 w-full text-left">
          <thead>
            <tr className="border-b-2 border-black text-xs uppercase">
              <th className="py-2">Item</th>
              <th className="py-2">Price</th>
              <th className="py-2">Qty</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-b">
                <td className="py-2">
                  {i.name}
                  {i.sku && <span className="ml-2 text-xs text-gray-500">{i.sku}</span>}
                </td>
                <td className="py-2">{formatPrice(i.unit_price)}</td>
                <td className="py-2">{i.quantity}</td>
                <td className="py-2 text-right">{formatPrice(i.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-4 w-64 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{formatPrice(order.delivery_charge)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-black pt-1 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-gray-500">Thank you for shopping with {settings.store_name}.</p>
      </div>
    </div>
  );
}
