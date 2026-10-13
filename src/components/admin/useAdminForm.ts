"use client";

import { startTransition, useActionState } from "react";
import type { FormState } from "@/lib/admin-types";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Wraps a server action for admin forms. Submitting through onSubmit (instead of the
 * form "action" attribute) stops React from clearing the fields when an error comes back,
 * so nothing the administrator typed is lost.
 */
export function useAdminForm(action: Action, initial: FormState = {}) {
  const [state, dispatch, pending] = useActionState<FormState, FormData>(action, initial);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      dispatch(formData);
    });
  };
  return { state, pending, onSubmit };
}
