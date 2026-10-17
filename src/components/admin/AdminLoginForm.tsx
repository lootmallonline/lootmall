"use client";

import { adminLoginAction } from "@/app/admin/actions";
import { useActionForm } from "@/components/useActionForm";
import { FormMessage } from "./ui";

export function AdminLoginForm() {
  const { state, pending, onSubmit } = useActionForm(adminLoginAction);
  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
