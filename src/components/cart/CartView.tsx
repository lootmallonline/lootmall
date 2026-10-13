"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "./CartProvider";
import { useQuote } from "./useQuote";
import { OrderSummary } from "./OrderSummary";
import { EmptyState } from "@/components/shop/EmptyState";
import { formatPKR } from "@/lib/format";

export function CartView() {
  const { items, hydrated, setQuantity, removeItem } = useCart();
  const quote = useQuote();

  if (!hydrated) {
    return <div className="h-48 animate-pulse rounded-card bg-maroon-50" role="status" aria-label="Loading cart" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Browse our products and add something you like."
        actionHref="/products"
        actionLabel="Start shopping"
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <ul className="space-y-4">
        {quote.lines.map((l) => (
          <li key={l.productId} className="card flex gap-4">
            <Link href={`/product/${l.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-maroon-50">
              {l.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.image} alt={l.name} className="h-full w-full object-cover" />
              ) : (
                <span className="grid h-full w-full place-items-center text-maroon-500/40"><ShoppingBag /></span>
              )}
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Link href={`/product/${l.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-maroon-600">{l.name}</Link>
              <p className="text-sm text-maroon-700">{formatPKR(l.unitPrice)}</p>
              {!l.available && <p className="text-xs font-medium text-red-700" role="alert">This product is no longer available. Please remove it.</p>}
              {l.available && l.overStock && <p className="text-xs font-medium text-red-700" role="alert">Only {l.maxStock} left. Please reduce the quantity.</p>}
              <div className="mt-auto flex items-center justify-between gap-2">
                <div className="flex items-center overflow-hidden rounded-full border border-maroon-100">
                  <button type="button" aria-label={`Decrease quantity of ${l.name}`} onClick={() => setQuantity(l.productId, l.quantity - 1)} disabled={l.quantity <= 1} className="p-2 hover:bg-maroon-50 disabled:opacity-40"><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm" aria-live="polite">{l.quantity}</span>
                  <button type="button" aria-label={`Increase quantity of ${l.name}`} onClick={() => setQuantity(l.productId, Math.min(l.quantity + 1, l.maxStock))} disabled={l.quantity >= l.maxStock} className="p-2 hover:bg-maroon-50 disabled:opacity-40"><Plus size={14} /></button>
                </div>
                <p className="text-sm font-bold">{formatPKR(l.unitPrice * l.quantity)}</p>
                <button type="button" onClick={() => removeItem(l.productId)} aria-label={`Remove ${l.name}`} className="rounded-full p-2 text-red-700 hover:bg-red-50"><Trash2 size={18} /></button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="card h-fit space-y-4 lg:sticky lg:top-32">
        <h2 className="font-display text-xl font-bold text-maroon-700">Order summary</h2>
        <OrderSummary subtotal={quote.subtotal} delivery={quote.delivery} total={quote.total} ready={quote.ready} />
        {quote.error && (
          <p className="text-sm text-red-700" role="alert">
            We could not check current prices.{" "}
            <button type="button" onClick={quote.retry} className="font-semibold underline">Try again</button>
          </p>
        )}
        {quote.blocked || !quote.ready ? (
          <button type="button" disabled className="btn-primary w-full py-3">Proceed to checkout</button>
        ) : (
          <Link href="/checkout" className="btn-primary w-full py-3">Proceed to checkout</Link>
        )}
        <Link href="/products" className="block text-center text-sm font-medium text-maroon-700 hover:underline">Continue shopping</Link>
      </aside>
    </div>
  );
}
