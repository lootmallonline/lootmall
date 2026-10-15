import type { Metadata } from "next";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="mb-1 text-center font-display text-3xl font-bold text-maroon-700">Create account</h1>
      <p className="mb-6 text-center text-sm text-ink/70">Log in with your mobile number to track every order.</p>
      <SignupForm />
    </div>
  );
}
