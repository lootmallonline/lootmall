"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const out = product.stock <= 0;
  const max = Math.max(1, Math.min(20, product.stock));

  function item() {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.sale_price ?? product.regular_price,
      image: product.images?.[0] ?? null,
      stock: product.stock,
    };
  }

  if (out) {
    return <p className="rounded-xl bg-gray-100 p-3 text-center text-sm font-medium text-gray-600">This product is sold out.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex items-center rounded-full border border-gray-300">
          <button type="button" aria-label="Less" className="p-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button type="button" aria-label="More" className="p-2" onClick={() => setQty((q) => Math.min(max, q + 1))}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs text-gray-500">{product.stock} in stock</span>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-outline flex-1"
          onClick={() => {
            add(item(), qty);
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
        >
          {added ? "Added ✓" : "Add to cart"}
        </button>
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={() => {
            add(item(), qty);
            router.push("/checkout");
          }}
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
