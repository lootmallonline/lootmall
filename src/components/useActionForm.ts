"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { FormState } from "@/lib/admin-types";

/**
 * Runs a server action from a normal <form onSubmit>. Unlike useActionState it does not
 * reset the form after saving, so the person keeps what they typed.
 */
export function useActionForm(action: (formData: FormData) => Promise<FormState | void>, initial: FormState = {}) {
  const [state, setState] = useState<FormState>(initial);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      try {
        const result = await action(data);
        setState(result ?? { success: "Saved." });
      } catch {
        setState({ error: "Something went wrong. Please try again." });
      }
    });
  }

  return { state, pending, onSubmit };
}
