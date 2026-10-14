"use client";

import Link from "next/link";

export function PrintBar({
  backHref,
  sizes,
  currentSize,
  basePath,
  warning,
}: {
  backHref: string;
  sizes?: { key: string; label: string }[];
  currentSize?: string;
  basePath?: string;
  warning?: string;
}) {
  return (
    <div className="no-print mx-auto mb-4 flex max-w-3xl flex-wrap items-center gap-3 rounded-xl bg-white p-3 text-sm shadow">
      <Link href={backHref} className="btn-outline px-4 py-1.5">← Back to order</Link>
      {sizes && basePath && (
        <div className="flex items-center gap-2" role="group" aria-label="Label size">
          {sizes.map((s) => (
            <Link
              key={s.key}
              href={`${basePath}?size=${s.key}`}
              className={`rounded-full px-3 py-1.5 ${currentSize === s.key ? "bg-maroon-600 text-white" : "border border-maroon-100 hover:bg-maroon-50"}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}
      <button type="button" onClick={() => window.print()} className="btn-primary ml-auto px-5 py-1.5">Print</button>
      {warning && <p className="w-full rounded-lg bg-amber-50 p-2 text-amber-900" role="alert">{warning}</p>}
    </div>
  );
}
