import { useActionState } from "react";

export function useAdminForm<S>(
  action: (prev: Awaited<S>, formData: FormData) => Promise<S> | S,
  initial: S
) {
  const [state, dispatch, pending] = useActionState<S, FormData>(
    async (state: Awaited<S>, payload: FormData) => {
      return await action(state, payload);
    },
    initial
  );

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    dispatch(formData as any);
  };

  return {
    state,
    dispatch,
    pending,
    onSubmit,
  };
}