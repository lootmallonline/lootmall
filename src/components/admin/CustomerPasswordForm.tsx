"use client";

import { setCustomerPasswordAction } from "@/app/admin/actions";
import { useActionForm } from "@/components/useActionForm";
import { FormMessage } from "./ui";

export function CustomerPasswordForm({ customerId }: { customerId: string }) {
  const { state, pending, onSubmit } = useActionForm(setCustomerPasswordAction.bind(null, customerId));
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input name="password" type="text" required minLength={6} placeholder="New password (6+ characters)" className="input" />
        <button type="submit" disabled={pending} className="btn-primary whitespace-nowrap">
          {pending ? "..." : "Set password"}
        </button>
      </div>
      <FormMessage state={state} />
    </form>
  );
}
