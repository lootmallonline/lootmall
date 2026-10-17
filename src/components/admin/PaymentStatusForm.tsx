"use client";

import { updatePaymentStatusAction } from "@/app/admin/actions";
import { useActionForm } from "@/components/useActionForm";
import { PAYMENT_STATUSES, PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/lib/types";
import { FormMessage } from "./ui";

export function PaymentStatusForm({ orderId, status }: { orderId: string; status: PaymentStatus }) {
  const { state, pending, onSubmit } = useActionForm(updatePaymentStatusAction.bind(null, orderId));
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label className="label" htmlFor="payment_status">Payment status</label>
      <div className="flex gap-2">
        <select id="payment_status" name="payment_status" defaultValue={status} className="input">
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "..." : "Update"}
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
