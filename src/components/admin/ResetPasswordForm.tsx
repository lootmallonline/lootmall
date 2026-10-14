"use client";

import { setCustomerPasswordAction } from "@/app/admin/actions";
import { useAdminForm } from "./useAdminForm";

export function ResetPasswordForm({ customerId }: { customerId: string }) {
  const { state, pending, onSubmit } = useAdminForm(setCustomerPasswordAction.bind(null, customerId), {});
  return (
    <details className="text-xs">
      <summary className="cursor-pointer font-medium text-maroon-700">Set new password</summary>
      <form onSubmit={onSubmit} className="mt-2 flex flex-wrap items-center gap-2">
        <label htmlFor={`pw-${customerId}`} className="sr-only">New password</label>
        <input id={`pw-${customerId}`} name="password" type="text" minLength={8} required placeholder="New password (8+ characters)" className="input max-w-[14rem] py-1.5" />
        <button type="submit" disabled={pending} className="btn-outline px-3 py-1.5">{pending ? "Saving…" : "Save"}</button>
        {state.error && <span className="text-red-700" role="alert">{state.error}</span>}
        {state.ok && <span className="text-emerald-700" role="status">Password changed. Tell the customer.</span>}
      </form>
    </details>
  );
}
