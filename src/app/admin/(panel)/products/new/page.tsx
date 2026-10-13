import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProduct() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  return (
    <div className="max-w-3xl space-y-5">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Add product</h1>
      <ProductForm categories={(data ?? []) as Category[]} />
    </div>
  );
}
