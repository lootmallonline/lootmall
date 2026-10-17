import type { ReactNode } from "react";
import type { FormState } from "@/lib/admin-types";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.error) return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>;
  if (state.success) return <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">{state.success}</p>;
  return null;
}

export function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? "Saving..." : children}
    </button>
  );
}
