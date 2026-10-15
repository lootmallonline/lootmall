import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Shopping cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-maroon-700">Shopping cart</h1>
      <CartView />
    </div>
  );
}
