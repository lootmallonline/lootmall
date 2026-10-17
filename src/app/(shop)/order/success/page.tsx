import Link from "next/link";
import { getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Order placed" };

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string; t?: string; m?: string }>;
}) {
  const { n, t, m } = await searchParams;
  const settings = await getSettings();
  const advance = m === "advance";
  const wa = `https://wa.me/92${settings.contact_phone.replace(/\D/g, "").replace(/^0/, "")}`;

  return (
    <div className="mx-auto max-w-xl space-y-4 text-center">
      <div className="rounded-card bg-green-50 p-8">
        <p className="text-4xl">✅</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-green-800">Thank you! Your order is placed</h1>
        {n && (
          <p className="mt-3 text-sm text-gray-700">
            Order number: <strong className="font-mono text-base">{n}</strong>
          </p>
        )}
        {t && Number(t) > 0 && <p className="mt-1 text-sm text-gray-700">Total: {formatPrice(Number(t))}</p>}
      </div>

      {advance ? (
        <div className="rounded-card bg-gold-300/20 p-5 text-sm text-gray-800">
          <p className="font-semibold text-maroon-700">Next step: send your payment screenshot</p>
          <p className="mt-1">
            We will confirm your order after we verify your advance payment. Please send the screenshot and your order
            number on WhatsApp.
          </p>
          <a href={wa} className="btn-primary mt-3" target="_blank" rel="noreferrer">
            WhatsApp {settings.contact_phone}
          </a>
        </div>
      ) : (
        <p className="rounded-card bg-maroon-50 p-5 text-sm text-gray-800">
          Pay in cash when the parcel arrives. We will call you to confirm the order.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/track" className="btn-outline">Track your order</Link>
        <Link href="/products" className="btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
}
