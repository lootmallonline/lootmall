"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice, isCodCity } from "@/lib/format";
import type { Settings } from "@/lib/types";

const CITY_SUGGESTIONS = [
  "Rawalpindi", "Islamabad", "Lahore", "Karachi", "Faisalabad", "Multan", "Peshawar", "Quetta",
  "Sialkot", "Gujranwala", "Hyderabad", "Sargodha", "Bahawalpur", "Abbottabad",
];

interface Account {
  title: string;
  lines: string[];
  qr: string;
}

function paymentAccounts(s: Settings): Account[] {
  const list: Account[] = [];
  if (s.bank_name || s.bank_account_number) {
    list.push({
      title: `Bank: ${s.bank_name}`,
      lines: [s.bank_account_title && `Title: ${s.bank_account_title}`, s.bank_account_number && `Account: ${s.bank_account_number}`].filter(Boolean) as string[],
      qr: s.bank_qr_url,
    });
  }
  if (s.easypaisa_number) {
    list.push({
      title: "EasyPaisa",
      lines: [s.easypaisa_title && `Title: ${s.easypaisa_title}`, `Number: ${s.easypaisa_number}`].filter(Boolean) as string[],
      qr: s.easypaisa_qr_url,
    });
  }
  if (s.jazzcash_number) {
    list.push({
      title: "JazzCash",
      lines: [s.jazzcash_title && `Title: ${s.jazzcash_title}`, `Number: ${s.jazzcash_number}`].filter(Boolean) as string[],
      qr: s.jazzcash_qr_url,
    });
  }
  return list;
}

export function CheckoutForm({
  settings,
  defaults,
}: {
  settings: Settings;
  defaults: { name: string; phone: string; loggedIn: boolean };
}) {
  const { items, ready, subtotal, clear } = useCart();
  const router = useRouter();
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const cod = isCodCity(city, settings.cod_cities);
  const cityEntered = city.trim().length > 1;
  const delivery = settings.delivery_charge;
  const total = subtotal + delivery;
  const accounts = paymentAccounts(settings);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      customer_name: String(fd.get("customer_name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      city: String(fd.get("city") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      payment_reference: String(fd.get("payment_reference") ?? ""),
      website: String(fd.get("fax_number_2") ?? ""),
      items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    };
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: { ok?: boolean; error?: string; code?: string; order_number?: string; total?: number; payment_method?: string } | null = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      if (!res.ok || !data?.ok) {
        setError(
          data?.error
            ? `${data.error}${data.code ? ` (Code: ${data.code})` : ""}`
            : "Order service is temporarily unavailable. Please try again in a minute or contact us.",
        );
        setBusy(false);
        return;
      }
      clear();
      const q = new URLSearchParams({
        n: data.order_number ?? "",
        t: String(data.total ?? total),
        m: data.payment_method ?? (cod ? "cod" : "advance"),
      });
      router.push(`/order/success?${q.toString()}`);
    } catch {
      setError("Could not reach the server. Check your internet and try again.");
      setBusy(false);
    }
  }

  if (!ready) return <p className="py-10 text-center text-gray-500">Loading...</p>;

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
    <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-5">
      <div className="space-y-4 md:col-span-3">
        {!defaults.loggedIn && (
          <p className="rounded-xl bg-maroon-50 p-3 text-sm text-gray-700">
            Have an account?{" "}
            <Link href="/account/login" className="font-semibold text-maroon-600">
              Log in
            </Link>{" "}
            to see your order history. You can also order without an account.
          </p>
        )}

        <div>
          <label className="label" htmlFor="customer_name">Full name</label>
          <input id="customer_name" name="customer_name" required minLength={2} maxLength={100} defaultValue={defaults.name} className="input" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Mobile number</label>
          <input id="phone" name="phone" required inputMode="tel" placeholder="03001234567" defaultValue={defaults.phone} className="input" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input
            id="city"
            name="city"
            required
            list="city-list"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="input"
            autoComplete="address-level2"
          />
          <datalist id="city-list">
            {CITY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="address">Full address</label>
          <textarea id="address" name="address" required minLength={5} maxLength={300} rows={3} className="input" autoComplete="street-address" />
        </div>
        <div>
          <label className="label" htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" maxLength={500} rows={2} className="input" />
        </div>

        {cityEntered && cod && (
          <p className="rounded-xl bg-green-50 p-3 text-sm font-medium text-green-800">
            Cash on Delivery is available in your city. Pay when the parcel arrives.
          </p>
        )}

        {cityEntered && !cod && (
          <div className="space-y-3 rounded-xl border border-gold-400 bg-gold-300/20 p-4 text-sm">
            <p className="font-semibold text-maroon-700">Advance payment is required for your city</p>
            <p>Send {formatPrice(total)} to one of these accounts, then enter the transaction ID below.</p>
            {accounts.length === 0 ? (
              <p className="text-gray-600">Payment details are not set yet. Please contact us on {settings.contact_phone}.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {accounts.map((a) => (
                  <div key={a.title} className="rounded-xl bg-white p-3">
                    <p className="font-semibold">{a.title}</p>
                    {a.lines.map((l) => (
                      <p key={l} className="text-gray-700">{l}</p>
                    ))}
                    {a.qr && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.qr} alt={`${a.title} QR`} className="mt-2 h-32 w-32 rounded-lg border object-contain" />
                    )}
                  </div>
                ))}
              </div>
            )}
            <div>
              <label className="label" htmlFor="payment_reference">Transaction ID</label>
              <input id="payment_reference" name="payment_reference" required minLength={4} maxLength={100} className="input" />
            </div>
          </div>
        )}

        {/* Spam trap: people never see or fill this field */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
          <label>
            Leave this empty
            <input name="fax_number_2" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      <aside className="card h-fit space-y-2 p-4 text-sm md:col-span-2">
        <h2 className="mb-2 font-display text-xl font-bold text-maroon-700">Your order</h2>
        {items.map((i) => (
          <div key={i.id} className="flex justify-between gap-2">
            <span className="min-w-0 flex-1 truncate">
              {i.name} × {i.quantity}
            </span>
            <span>{formatPrice(i.price * i.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery</span>
          <span>{formatPrice(delivery)}</span>
        </div>
        <div className="flex justify-between border-t pt-2 text-base font-bold">
          <span>Total</span>
          <span className="text-maroon-600">{formatPrice(total)}</span>
        </div>
        {error && <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>}
        <button type="submit" disabled={busy} className="btn-primary mt-3 w-full">
          {busy ? "Placing order..." : "Place order"}
        </button>
      </aside>
    </form>
  );
}
