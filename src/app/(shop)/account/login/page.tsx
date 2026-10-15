import type { Metadata } from "next";
import { CustomerLoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-1 text-center font-display text-3xl font-bold text-maroon-700">Log in</h1>
      <p className="mb-6 text-center text-sm text-ink/70">See your orders and their status. You can also order without an account.</p>
      <CustomerLoginForm />
    </div>
  );
}
