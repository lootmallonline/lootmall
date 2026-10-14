import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { deleteBannerAction } from "@/app/admin/actions";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { Banner } from "@/lib/types";

export const metadata: Metadata = { title: "Banners" };

export default async function AdminBanners() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("banners").select("*").order("placement").order("sort_order");
  const banners = (data ?? []) as Banner[];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold text-maroon-700">Banners and offers</h1>
        <Link href="/admin/banners/new" className="btn-primary">Add banner</Link>
      </div>
      {banners.length === 0 ? (
        <div className="card text-sm text-ink/70">No banners yet. Until you add one, the homepage shows a default LootMall welcome section.</div>
      ) : (
        <ul className="space-y-3">
          {banners.map((b) => (
            <li key={b.id} className="card flex flex-wrap items-center gap-4">
              {b.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image_url} alt="" className="h-16 w-28 rounded-lg object-cover" />
              ) : (
                <span className="h-16 w-28 rounded-lg bg-maroon-50" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{b.title}</p>
                <p className="text-xs text-ink/60">
                  {b.placement === "hero" ? "Homepage slider" : "Offer tile"} · {b.is_active ? "Shown" : "Hidden"} · Order {b.sort_order}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/banners/${b.id}`} className="btn-outline px-3 py-1.5">Edit</Link>
                <DeleteButton action={deleteBannerAction.bind(null, b.id)} confirmText={`Delete the banner “${b.title}”?`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
