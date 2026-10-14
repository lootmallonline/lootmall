import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { PAGE_SIZE, getCategories, getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { EmptyState } from "@/components/shop/EmptyState";
import { Pagination } from "@/components/shop/Pagination";

export const metadata: Metadata = { title: "All products", alternates: { canonical: "/products" } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = first(sp.q)?.slice(0, 60) ?? "";
  const categorySlug = first(sp.category);
  const page = Math.max(1, parseInt(first(sp.page) ?? "1", 10) || 1);

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  const { products, total } = await getProducts({ q, categoryId: category?.id, page });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-maroon-700">{q ? `Results for “${q}”` : "All products"}</h1>

      <form action="/products" role="search" className="mt-5 flex max-w-xl overflow-hidden rounded-full border border-maroon-100 focus-within:border-maroon-500">
        <label htmlFor="products-q" className="sr-only">Search products</label>
        <input id="products-q" name="q" defaultValue={q} placeholder="Search by product name or SKU" className="w-full px-4 py-2.5 text-sm outline-none" />
        {category && <input type="hidden" name="category" value={category.slug} />}
        <button type="submit" className="bg-maroon-600 px-5 text-white hover:bg-maroon-700" aria-label="Search"><Search size={18} /></button>
      </form>

      {categories.length > 0 && (
        <nav aria-label="Categories" className="mt-5 flex flex-wrap gap-2">
          <Link href={q ? `/products?q=${encodeURIComponent(q)}` : "/products"} className={`rounded-full border px-4 py-1.5 text-sm ${!category ? "border-maroon-600 bg-maroon-600 text-white" : "border-maroon-100 hover:bg-maroon-50"}`}>All</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/category/${c.slug}`} className="rounded-full border border-maroon-100 px-4 py-1.5 text-sm hover:bg-maroon-50">{c.name}</Link>
          ))}
        </nav>
      )}

      <div className="mt-8">
        {products.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-ink/60">{total} product{total === 1 ? "" : "s"}</p>
            <ProductGrid products={products} />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath="/products" params={{ q: q || undefined, category: category?.slug }} />
          </>
        ) : (
          <EmptyState
            title={q ? "No products found" : "No products yet"}
            message={q ? "Try a different word or browse all categories." : "Products will appear here once they are added to the store."}
            actionHref={q ? "/products" : "/"}
            actionLabel={q ? "Clear search" : "Back to home"}
          />
        )}
      </div>
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
