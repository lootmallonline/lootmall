import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const onSale = product.sale_price != null;
  const out = product.stock <= 0;
  return (
    <Link href={`/product/${product.slug}`} className="card group block overflow-hidden transition hover:shadow-md">
      <div className="relative aspect-square bg-maroon-50">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">No image</div>
        )}
        {onSale && !out && (
          <span className="absolute left-2 top-2 rounded-full bg-maroon-600 px-2 py-0.5 text-xs font-semibold text-white">Sale</span>
        )}
        {out && (
          <span className="absolute left-2 top-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs font-semibold text-white">Sold out</span>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-medium">{product.name}</h3>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="font-bold text-maroon-600">{formatPrice(product.sale_price ?? product.regular_price)}</span>
          {onSale && <span className="text-xs text-gray-400 line-through">{formatPrice(product.regular_price)}</span>}
        </p>
      </div>
    </Link>
  );
}
