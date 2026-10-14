"use client";

import Link from "next/link";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { loginAction } from "../actions";

export function CustomerLoginForm() {
  const { state, pending, onSubmit } = useAdminForm(loginAction, {});
  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label htmlFor="identifier" className="label">Mobile number or email</label>
        <input id="identifier" name="identifier" required autoComplete="username" placeholder="03XXXXXXXXX" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
      </div>
      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">{pending ? "Signing in…" : "Log in"}</button>
      <p className="text-center text-sm">
        New here? <Link href="/account/signup" className="font-semibold text-maroon-700 hover:underline">Create an account</Link>
      </p>
      <p className="text-center text-xs text-ink/60">Forgot your password? Message us on WhatsApp and we will reset it.</p>
    </form>
  );
}
