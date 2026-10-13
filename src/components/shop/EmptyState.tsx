import Link from "next/link";

export function EmptyState({
  title,
  message,
  actionHref,
  actionLabel,
}: {
  title: string;
  message: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-card border border-dashed border-maroon-100 bg-maroon-50/50 px-6 py-14 text-center">
      <h2 className="font-display text-xl font-bold text-maroon-700">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink/70">{message}</p>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-5">{actionLabel}</Link>
      )}
    </div>
  );
}
