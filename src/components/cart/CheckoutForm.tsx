"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "./CartProvider";
import { useQuote } from "./useQuote";
import { OrderSummary } from "./OrderSummary";
import { EmptyState } from "@/components/shop/EmptyState";
import { PaymentDetails } from "@/components/shop/PaymentDetails";
import { formatPKR, whatsappUrl } from "@/lib/format";
import { PK_CITIES } from "@/lib/cities";
import { isCodCity } from "@/lib/payment";
import type { Settings } from "@/lib/types";

type FieldErrors = Partial<Record<"customer_name" | "phone" | "address" | "city" | "notes" | "payment_reference", string[]>>;

export function CheckoutForm({
  settings,
  defaults,
}: {
  settings: Settings;
  defaults: { name: string; phone: string } | null;
}) {
  const router = useRouter();
  const { items, hydrated, clear } = useCart();
  const quote = useQuote();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [city, setCity] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const cityEntered = city.trim().length >= 2;
  const isCod = isCodCity(city, settings.cod_cities);

  if (!hydrated || done) {
    return (
      <div className="py-16 text-center" role="status">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-maroon-100 border-t-maroon-600" />
        <p className="mt-4 text-sm text-maroon-700">{done ? "Order placed. Opening your confirmation…" : "Loading…"}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        message="Add a product to your cart before checking out."
        actionHref="/products"
        actionLabel="Browse products"
      />
    );
  }

  const fe = (name: keyof FieldErrors) =>
    fieldErrors[name]?.[0] ? (
      <p className="mt-1 text-xs text-red-700" role="alert">{fieldErrors[name]?.[0]}</p>
    ) : null;

  // If the website cannot save the order (server problem), the customer can send it on WhatsApp instead.
  function whatsappOrderUrl(v: { name: string; phone: string; city: string; address: string; notes: string; reference: string }) {
    const lines = quote.lines.map((l) => `- ${l.name} x ${l.quantity} = ${formatPKR(l.unitPrice * l.quantity)}`);
    const text = [
      "Hello LootMall, the website could not save my order, so I am sending it here.",
      `Name: ${v.name}`,
      `Phone: ${v.phone}`,
      `City: ${v.city}`,
      `Address: ${v.address}`,
      ...(v.notes ? [`Notes: ${v.notes}`] : []),
      "Items:",
      ...lines,
      `Delivery: ${formatPKR(quote.delivery)}`,
      `Total: ${formatPKR(quote.total)}`,
      ...(v.reference ? [`Payment transaction ID: ${v.reference}`] : []),
    ].join("\n");
    return whatsappUrl(settings.contact_phone, text);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setFallbackUrl("");
    setFieldErrors({});
    const form = new FormData(e.currentTarget);
    const values = {
      name: String(form.get("customer_name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      city: String(form.get("city") ?? ""),
      address: String(form.get("address") ?? ""),
      notes: String(form.get("notes") ?? ""),
      reference: isCod ? "" : String(form.get("payment_reference") ?? ""),
    };
    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.get("customer_name"),
          phone: form.get("phone"),
          address: form.get("address"),
          city: form.get("city"),
          notes: form.get("notes") ?? "",
          payment_reference: isCod ? "" : form.get("payment_reference") ?? "",
          website: form.get("website") ?? "",
          // Only IDs and quantities are sent. The server decides every price.
          items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fieldErrors?: FieldErrors;
        order_number?: string;
      };
      if (!res.ok || !data.order_number) {
        setError(data.error ?? "We could not place your order. Please try again.");
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        if (res.status >= 500) setFallbackUrl(whatsappOrderUrl(values));
        setSubmitting(false);
        return;
      }
      setDone(true);
      router.replace(`/order/${data.order_number}`);
      clear();
    } catch {
      setError("Network problem. Please check your internet and try again.");
      setFallbackUrl(whatsappOrderUrl(values));
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_24rem]">
      <form onSubmit={onSubmit} className="card space-y-4" noValidate>
        <h2 className="font-display text-xl font-bold text-maroon-700">Delivery details</h2>

        <div>
          <label htmlFor="customer_name" className="label">Full name</label>
          <input id="customer_name" name="customer_name" required autoComplete="name" defaultValue={defaults?.name ?? ""} className="input" />
          {fe("customer_name")}
        </div>
        <div>
          <label htmlFor="phone" className="label">Phone number</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="03XXXXXXXXX" defaultValue={defaults?.phone ?? ""} className="input" />
          {fe("phone")}
        </div>
        <div>
          <label htmlFor="address" className="label">Complete address</label>
          <textarea id="address" name="address" required rows={3} autoComplete="street-address" placeholder="House, street, area" className="input" />
          {fe("address")}
        </div>
        <div>
          <label htmlFor="city" className="label">City</label>
          <input id="city" name="city" required autoComplete="off" list="pk-cities" placeholder="Start typing your city" value={city} onChange={(e) => setCity(e.target.value)} className="input" />
          <datalist id="pk-cities">
            {PK_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {fe("city")}
        </div>
        {cityEntered && (
          <section aria-live="polite" className="space-y-3 rounded-2xl border border-maroon-100 bg-maroon-50/50 p-4">
            {isCod ? (
              <>
                <p className="font-semibold text-emerald-800">Cash on Delivery is available in {city.trim()}.</p>
                <p className="text-sm text-ink/80">
                  Pay {quote.ready ? formatPKR(quote.total) : "the order total"} in cash when your parcel is delivered.
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-maroon-700">Advance payment is required for {city.trim()}.</p>
                <p className="text-sm text-ink/80">
                  Pay {quote.ready ? formatPKR(quote.total) : "the order total"} to any account below, then enter your transaction ID. After placing the order, send your payment screenshot to us on WhatsApp.
                </p>
                <PaymentDetails settings={settings} />
                <div>
                  <label htmlFor="payment_reference" className="label">Transaction ID / payment reference</label>
                  <input id="payment_reference" name="payment_reference" required minLength={4} className="input" />
                  {fe("payment_reference")}
                </div>
              </>
            )}
          </section>
        )}

        <div>
          <label htmlFor="notes" className="label">Order notes (optional)</label>
          <textarea id="notes" name="notes" rows={2} className="input" />
          {fe("notes")}
        </div>

        {/* Hidden spam trap: real people never see or fill this field. */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
        {fallbackUrl && (
          <div className="space-y-2 rounded-xl border border-gold-300 bg-gold-300/10 p-3 text-sm">
            <p>The website could not save your order right now. You can send the same order to us on WhatsApp and we will place it for you.</p>
            <a href={fallbackUrl} target="_blank" rel="noopener noreferrer" className="btn-gold">Send my order on WhatsApp</a>
          </div>
        )}
        {quote.error && (
          <p className="text-sm text-red-700" role="alert">
            We could not check current prices.{" "}
            <button type="button" onClick={quote.retry} className="font-semibold underline">Try again</button>
          </p>
        )}
        {quote.blocked && (
          <p className="text-sm text-red-700" role="alert">
            Some items in your cart are unavailable or low in stock. <Link href="/cart" className="font-semibold underline">Update your cart</Link>.
          </p>
        )}

        <button type="submit" disabled={submitting || !quote.ready || quote.blocked} className="btn-primary w-full py-3">
          {submitting ? "Placing order…" : quote.ready ? `Place order · ${formatPKR(quote.total)}` : "Place order"}
        </button>
        <p className="text-xs text-ink/60">We will contact you on your phone number to confirm your order and delivery.</p>
      </form>

      <aside className="card h-fit space-y-4 lg:sticky lg:top-32">
        <h2 className="font-display text-xl font-bold text-maroon-700">Your order</h2>
        <ul className="divide-y divide-maroon-100 text-sm">
          {quote.lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-3 py-2">
              <span className="min-w-0">{l.name} <span className="text-ink/60">× {l.quantity}</span></span>
              <span className="shrink-0 font-medium">{formatPKR(l.unitPrice * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <OrderSummary subtotal={quote.subtotal} delivery={quote.delivery} total={quote.total} ready={quote.ready} />
        <Link href="/cart" className="block text-center text-sm font-medium text-maroon-700 hover:underline">Edit cart</Link>
      </aside>
    </div>
  );
}
