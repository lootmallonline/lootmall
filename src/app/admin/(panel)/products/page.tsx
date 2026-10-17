import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProductAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(500);
  const products = (data ?? []) as Product[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-maroon-700">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">+ Add product</Link>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Visible</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t align-middle">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-maroon-50">
                      {p.images?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      {p.sku && <p className="text-xs text-gray-500">{p.sku}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  {formatPrice(p.sale_price ?? p.regular_price)}
                  {p.sale_price != null && <span className="ml-1 text-xs text-gray-400 line-through">{formatPrice(p.regular_price)}</span>}
                </td>
                <td className={`px-4 py-2 ${p.stock <= 0 ? "font-semibold text-red-600" : ""}`}>{p.stock}</td>
                <td className="px-4 py-2">{p.is_active ? "Yes" : "Hidden"}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/products/${p.id}`} className="text-sm font-medium text-maroon-600 hover:underline">Edit</Link>
                    <DeleteButton action={deleteProductAction.bind(null, p.id)} confirmText={`Delete "${p.name}"? This cannot be undone.`} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No products yet. Add your first product.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
