import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { PaymentStatusForm } from "@/components/admin/PaymentStatusForm";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type Order } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*), order_status_history(*)")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const order = data as Order;
  const items = order.order_items ?? [];
  const history = [...(order.order_status_history ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/orders" className="text-sm text-maroon-600">← All orders</Link>
          <h1 className="font-mono text-2xl font-bold text-maroon-700">{order.order_number}</h1>
          <p className="text-sm text-gray-500">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/orders/${order.id}/label`} className="btn-gold" target="_blank">Print Packing Label</Link>
          <Link href={`/admin/orders/${order.id}/invoice`} className="btn-outline" target="_blank">Print Invoice</Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-4 text-sm">
            <h2 className="mb-2 font-display text-lg font-bold">Customer</h2>
            <p className="font-semibold">{order.customer_name}</p>
            <p>{order.phone}</p>
            <p className="whitespace-pre-line">{order.address}</p>
            <p>{order.city}</p>
            {order.notes && <p className="mt-2 rounded-lg bg-amber-50 p-2">Note: {order.notes}</p>}
            <p className="mt-2 text-xs text-gray-500">{order.customer_id ? "Registered customer" : "Guest checkout"}</p>
          </section>

          <section className="card overflow-x-auto p-4 text-sm">
            <h2 className="mb-2 font-display text-lg font-bold">Items</h2>
            <table className="w-full text-left">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-1">Item</th>
                  <th className="py-1">Price</th>
                  <th className="py-1">Qty</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t">
                    <td className="py-1.5">
                      {i.name}
                      {i.sku && <span className="ml-2 text-xs text-gray-500">{i.sku}</span>}
                    </td>
                    <td className="py-1.5">{formatPrice(i.unit_price)}</td>
                    <td className="py-1.5">{i.quantity}</td>
                    <td className="py-1.5 text-right">{formatPrice(i.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 space-y-1 border-t pt-2 text-right">
              <p>Subtotal: {formatPrice(order.subtotal)}</p>
              <p>Delivery: {formatPrice(order.delivery_charge)}</p>
              <p className="text-base font-bold">Total: {formatPrice(order.total)}</p>
            </div>
          </section>

          <section className="card p-4 text-sm">
            <h2 className="mb-2 font-display text-lg font-bold">Status history</h2>
            <ol className="space-y-1 border-l-2 border-maroon-100 pl-3">
              {history.map((h) => (
                <li key={h.id}>
                  <span className="font-semibold">{ORDER_STATUS_LABELS[h.status] ?? h.status}</span>
                  <span className="ml-2 text-xs text-gray-500">{formatDateTime(h.created_at)}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card space-y-3 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Order</span>
              <OrderStatusBadge status={order.status} />
            </div>
            <OrderStatusForm orderId={order.id} status={order.status} />
          </section>

          <section className="card space-y-3 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}</span>
              <PaymentStatusBadge status={order.payment_status} />
            </div>
            {order.payment_reference && (
              <p>
                Transaction ID: <strong className="font-mono">{order.payment_reference}</strong>
              </p>
            )}
            {order.payment_method === "advance" && order.payment_status !== "paid" && (
              <p className="rounded-lg bg-amber-50 p-2 text-xs">Check the payment in your account, then set it to Paid before packing.</p>
            )}
            <PaymentStatusForm orderId={order.id} status={order.payment_status} />
          </section>
        </div>
      </div>
    </div>
  );
}
