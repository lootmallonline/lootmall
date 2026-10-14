import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { formatPKR } from "@/lib/format";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";

export const metadata: Metadata = { title: "Customers" };

type Stats = {
  registered_customers: number;
  orders_by_registered: number;
  guest_orders: number;
  guest_customers: number;
};
type Customer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  contact_email: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
};

export default async function AdminCustomers() {
  const { supabase } = await requireAdmin();
  const [{ data: statsData }, { data: customerData }] = await Promise.all([
    supabase.rpc("admin_customer_stats"),
    supabase.rpc("admin_customers", { p_limit: 200, p_offset: 0 }),
  ]);
  const stats = (statsData ?? { registered_customers: 0, orders_by_registered: 0, guest_orders: 0, guest_customers: 0 }) as Stats;
  const customers = (customerData ?? []) as Customer[];

  const cards = [
    { label: "Registered customers", value: stats.registered_customers, sub: `${stats.orders_by_registered} orders placed while logged in` },
    { label: "Guest / direct checkouts", value: stats.guest_orders, sub: `from ${stats.guest_customers} different phone numbers` },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Customers</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <p className="text-sm text-ink/70">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-maroon-700">{c.value}</p>
            <p className="text-xs text-ink/60">{c.sub}</p>
          </div>
        ))}
      </div>

      {customers.length === 0 ? (
        <div className="card text-sm text-ink/70">No customer has registered yet. Guest orders are in the Orders page.</div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead className="border-b border-maroon-100 bg-maroon-50 text-xs">
              <tr><th className="p-3">Customer</th><th className="p-3">Phone</th><th className="p-3">Email</th><th className="p-3">Orders</th><th className="p-3">Spent</th><th className="p-3">Joined</th></tr>
            </thead>
            <tbody className="divide-y divide-maroon-100">
              {customers.map((c) => (
                <tr key={c.id} className="align-top">
                  <td className="p-3 font-medium">{c.full_name || "—"}<div className="mt-1 font-normal"><ResetPasswordForm customerId={c.id} /></div></td>
                  <td className="p-3">{c.phone ?? "—"}</td>
                  <td className="p-3">{c.contact_email ?? "—"}</td>
                  <td className="p-3">{c.order_count}</td>
                  <td className="p-3">{formatPKR(Number(c.total_spent))}</td>
                  <td className="whitespace-nowrap p-3 text-xs">{new Date(c.created_at).toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-ink/60">Showing up to 200 newest customers. Customers log in with their mobile number; use &ldquo;Set new password&rdquo; if someone forgets theirs.</p>
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
