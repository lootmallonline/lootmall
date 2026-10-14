"use client";

import Link from "next/link";
import { saveBannerAction } from "@/app/admin/actions";
import { MediaUploader } from "./MediaUploader";
import type { Banner } from "@/lib/types";
import { useAdminForm } from "./useAdminForm";

export function BannerForm({ banner }: { banner?: Banner }) {
  const { state, pending, onSubmit } = useAdminForm(saveBannerAction, {});
  return (
    <form onSubmit={onSubmit} className="card max-w-2xl space-y-4">
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <div>
        <label htmlFor="title" className="label">Title</label>
        <input id="title" name="title" required defaultValue={banner?.title} className="input" />
      </div>
      <div>
        <label htmlFor="subtitle" className="label">Subtitle (optional)</label>
        <input id="subtitle" name="subtitle" defaultValue={banner?.subtitle ?? ""} className="input" />
      </div>
      <MediaUploader name="image_url" label="Banner image (optional)" kind="image" initial={banner?.image_url ? [banner.image_url] : []} folder="banners" help="Wide images look best (for example 1600 × 600)." />
      <div>
        <label htmlFor="link_url" className="label">Link (optional)</label>
        <input id="link_url" name="link_url" defaultValue={banner?.link_url ?? ""} placeholder="/products or https://…" className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="placement" className="label">Where to show it</label>
          <select id="placement" name="placement" defaultValue={banner?.placement ?? "hero"} className="input">
            <option value="hero">Top of homepage (slider)</option>
            <option value="promo">Offer tile below categories</option>
          </select>
        </div>
        <div>
          <label htmlFor="sort_order" className="label">Order</label>
          <input id="sort_order" name="sort_order" type="number" step={1} defaultValue={banner?.sort_order ?? 0} className="input" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="is_active" defaultChecked={banner?.is_active ?? true} className="h-4 w-4 accent-maroon-600" /> Show on the store
      </label>
      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{state.error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary px-8">{pending ? "Saving…" : "Save banner"}</button>
        <Link href="/admin/banners" className="btn-outline">Cancel</Link>
      </div>
    </form>
  );
}
