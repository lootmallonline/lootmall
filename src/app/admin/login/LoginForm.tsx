"use client";

import { loginAction } from "@/app/admin/actions";
import { useAdminForm } from "@/components/admin/useAdminForm";

export function LoginForm() {
  const { state, pending, onSubmit } = useAdminForm(loginAction, {});
  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="username" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
