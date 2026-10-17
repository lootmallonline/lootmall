import { getCategories, getProducts } from "@/lib/data";
import { ProductCard } from "@/components/shop/ProductCard";
import Link from "next/link";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const [products, categories] = await Promise.all([getProducts({ q: q?.slice(0, 60) }), getCategories()]);
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl font-bold text-maroon-700">{q ? `Results for "${q}"` : "All products"}</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/products" className="rounded-full border border-maroon-600 bg-maroon-600 px-3 py-1 text-sm text-white">All</Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/category/${c.slug}`} className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-maroon-50">
            {c.name}
          </Link>
        ))}
      </div>
      {products.length === 0 ? (
        <p className="rounded-card bg-maroon-50 p-8 text-center text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
