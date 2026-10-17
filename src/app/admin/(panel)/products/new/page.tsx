import { requireAdmin } from "@/lib/auth";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Add product</h1>
      <ProductForm categories={(data ?? []) as Category[]} />
    </div>
  );
}
