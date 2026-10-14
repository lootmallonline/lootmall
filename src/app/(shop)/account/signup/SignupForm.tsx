"use client";

import Link from "next/link";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { signupAction } from "../actions";

export function SignupForm() {
  const { state, pending, onSubmit } = useAdminForm(signupAction, {});
  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <div>
        <label htmlFor="full_name" className="label">Full name</label>
        <input id="full_name" name="full_name" required autoComplete="name" className="input" />
      </div>
      <div>
        <label htmlFor="phone" className="label">Mobile number</label>
        <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="03XXXXXXXXX" className="input" />
      </div>
      <div>
        <label htmlFor="email" className="label">Email (optional)</label>
        <input id="email" name="email" type="email" autoComplete="email" className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password (at least 8 characters)</label>
        <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">{pending ? "Creating account…" : "Create account"}</button>
      <p className="text-center text-sm">
        Already registered? <Link href="/account/login" className="font-semibold text-maroon-700 hover:underline">Log in</Link>
      </p>
    </form>
  );
}
