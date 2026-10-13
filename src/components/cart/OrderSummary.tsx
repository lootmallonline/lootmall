import { formatPKR } from "@/lib/format";

export function OrderSummary({
  subtotal,
  delivery,
  total,
  ready,
}: {
  subtotal: number;
  delivery: number;
  total: number;
  ready: boolean;
}) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd>{formatPKR(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt>Delivery charges</dt>
        <dd>{ready ? formatPKR(delivery) : "Calculating…"}</dd>
      </div>
      <div className="flex justify-between border-t border-maroon-100 pt-3 text-base font-bold text-maroon-700">
        <dt>Total</dt>
        <dd>{ready ? formatPKR(total) : "…"}</dd>
      </div>
    </dl>
  );
}
