"use client";

import { updateOrderStatusAction } from "@/app/admin/actions";
import { useActionForm } from "@/components/useActionForm";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { FormMessage } from "./ui";

export function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const { state, pending, onSubmit } = useActionForm(updateOrderStatusAction.bind(null, orderId));
  const locked = status === "cancelled" || status === "delivered";
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label className="label" htmlFor="status">Order status</label>
      <div className="flex gap-2">
        <select id="status" name="status" defaultValue={status} disabled={locked} className="input">
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending || locked} className="btn-primary">
          {pending ? "..." : "Update"}
        </button>
      </div>
      {locked && (
        <p className="text-xs text-gray-500">
          {status === "cancelled" ? "A cancelled order cannot be reopened." : "A delivered order cannot be changed."}
        </p>
      )}
      <FormMessage state={state} />
    </form>
  );
}
