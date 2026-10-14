import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  packed: "bg-indigo-100 text-indigo-900",
  dispatched: "bg-purple-100 text-purple-900",
  delivered: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-red-100 text-red-900",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status] ?? ""}`}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}
