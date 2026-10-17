import { OrderCard } from "@/components/shop/OrderCard";
import { createServiceClient } from "@/lib/supabase/admin";
import { toLocalPhone } from "@/lib/format";
import type { Order } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Track your order" };

async function findOrder(orderNumber: string, phone: string): Promise<{ order?: Order; error?: string }> {
  try {
    const service = createServiceClient();
    const { data } = await service
      .from("orders")
      .select("*, order_items(*), order_status_history(*)")
      .eq("order_number", orderNumber.trim().toUpperCase())
      .maybeSingle();
    // Same message for "no such order" and "wrong phone" so numbers cannot be guessed.
    if (!data || toLocalPhone(data.phone) !== toLocalPhone(phone)) {
      return { error: "We could not find an order with that number and phone." };
    }
    return { order: data as Order };
  } catch {
    return { error: "Order tracking is temporarily unavailable. Please try again later." };
  }
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; phone?: string }>;
}) {
  const { order, phone } = await searchParams;
  const result = order && phone ? await findOrder(order.slice(0, 40), phone.slice(0, 25)) : null;

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Track your order</h1>
      <form className="card space-y-3 p-4" action="/track">
        <div>
          <label className="label" htmlFor="order">Order number</label>
          <input id="order" name="order" required defaultValue={order ?? ""} placeholder="LM-261015-ABC123" className="input font-mono" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone number used for the order</label>
          <input id="phone" name="phone" required inputMode="tel" defaultValue={phone ?? ""} placeholder="03001234567" className="input" />
        </div>
        <button type="submit" className="btn-primary w-full">Track</button>
      </form>
      {result?.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{result.error}</p>}
      {result?.order && <OrderCard order={result.order} />}
    </div>
  );
}
