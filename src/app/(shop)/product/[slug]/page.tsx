import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getProductBySlug, getRelatedProducts, getSettings } from "@/lib/data";
import { discountPercent, effectivePrice, whatsappUrl } from "@/lib/format";
import { SITE_URL } from "@/lib/site";
import { safeJsonLd } from "@/lib/utils";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { AddToCartPanel } from "@/components/shop/AddToCartPanel";
import { PriceTag } from "@/components/shop/PriceTag";
import { ProductGrid } from "@/components/shop/ProductGrid";


type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const description = (product.short_description || product.description || `Buy ${product.name} at LootMall.`).slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title: product.name, description, images: product.images[0] ? [product.images[0]] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, categories, related] = await Promise.all([getSettings(), getCategories(), getRelatedProducts(product)]);
  const category = categories.find((c) => c.id === product.category_id);
  const discount = discountPercent(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku ?? undefined,
    image: product.images,
    description: product.short_description ?? product.description ?? undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: "PKR",
      price: effectivePrice(product),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-ink/60">
        <Link href="/" className="hover:underline">Home</Link> /{" "}
        {category ? <><Link href={`/category/${category.slug}`} className="hover:underline">{category.name}</Link> / </> : null}
        <span>{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <ProductGallery name={product.name} images={product.images} videoUrl={product.video_url} />

        <div className="space-y-5">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <PriceTag regular={product.regular_price} sale={product.sale_price} large />
            {discount > 0 && <span className="rounded-full bg-gold-400 px-3 py-1 text-xs font-bold">{discount}% OFF</span>}
          </div>
          {product.short_description && <p className="text-ink/80">{product.short_description}</p>}

          <p className="text-sm">
            {product.stock > 0 ? (
              <span className="font-medium text-emerald-700">In stock</span>
            ) : (
              <span className="font-medium text-red-700">Out of stock</span>
            )}
            {product.sku && <span className="ml-3 text-ink/60">SKU: {product.sku}</span>}
          </p>

          <AddToCartPanel product={product} />

          <a
            href={whatsappUrl(settings.contact_phone, `Hello LootMall, I have a question about: ${product.name}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-semibold text-maroon-700 hover:underline"
          >
            Ask about this product on WhatsApp
          </a>

          {product.description && (
            <section aria-labelledby="desc-heading" className="border-t border-maroon-100 pt-5">
              <h2 id="desc-heading" className="mb-2 font-display text-lg font-bold text-maroon-700">Product details</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">{product.description}</p>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-14">
          <h2 id="related-heading" className="mb-4 font-display text-2xl font-bold text-maroon-700">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
