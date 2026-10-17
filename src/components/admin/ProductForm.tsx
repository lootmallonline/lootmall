"use client";

import Link from "next/link";
import { saveProductAction } from "@/app/admin/actions";
import { useActionForm } from "@/components/useActionForm";
import { Field, FormMessage, SubmitButton } from "./ui";
import { MediaUploader } from "./MediaUploader";
import { UploadField } from "./UploadField";
import type { Category, Product } from "@/lib/types";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const { state, pending, onSubmit } = useActionForm(saveProductAction.bind(null, product?.id ?? null));

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product name">
          <input name="name" required defaultValue={product?.name} className="input" />
        </Field>
        <Field label="Slug (web address)" hint="Leave empty to make it from the name.">
          <input name="slug" defaultValue={product?.slug} className="input" />
        </Field>
        <Field label="SKU (optional)">
          <input name="sku" defaultValue={product?.sku ?? ""} className="input" />
        </Field>
        <Field label="Category">
          <select name="category_id" defaultValue={product?.category_id ?? ""} className="input">
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Regular price (Rs.)">
          <input name="regular_price" type="number" min={0} required defaultValue={product?.regular_price} className="input" />
        </Field>
        <Field label="Sale price (Rs., optional)" hint="Must be lower than the regular price.">
          <input name="sale_price" type="number" min={0} defaultValue={product?.sale_price ?? ""} className="input" />
        </Field>
        <Field label="Stock quantity">
          <input name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} className="input" />
        </Field>
      </div>

      <Field label="Short description">
        <input name="short_description" defaultValue={product?.short_description ?? ""} className="input" />
      </Field>
      <Field label="Full description">
        <textarea name="description" rows={5} defaultValue={product?.description ?? ""} className="input" />
      </Field>

      <div>
        <span className="label">Images (the first one is the main image)</span>
        <MediaUploader name="images" initial={product?.images ?? []} />
      </div>
      <div>
        <span className="label">Video (optional, mp4 or webm)</span>
        <UploadField name="video_url" defaultValue={product?.video_url} accept="video/mp4,video/webm" folder="videos" />
      </div>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} /> Visible in the store
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} /> Featured on home page
        </label>
      </div>

      <FormMessage state={state} />
      <div className="flex gap-3">
        <SubmitButton pending={pending}>{product ? "Save product" : "Add product"}</SubmitButton>
        <Link href="/admin/products" className="btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}
