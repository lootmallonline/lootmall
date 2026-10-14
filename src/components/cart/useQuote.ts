"use client";

import { useEffect, useState } from "react";
import { useCart, type CartItem } from "./CartProvider";

export type Quote = {
  product_id: string;
  name: string;
  slug: string;
  image: string | null;
  unit_price: number;
  stock: number;
};

export type CartLine = CartItem & {
  available: boolean;
  maxStock: number;
  overStock: boolean;
};

/**
 * Asks the server for the CURRENT price and stock of every cart item, so the cart and
 * checkout always show real numbers. The server recalculates everything again when the
 * order is placed, so this is for display and early warnings only.
 */
export function useQuote() {
  const { items, hydrated } = useCart();
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [delivery, setDelivery] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const key = items.map((i) => i.productId).sort().join(",");

  useEffect(() => {
    if (!hydrated) return;
    if (!key) {
      setQuotes({});
      setLoading(false);
      setError(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch("/api/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_ids: key.split(",") }),
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("quote failed"))))
      .then((data: { items: Quote[]; delivery_charge: number }) => {
        const map: Record<string, Quote> = {};
        data.items.forEach((q) => (map[q.product_id] = q));
        setQuotes(map);
        setDelivery(data.delivery_charge);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(true);
        setLoading(false);
      });
    return () => controller.abort();
  }, [key, hydrated, attempt]);

  const lines: CartLine[] = items.map((i) => {
    const q = quotes[i.productId];
    const maxStock = q ? q.stock : i.stock;
    return {
      ...i,
      name: q?.name ?? i.name,
      image: q ? q.image : i.image,
      unitPrice: q ? q.unit_price : i.unitPrice,
      available: loading || error ? true : !!q && q.stock > 0,
      maxStock,
      overStock: q ? i.quantity > q.stock : false,
    };
  });

  const subtotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  const ready = hydrated && !loading && !error && delivery !== null;
  const blocked = lines.some((l) => !l.available || l.overStock);

  return {
    lines,
    subtotal,
    delivery: delivery ?? 0,
    total: subtotal + (delivery ?? 0),
    ready,
    blocked,
    loading: loading || !hydrated,
    error,
    retry: () => setAttempt((a) => a + 1),
  };
}
