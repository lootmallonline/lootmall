"use client";

import Link from "next/link";
import { loginAction, signupAction } from "@/app/(shop)/account/actions";
import { useActionForm } from "@/components/useActionForm";

function Message({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>;
}

export function LoginForm() {
  const { state, pending, onSubmit } = useActionForm(loginAction);
  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <div>
        <label className="label" htmlFor="identifier">Mobile number or email</label>
        <input id="identifier" name="identifier" required className="input" autoComplete="username" placeholder="03001234567" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required className="input" autoComplete="current-password" />
      </div>
      <Message error={state.error} />
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Logging in..." : "Log in"}
      </button>
      <p className="text-center text-sm text-gray-600">
        New here?{" "}
        <Link href="/account/signup" className="font-semibold text-maroon-600">
          Create an account
        </Link>
      </p>
      <p className="text-center text-xs text-gray-500">Forgot your password? Contact us and we will set a new one for you.</p>
    </form>
  );
}

export function SignupForm() {
  const { state, pending, onSubmit } = useActionForm(signupAction);
  return (
    <form onSubmit={onSubmit} className="card space-y-3 p-5">
      <div>
        <label className="label" htmlFor="full_name">Full name</label>
        <input id="full_name" name="full_name" required minLength={2} className="input" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Mobile number</label>
        <input id="phone" name="phone" required inputMode="tel" className="input" autoComplete="tel" placeholder="03001234567" />
      </div>
      <div>
        <label className="label" htmlFor="contact_email">Email (optional)</label>
        <input id="contact_email" name="contact_email" type="email" className="input" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password (6+ characters)</label>
        <input id="password" name="password" type="password" required minLength={6} className="input" autoComplete="new-password" />
      </div>
      <div>
        <label className="label" htmlFor="confirm">Confirm password</label>
        <input id="confirm" name="confirm" type="password" required minLength={6} className="input" autoComplete="new-password" />
      </div>
      <Message error={state.error} />
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Creating account..." : "Create account"}
      </button>
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/account/login" className="font-semibold text-maroon-600">
          Log in
        </Link>
      </p>
    </form>
  );
}
