import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { Barcode } from "@/components/Barcode";
import { PrintControls } from "@/components/admin/PrintControls";
import { formatDate, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Packing label" };

const SIZES = {
  "4x6": { w: "4in", h: "6in", label: "4 × 6 in" },
  "3x7": { w: "3in", h: "7in", label: "3 × 7 in" },
} as const;

export default async function LabelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ size?: string }>;
}) {
  const { supabase } = await requireAdmin();
  const { id } = await params;
  const { size: sizeParam } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const size = sizeParam === "3x7" ? "3x7" : "4x6";
  const dims = SIZES[size];

  const [{ data }, settings] = await Promise.all([
    supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle(),
    getSettings(),
  ]);
  if (!data) notFound();
  const order = data as Order;
  const items = order.order_items ?? [];
  const collect = order.payment_method === "cod" && order.payment_status !== "paid";

  return (
    <div>
      <style>{`@page { size: ${dims.w} ${dims.h}; margin: 0; } @media print { html, body { margin: 0; background: #fff; } }`}</style>
      <PrintControls
        backHref={`/admin/orders/${order.id}`}
        current={size}
        sizes={(Object.keys(SIZES) as (keyof typeof SIZES)[]).map((k) => ({
          key: k,
          label: SIZES[k].label,
          href: `/admin/orders/${order.id}/label?size=${k}`,
        }))}
      />

      <div
        className="mx-auto flex flex-col gap-2 overflow-hidden border-2 border-black bg-white p-3 text-black"
        style={{ width: dims.w, height: dims.h, boxSizing: "border-box" }}
      >
        <div className="flex items-start justify-between border-b border-black pb-1">
          <div>
            <p className="text-base font-extrabold leading-none">{settings.store_name}</p>
            <p className="text-[10px]">Support: {settings.contact_phone}</p>
          </div>
          <p className="text-[10px]">{formatDate(order.created_at)}</p>
        </div>

        <div>
          <Barcode value={order.order_number} height={44} />
          <p className="text-center font-mono text-xs font-bold tracking-wider">{order.order_number}</p>
        </div>

        <div className="border border-black p-2">
          <p className="text-[10px] font-bold uppercase">Ship to</p>
          <p className="text-sm font-extrabold leading-tight">{order.customer_name}</p>
          <p className="text-sm font-bold">{order.phone}</p>
          <p className="text-xs leading-tight">{order.address}</p>
          <p className="text-sm font-extrabold uppercase">{order.city}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden text-[11px] leading-tight">
          <p className="font-bold uppercase">Items</p>
          {items.map((i) => (
            <p key={i.id} className="truncate">
              {i.quantity} × {i.name}
            </p>
          ))}
          {order.notes && <p className="mt-1 italic">Note: {order.notes}</p>}
        </div>

        <div className="border-2 border-black p-2 text-center">
          {collect ? (
            <>
              <p className="text-[10px] font-bold uppercase">Cash on Delivery: collect</p>
              <p className="text-xl font-extrabold">{formatPrice(order.total)}</p>
            </>
          ) : (
            <>
              <p className="text-sm font-extrabold uppercase">Paid: do not collect cash</p>
              <p className="text-[10px]">Order total {formatPrice(order.total)}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
