"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/format";

export function CartView({ deliveryCharge }: { deliveryCharge: number }) {
  const { items, ready, subtotal, setQuantity, remove } = useCart();

  if (!ready) return <p className="py-10 text-center text-gray-500">Loading your cart...</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-card bg-maroon-50 p-10 text-center">
        <p className="text-lg font-semibold text-maroon-700">Your cart is empty</p>
        <Link href="/products" className="btn-primary mt-4">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-3 md:col-span-2">
        {items.map((i) => (
          <div key={i.id} className="card flex gap-3 p-3">
            <Link href={`/product/${i.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-maroon-50">
              {i.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col justify-between">
              <div>
                <Link href={`/product/${i.slug}`} className="line-clamp-2 text-sm font-medium">
                  {i.name}
                </Link>
                <p className="text-sm font-bold text-maroon-600">{formatPrice(i.price)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-full border border-gray-300">
                  <button type="button" aria-label="Less" className="p-1.5" onClick={() => setQuantity(i.id, i.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center text-sm">{i.quantity}</span>
                  <button type="button" aria-label="More" className="p-1.5" onClick={() => setQuantity(i.id, i.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button type="button" aria-label="Remove" onClick={() => remove(i.id)} className="p-1.5 text-gray-500 hover:text-red-600">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <aside className="card h-fit space-y-2 p-4 text-sm">
        <h2 className="mb-2 font-display text-xl font-bold text-maroon-700">Order summary</h2>
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{formatPrice(deliveryCharge)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-bold">
          <span>Total</span>
          <span className="text-maroon-600">{formatPrice(subtotal + deliveryCharge)}</span>
        </div>
        <Link href="/checkout" className="btn-primary mt-3 w-full">
          Proceed to checkout
        </Link>
      </aside>
    </div>
  );
}
