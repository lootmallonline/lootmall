import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { formatPKR } from "@/lib/format";
import { sanitizeSearch } from "@/lib/utils";
import { deleteProductAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Product } from "@/lib/types";

export const metadata: Metadata = { title: "Products" };
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminProducts({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const q = sanitizeSearch((Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "");

  let query = supabase.from("products").select("*").order("created_at", { ascending: false }).limit(200);
  if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
  const { data } = await query;
  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-maroon-700">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">Add product</Link>
      </div>
      <form className="flex max-w-md gap-2" role="search">
        <label htmlFor="q" className="sr-only">Search products</label>
        <input id="q" name="q" defaultValue={q} placeholder="Search name or SKU" className="input" />
        <button type="submit" className="btn-outline">Search</button>
      </form>

      {products.length === 0 ? (
        <div className="card text-center text-sm text-ink/70">
          {q ? "No products match your search." : "You have no products yet. Click “Add product” to create your first one."}
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-maroon-100 bg-maroon-50 text-xs">
              <tr>
                <th className="p-3">Product</th><th className="p-3">SKU</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-maroon-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <span className="h-12 w-12 rounded-lg bg-maroon-50" />
                      )}
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{p.sku ?? "—"}</td>
                  <td className="p-3">{formatPKR(p.sale_price ?? p.regular_price)}{p.sale_price != null && <s className="ml-1 text-xs text-ink/50">{formatPKR(p.regular_price)}</s>}</td>
                  <td className={`p-3 ${p.stock === 0 ? "font-semibold text-red-700" : ""}`}>{p.stock}</td>
                  <td className="p-3">{p.is_active ? "Visible" : "Hidden"}{p.is_featured ? " · Featured" : ""}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${p.id}`} className="btn-outline px-3 py-1.5">Edit</Link>
                      <DeleteButton action={deleteProductAction.bind(null, p.id)} confirmText={`Delete “${p.name}”? This cannot be undone.`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
