"use client";

import Link from "next/link";
import { Printer } from "lucide-react";

export function PrintControls({
  backHref,
  sizes,
  current,
}: {
  backHref: string;
  sizes?: { key: string; label: string; href: string }[];
  current?: string;
}) {
  return (
    <div className="no-print mb-4 flex flex-wrap items-center gap-3">
      <Link href={backHref} className="btn-outline">
        ← Back to order
      </Link>
      {sizes?.map((s) => (
        <Link
          key={s.key}
          href={s.href}
          className={current === s.key ? "btn-primary" : "btn-outline"}
        >
          {s.label}
        </Link>
      ))}
      <button type="button" className="btn-gold" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print
      </button>
    </div>
  );
}
