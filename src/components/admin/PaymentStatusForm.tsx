"use client";

import { updatePaymentStatusAction } from "@/app/admin/actions";
import { useAdminForm } from "./useAdminForm";
import { PAYMENT_STATUSES, PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/lib/types";

export function PaymentStatusForm({ orderId, status }: { orderId: string; status: PaymentStatus }) {
  const { state, pending, onSubmit } = useAdminForm(updatePaymentStatusAction.bind(null, orderId), {});
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="payment_status" className="label">Payment status</label>
        <select id="payment_status" name="payment_status" defaultValue={status} className="input">
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={pending} className="btn-outline">{pending ? "Saving…" : "Update payment"}</button>
      {state.error && <p className="w-full text-sm text-red-700" role="alert">{state.error}</p>}
      {state.ok && <p className="w-full text-sm text-emerald-700" role="status">Payment status updated.</p>}
    </form>
  );
}
