"use client";

export function DeleteButton({
  action,
  confirmText,
  label = "Delete",
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmText: string;
  label?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className="btn-danger px-3 py-1.5">{label}</button>
    </form>
  );
}
