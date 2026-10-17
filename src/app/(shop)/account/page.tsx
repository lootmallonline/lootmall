import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderCard } from "@/components/shop/OrderCard";
import { getCurrentUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { customerLogoutAction } from "./actions";
import type { Order } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");

  const supabase = await createServerSupabase();
  const [{ data: profile }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, contact_email, role").eq("id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("*, order_items(*), order_status_history(*)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-maroon-700">My account</h1>
          <p className="text-sm text-gray-600">
            {profile?.full_name ?? "Customer"}
            {profile?.phone ? ` · ${profile.phone}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {profile?.role === "admin" && (
            <Link href="/admin" className="btn-outline">Admin panel</Link>
          )}
          <form action={customerLogoutAction}>
            <button type="submit" className="btn-outline">Log out</button>
          </form>
        </div>
      </div>

      <h2 className="font-display text-xl font-bold">My orders</h2>
      {!orders || orders.length === 0 ? (
        <p className="rounded-card bg-maroon-50 p-8 text-center text-gray-600">
          You have no orders yet.{" "}
          <Link href="/products" className="font-semibold text-maroon-600">Start shopping</Link>
        </p>
      ) : (
        <div className="space-y-4">
          {(orders as Order[]).map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  );
}
