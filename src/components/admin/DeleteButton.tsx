"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { FormState } from "@/lib/admin-types";

export function DeleteButton({
  action,
  confirmText = "Delete this? This cannot be undone.",
  label = "Delete",
}: {
  action: () => Promise<FormState>;
  confirmText?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        disabled={pending}
        className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        onClick={() => {
          if (!window.confirm(confirmText)) return;
          setError("");
          startTransition(async () => {
            try {
              const r = await action();
              if (r?.error) setError(r.error);
            } catch {
              setError("Something went wrong.");
            }
          });
        }}
      >
        <Trash2 className="h-4 w-4" /> {pending ? "Deleting..." : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  );
}
