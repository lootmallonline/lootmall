import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { Gallery } from "@/components/shop/Gallery";
import { AddToCart } from "@/components/shop/AddToCart";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  return { title: p.name, description: p.short_description ?? undefined };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const onSale = product.sale_price != null;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Gallery images={product.images ?? []} name={product.name} video={product.video_url} />
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold">{product.name}</h1>
        <p className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-maroon-600">{formatPrice(product.sale_price ?? product.regular_price)}</span>
          {onSale && <span className="text-gray-400 line-through">{formatPrice(product.regular_price)}</span>}
        </p>
        {product.short_description && <p className="text-gray-700">{product.short_description}</p>}
        <AddToCart product={product} />
        <div className="rounded-xl bg-maroon-50 p-3 text-sm text-gray-700">
          Cash on Delivery in Rawalpindi and Islamabad. Advance payment for other cities.
        </div>
        {product.description && (
          <div>
            <h2 className="mb-1 font-semibold">Description</h2>
            <p className="whitespace-pre-line text-sm text-gray-700">{product.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
