import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PAGE_SIZE, getCategories, getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { EmptyState } from "@/components/shop/EmptyState";
import { Pagination } from "@/components/shop/Pagination";


type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) return { title: "Category not found" };
  return { title: category.name, alternates: { canonical: `/category/${category.slug}` } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Math.max(1, parseInt((Array.isArray(sp.page) ? sp.page[0] : sp.page) ?? "1", 10) || 1);

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const { products, total } = await getProducts({ categoryId: category.id, page });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="text-sm text-ink/60">
        <Link href="/" className="hover:underline">Home</Link> / <Link href="/products" className="hover:underline">Products</Link> / <span>{category.name}</span>
      </nav>
      <h1 className="mt-2 font-display text-3xl font-bold text-maroon-700">{category.name}</h1>
      <div className="mt-6">
        {products.length > 0 ? (
          <>
            <ProductGrid products={products} />
            <Pagination page={page} total={total} pageSize={PAGE_SIZE} basePath={`/category/${category.slug}`} params={{}} />
          </>
        ) : (
          <EmptyState title="No products in this category yet" message="Check back soon or browse all products." actionHref="/products" actionLabel="Browse all products" />
        )}
      </div>
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
