import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/data";
import { formatPKR } from "@/lib/format";
import { LOGO_SRC, SITE_NAME } from "@/lib/site";
import { Barcode } from "@/components/shop/Barcode";
import { PrintBar } from "@/components/admin/PrintBar";
import type { Order, OrderItem } from "@/lib/types";

export const metadata: Metadata = { title: "Packing label" };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SIZES = {
  "4x6": { w: "4in", h: "6in", label: "4 × 6 in (thermal)" },
  "3x7": { w: "3in", h: "7in", label: "3 × 7 in" },
} as const;

export default async function PackingLabel({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const sizeKey = (Array.isArray(sp.size) ? sp.size[0] : sp.size) === "3x7" ? "3x7" : "4x6";
  const size = SIZES[sizeKey];

  const { supabase } = await requireAdmin();
  const [{ data: order }, { data: itemRows }, settings] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
    getSettings(),
  ]);
  if (!order) notFound();
  const o = order as Order;
  const items = (itemRows ?? []) as OrderItem[];

  const codDue = o.payment_method === "cod" && o.payment_status !== "paid" ? o.total : 0;
  const warning =
    o.payment_method === "advance" && o.payment_status !== "paid"
      ? "This is an advance-payment order and the payment is not marked as Paid yet. Check the payment before dispatching."
      : o.status === "cancelled"
        ? "This order is cancelled. Do not dispatch it."
        : undefined;

  const css = `@page { size: ${size.w} ${size.h}; margin: 0; }
html, body { background: #fff; }
@media print { .no-print { display: none !important; } .label-sheet { border: none !important; box-shadow: none !important; margin: 0 !important; } body, div { background: transparent !important; } }`;

  return (
    <div className="p-4 print:p-0">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <PrintBar
        backHref={`/admin/orders/${o.id}`}
        sizes={Object.entries(SIZES).map(([key, v]) => ({ key, label: v.label }))}
        currentSize={sizeKey}
        basePath={`/admin/label/${o.id}`}
        warning={warning}
      />

      <div
        className="label-sheet mx-auto flex flex-col overflow-hidden border-2 border-black bg-white p-3 text-black shadow"
        style={{ width: size.w, height: size.h, fontSize: 11, lineHeight: 1.25 }}
      >
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div>
            {LOGO_SRC ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={LOGO_SRC} alt={SITE_NAME} style={{ height: 30, width: "auto" }} />
            ) : (
              <p className="font-display text-xl font-bold leading-none">{SITE_NAME}</p>
            )}
            <p className="text-[10px]">{settings.tagline}</p>
          </div>
          <p className="text-right text-[10px]">
            Support
            <br />
            <span className="text-xs font-bold">{settings.contact_phone}</span>
          </p>
        </div>

        <div className="border-b-2 border-black py-2">
          <p className="text-[10px] uppercase">Order ID</p>
          <p className="font-mono text-base font-bold tracking-wide">{o.order_number}</p>
          <Barcode value={o.order_number} height={48} />
        </div>

        <div className="border-b-2 border-black py-2">
          <p className="text-[10px] uppercase">Ship to</p>
          <p className="text-sm font-bold">{o.customer_name}</p>
          <p className="font-bold">{o.phone}</p>
          <p className="mt-0.5">{o.address}</p>
          <p className="mt-1 text-base font-bold uppercase">{o.city}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden border-b-2 border-black py-2">
          <p className="text-[10px] uppercase">Items</p>
          <ul>
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-2">
                <span>{i.name}{i.sku ? ` (${i.sku})` : ""}</span>
                <span className="shrink-0 font-bold">× {i.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 text-center">
          {codDue > 0 ? (
            <>
              <p className="text-[10px] font-bold uppercase">Cash on delivery — amount to collect</p>
              <p className="text-2xl font-extrabold">{formatPKR(codDue)}</p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase">{o.payment_method === "advance" ? "Advance payment" : "Paid"}</p>
              <p className="text-xl font-extrabold">Rs. 0 to collect</p>
            </>
          )}
          <p className="text-[9px]">Total {formatPKR(o.total)} · {new Date(o.created_at).toLocaleDateString("en-PK", { timeZone: "Asia/Karachi" })}</p>
        </div>
      </div>
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
