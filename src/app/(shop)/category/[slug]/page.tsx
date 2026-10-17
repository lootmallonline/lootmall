import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data";
import { ProductCard } from "@/components/shop/ProductCard";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();
  const products = await getProducts({ categorySlug: slug });
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl font-bold text-maroon-700">{category.name}</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/products" className="rounded-full border border-gray-300 px-3 py-1 text-sm hover:bg-maroon-50">All</Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/category/${c.slug}`}
            className={`rounded-full border px-3 py-1 text-sm ${c.slug === slug ? "border-maroon-600 bg-maroon-600 text-white" : "border-gray-300 hover:bg-maroon-50"}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
      {products.length === 0 ? (
        <p className="rounded-card bg-maroon-50 p-8 text-center text-gray-600">No products in this category yet.</p>
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
