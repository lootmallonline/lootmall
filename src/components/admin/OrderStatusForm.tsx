"use client";

import { updateOrderStatusAction } from "@/app/admin/actions";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { useAdminForm } from "./useAdminForm";

export function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const { state, pending, onSubmit } = useAdminForm(updateOrderStatusAction.bind(null, orderId), {});
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="status" className="label">Order status</label>
        <select id="status" name="status" defaultValue={status} className="input">
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className="btn-primary">{pending ? "Updating…" : "Update status"}</button>
      {state.error && <p className="w-full text-sm text-red-700" role="alert">{state.error}</p>}
      {state.ok && <p className="w-full text-sm text-emerald-700" role="status">Status updated.</p>}
    </form>
  );
}
