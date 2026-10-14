import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { deleteCategoryAction } from "@/app/admin/actions";
import { CategoryRow } from "@/components/admin/CategoryRow";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Category } from "@/lib/types";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategories() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order").order("name");
  const categories = (data ?? []) as Category[];

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Categories</h1>
      <section className="card">
        <h2 className="mb-3 font-display text-lg font-bold text-maroon-700">Add a category</h2>
        <CategoryRow />
      </section>
      <section className="card space-y-5">
        <h2 className="font-display text-lg font-bold text-maroon-700">Your categories</h2>
        {categories.length === 0 && <p className="text-sm text-ink/60">No categories yet.</p>}
        {categories.map((c) => (
          <CategoryRow
            key={c.id}
            category={c}
            deleteSlot={
              <DeleteButton
                action={deleteCategoryAction.bind(null, c.id)}
                confirmText={`Delete the category “${c.name}”? Its products stay in the store without a category.`}
              />
            }
          />
        ))}
      </section>
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
