"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import type { Product } from "@/lib/types";
import { toCartItem } from "./AddToCartButton";

export function AddToCartPanel({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const max = Math.min(product.stock, 20);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock < 1) {
    return <p className="rounded-xl bg-maroon-50 p-4 text-sm font-semibold text-maroon-700">This product is out of stock.</p>;
  }

  const clamp = (n: number) => Math.max(1, Math.min(max, Number.isFinite(n) ? n : 1));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium" id="qty-label">Quantity</span>
        <div className="flex items-center overflow-hidden rounded-full border border-maroon-100" role="group" aria-labelledby="qty-label">
          <button type="button" onClick={() => setQty(clamp(qty - 1))} disabled={qty <= 1} aria-label="Decrease quantity" className="p-2.5 hover:bg-maroon-50 disabled:opacity-40">
            <Minus size={16} />
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={max}
            value={qty}
            onChange={(e) => setQty(clamp(parseInt(e.target.value, 10)))}
            aria-label="Quantity"
            className="w-12 border-x border-maroon-100 py-2 text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button type="button" onClick={() => setQty(clamp(qty + 1))} disabled={qty >= max} aria-label="Increase quantity" className="p-2.5 hover:bg-maroon-50 disabled:opacity-40">
            <Plus size={16} />
          </button>
        </div>
        {product.stock <= 5 && <span className="text-xs font-medium text-maroon-600">Only {product.stock} left</span>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="btn-outline flex-1 py-3"
          onClick={() => {
            addItem(toCartItem(product), qty);
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1800);
          }}
        >
          {added ? <Check size={18} aria-hidden /> : <ShoppingBag size={18} aria-hidden />}
          <span aria-live="polite">{added ? "Added to cart" : "Add to Cart"}</span>
        </button>
        <button
          type="button"
          className="btn-primary flex-1 py-3"
          onClick={() => {
            addItem(toCartItem(product), qty);
            router.push("/checkout");
          }}
        >
          <Zap size={18} aria-hidden /> Buy Now
        </button>
      </div>
    </div>
  );
}
