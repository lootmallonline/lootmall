import { requireAdmin } from "@/lib/auth";
import { CustomerPasswordForm } from "@/components/admin/CustomerPasswordForm";
import { formatDate, formatPrice } from "@/lib/format";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

interface CustomerStats {
  registered_customers: number;
  orders_by_registered: number;
  guest_orders: number;
  guest_customers: number;
}

interface CustomerRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  contact_email: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

export default async function AdminCustomersPage() {
  const { supabase } = await requireAdmin();
  const [{ data: stats }, { data: rows }] = await Promise.all([
    supabase.rpc("admin_customer_stats"),
    supabase.rpc("admin_customers", { p_limit: 200, p_offset: 0 }),
  ]);
  const s = (stats ?? {}) as Partial<CustomerStats>;
  const customers = (rows ?? []) as CustomerRow[];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Customers</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs uppercase text-gray-500">Registered customers</p>
          <p className="font-display text-2xl font-bold text-maroon-700">{s.registered_customers ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase text-gray-500">Orders by registered</p>
          <p className="font-display text-2xl font-bold text-maroon-700">{s.orders_by_registered ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase text-gray-500">Guest checkouts (orders)</p>
          <p className="font-display text-2xl font-bold text-maroon-700">{s.guest_orders ?? 0}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase text-gray-500">Guest customers (phones)</p>
          <p className="font-display text-2xl font-bold text-maroon-700">{s.guest_customers ?? 0}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-xl font-bold">Registered customers</h2>
        {customers.length === 0 && <p className="card p-6 text-center text-gray-500">No registered customers yet.</p>}
        {customers.map((c) => (
          <details key={c.id} className="card p-4 text-sm">
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">
                {c.full_name || "No name"} <span className="font-normal text-gray-500">{c.phone}</span>
              </span>
              <span className="text-xs text-gray-500">
                {c.order_count} orders · {formatPrice(c.total_spent)} · joined {formatDate(c.created_at)}
              </span>
            </summary>
            <div className="mt-3 space-y-2">
              {c.contact_email && <p>Email: {c.contact_email}</p>}
              <p className="text-xs text-gray-500">Customers cannot reset their own password. Set a new one and tell them.</p>
              <CustomerPasswordForm customerId={c.id} />
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
