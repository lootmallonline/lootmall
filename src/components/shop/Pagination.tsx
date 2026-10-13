import Link from "next/link";

export function Pagination({
  page,
  total,
  pageSize,
  basePath,
  params,
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && sp.set(k, v));
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3 text-sm">
      {page > 1 && <Link href={href(page - 1)} className="btn-outline">Previous</Link>}
      <span>Page {page} of {pages}</span>
      {page < pages && <Link href={href(page + 1)} className="btn-outline">Next</Link>}
    </nav>
  );
}
