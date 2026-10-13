import { redirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// The header search box points here; we forward to the products page with the search word.
export default async function SearchRedirect({ searchParams }: Props) {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  redirect(q ? `/products?q=${encodeURIComponent(q.slice(0, 60))}` : "/products");
}
