import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { customerLogoutAction } from "./actions";
import { formatPKR } from "@/lib/format";
import { StatusTimeline } from "@/components/shop/StatusTimeline";
import { EmptyState } from "@/components/shop/EmptyState";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrderStatusHistory,
} from "@/lib/types";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

type OrderRow = Order & { order_items: OrderItem[]; order_status_history: OrderStatusHistory[] };

export default async function AccountPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/account/login");

  const { data: profile } = await supabase.from("profiles").select("full_name,phone,contact_email").eq("id", user.id).maybeSingle();
  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*), order_status_history(*)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const orders = (data ?? []) as OrderRow[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-700">My account</h1>
          <p className="mt-1 text-sm text-ink/70">
            {(profile?.full_name as string) || "Customer"}
            {profile?.phone ? ` · ${profile.phone as string}` : ""}
            {profile?.contact_email ? ` · ${profile.contact_email as string}` : ""}
          </p>
        </div>
        <form action={customerLogoutAction}>
          <button type="submit" className="btn-outline px-4 py-1.5">Log out</button>
        </form>
      </div>

      <h2 className="mb-4 mt-8 font-display text-xl font-bold text-maroon-700">My orders</h2>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" message="Orders you place while logged in will appear here with their status." actionHref="/products" actionLabel="Start shopping" />
      ) : (
        <ul className="space-y-5">
          {orders.map((o) => (
            <li key={o.id} className="card space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-lg font-bold text-maroon-700">{o.order_number}</p>
                  <p className="text-xs text-ink/60">
                    {new Date(o.created_at).toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className="rounded-full bg-gold-300/50 px-3 py-1 text-sm font-semibold">{ORDER_STATUS_LABELS[o.status as OrderStatus]}</span>
              </div>

              <StatusTimeline status={o.status} history={o.order_status_history ?? []} />

              <ul className="divide-y divide-maroon-100 border-t border-maroon-100 text-sm">
                {(o.order_items ?? []).map((i) => (
                  <li key={i.id} className="flex justify-between gap-3 py-2">
                    <span>{i.name} <span className="text-ink/60">× {i.quantity}</span></span>
                    <span>{formatPKR(i.line_total)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap justify-between gap-2 text-sm">
                <span>{PAYMENT_METHOD_LABELS[o.payment_method]} · {PAYMENT_STATUS_LABELS[o.payment_status]}</span>
                <span className="font-bold text-maroon-700">Total {formatPKR(o.total)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-center text-sm">
        Placed an order without logging in? <Link href="/track" className="font-semibold text-maroon-700 hover:underline">Track it here</Link>.
      </p>
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
