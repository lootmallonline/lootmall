import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type Order } from "@/lib/types";

export function OrderCard({ order }: { order: Order }) {
  const history = [...(order.order_status_history ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const items = order.order_items ?? [];

  return (
    <div className="card space-y-3 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-base font-bold">{order.order_number}</p>
          <p className="text-xs text-gray-500">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.payment_status} />
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 p-3">
        {items.map((i) => (
          <div key={i.id} className="flex justify-between gap-2 py-0.5">
            <span className="min-w-0 flex-1 truncate">
              {i.name} × {i.quantity}
            </span>
            <span>{formatPrice(i.line_total)}</span>
          </div>
        ))}
        <div className="mt-1 flex justify-between border-t pt-1">
          <span>Delivery</span>
          <span>{formatPrice(order.delivery_charge)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total ({PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method})</span>
          <span className="text-maroon-600">{formatPrice(order.total)}</span>
        </div>
      </div>

      {history.length > 0 && (
        <ol className="space-y-1 border-l-2 border-maroon-100 pl-3">
          {history.map((h) => (
            <li key={h.id} className="text-xs">
              <span className="font-semibold">{ORDER_STATUS_LABELS[h.status] ?? h.status}</span>
              <span className="ml-2 text-gray-500">{formatDateTime(h.created_at)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
