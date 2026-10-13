"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/lib/types";
import { effectivePrice } from "@/lib/format";

export function toCartItem(p: Product) {
  return {
    productId: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0] ?? null,
    unitPrice: effectivePrice(p),
    stock: p.stock,
  };
}

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const soldOut = product.stock < 1;

  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => {
        addItem(toCartItem(product), 1);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1800);
      }}
      className="btn-primary w-full"
    >
      {added ? <Check size={16} aria-hidden /> : <ShoppingBag size={16} aria-hidden />}
      <span aria-live="polite">{soldOut ? "Out of stock" : added ? "Added" : "Add to Cart"}</span>
    </button>
  );
}
