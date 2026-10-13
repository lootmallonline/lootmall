"use client";

import { startTransition, useActionState } from "react";

/**
 * Wraps a server action for admin forms. Submitting through onSubmit (instead of the
 * form "action" attribute) stops React from clearing the fields when an error comes back,
 * so nothing the administrator typed is lost.
 */
export function useAdminForm<S>(action: (prev: S, formData: FormData) => Promise<S>, initial: S) {
  const [state, dispatch, pending] = useActionState(action, initial);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      dispatch(formData);
    });
  };
  return { state, pending, onSubmit };
}
