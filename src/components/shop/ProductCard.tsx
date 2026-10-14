import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { discountPercent } from "@/lib/format";
import { PriceTag } from "./PriceTag";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountPercent(product);
  const soldOut = product.stock < 1;
  const image = product.images[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-maroon-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="relative block aspect-square overflow-hidden bg-maroon-50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-maroon-500/40">
            <ShoppingBag size={48} aria-hidden />
          </span>
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-400 px-2.5 py-1 text-xs font-bold text-ink shadow">
            {discount}% OFF
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold text-maroon-700">
            Out of stock
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold">
          <Link href={`/product/${product.slug}`} className="hover:text-maroon-600">
            {product.name}
          </Link>
        </h3>
        <PriceTag regular={product.regular_price} sale={product.sale_price} />
        <div className="mt-auto pt-2">
          <AddToCartButton product={product} />
        </div>
      </div>
    </article>
  );
}
