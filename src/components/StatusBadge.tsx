import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/types";

const ORDER_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  packed: "bg-blue-100 text-blue-800",
  dispatched: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  unpaid: "bg-gray-100 text-gray-700",
  awaiting_verification: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ORDER_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAYMENT_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
