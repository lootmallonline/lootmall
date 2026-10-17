import { requireAdmin } from "@/lib/auth";
import { CategoryForm } from "@/components/admin/CategoryForm";
import type { Category } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  const categories = (data ?? []) as Category[];

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Categories</h1>

      <section className="card p-4">
        <h2 className="mb-3 font-display text-lg font-bold">Add a category</h2>
        <CategoryForm />
      </section>

      {categories.map((c) => (
        <details key={c.id} className="card p-4">
          <summary className="cursor-pointer font-semibold">
            {c.name} {!c.is_active && <span className="ml-2 text-xs font-normal text-gray-500">(hidden)</span>}
          </summary>
          <div className="mt-4">
            <CategoryForm category={c} />
          </div>
        </details>
      ))}
    </div>
  );
}
