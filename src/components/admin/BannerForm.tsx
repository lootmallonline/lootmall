"use client";

import { saveBannerAction, deleteBannerAction } from "@/app/admin/actions";
import { useActionForm } from "@/components/useActionForm";
import { Field, FormMessage, SubmitButton } from "./ui";
import { UploadField } from "./UploadField";
import { DeleteButton } from "./DeleteButton";
import type { Banner } from "@/lib/types";

export function BannerForm({ banner }: { banner?: Banner }) {
  const { state, pending, onSubmit } = useActionForm(saveBannerAction.bind(null, banner?.id ?? null));
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Title">
          <input name="title" required defaultValue={banner?.title} className="input" />
        </Field>
        <Field label="Subtitle (optional)">
          <input name="subtitle" defaultValue={banner?.subtitle ?? ""} className="input" />
        </Field>
        <Field label="Link (optional)" hint="Example: /category/fashion">
          <input name="link_url" defaultValue={banner?.link_url ?? ""} className="input" />
        </Field>
        <Field label="Where to show">
          <select name="placement" defaultValue={banner?.placement ?? "hero"} className="input">
            <option value="hero">Top of home page (big)</option>
            <option value="promo">Promo box (small)</option>
          </select>
        </Field>
        <Field label="Order (small number first)">
          <input name="sort_order" type="number" defaultValue={banner?.sort_order ?? 0} className="input" />
        </Field>
      </div>
      <div>
        <span className="label">Image (optional)</span>
        <UploadField name="image_url" defaultValue={banner?.image_url} folder="banners" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={banner?.is_active ?? true} /> Visible in the store
      </label>
      <FormMessage state={state} />
      <div className="flex items-center gap-4">
        <SubmitButton pending={pending}>{banner ? "Save" : "Add banner"}</SubmitButton>
        {banner && <DeleteButton action={deleteBannerAction.bind(null, banner.id)} />}
      </div>
    </form>
  );
}
