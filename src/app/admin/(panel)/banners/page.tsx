import { requireAdmin } from "@/lib/auth";
import { BannerForm } from "@/components/admin/BannerForm";
import type { Banner } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("banners").select("*").order("placement").order("sort_order");
  const banners = (data ?? []) as Banner[];

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Banners</h1>

      <section className="card p-4">
        <h2 className="mb-3 font-display text-lg font-bold">Add a banner</h2>
        <BannerForm />
      </section>

      {banners.map((b) => (
        <details key={b.id} className="card p-4">
          <summary className="cursor-pointer font-semibold">
            {b.title}
            <span className="ml-2 text-xs font-normal text-gray-500">
              ({b.placement === "hero" ? "top of home page" : "promo box"}
              {!b.is_active ? ", hidden" : ""})
            </span>
          </summary>
          <div className="mt-4">
            <BannerForm banner={b} />
          </div>
        </details>
      ))}
    </div>
  );
}
