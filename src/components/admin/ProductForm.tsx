"use client";

import { useState } from "react";
import Link from "next/link";
import { saveProductAction } from "@/app/admin/actions";
import { MediaUploader } from "./MediaUploader";
import type { Category, Product } from "@/lib/types";
import { useAdminForm } from "./useAdminForm";

function discountFrom(regular: string, sale: string): string {
  const r = Number(regular);
  const s = Number(sale);
  if (!r || !s || s >= r) return "";
  return String(Math.round(((r - s) / r) * 100));
}

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const { state, pending, onSubmit } = useAdminForm(saveProductAction, {});
  const [regular, setRegular] = useState(product ? String(product.regular_price) : "");
  const [sale, setSale] = useState(product?.sale_price != null ? String(product.sale_price) : "");
  const [discount, setDiscount] = useState(
    product?.sale_price != null ? discountFrom(String(product.regular_price), String(product.sale_price)) : ""
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <section className="card space-y-4">
        <h2 className="font-display text-lg font-bold text-maroon-700">Basic details</h2>
        <div>
          <label htmlFor="name" className="label">Product name</label>
          <input id="name" name="name" required defaultValue={product?.name} className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sku" className="label">SKU</label>
            <input id="sku" name="sku" defaultValue={product?.sku ?? ""} className="input" />
          </div>
          <div>
            <label htmlFor="category_id" className="label">Category</label>
            <select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""} className="input">
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="slug" className="label">Page address (optional)</label>
          <input id="slug" name="slug" defaultValue={product?.slug ?? ""} placeholder="made automatically from the name" className="input" />
        </div>
        <div>
          <label htmlFor="short_description" className="label">Short description</label>
          <input id="short_description" name="short_description" maxLength={300} defaultValue={product?.short_description ?? ""} className="input" />
        </div>
        <div>
          <label htmlFor="description" className="label">Full description</label>
          <textarea id="description" name="description" rows={6} defaultValue={product?.description ?? ""} className="input" />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-display text-lg font-bold text-maroon-700">Price and stock (Rs.)</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="regular_price" className="label">Regular price</label>
            <input
              id="regular_price" name="regular_price" type="number" min={0} step={1} required inputMode="numeric"
              value={regular}
              onChange={(e) => { setRegular(e.target.value); setDiscount(discountFrom(e.target.value, sale)); }}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="sale_price" className="label">Sale price</label>
            <input
              id="sale_price" name="sale_price" type="number" min={0} step={1} inputMode="numeric"
              value={sale}
              onChange={(e) => { setSale(e.target.value); setDiscount(discountFrom(regular, e.target.value)); }}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="discount" className="label">Discount %</label>
            <input
              id="discount" type="number" min={0} max={99} step={1} inputMode="numeric"
              value={discount}
              onChange={(e) => {
                const v = e.target.value;
                setDiscount(v);
                const r = Number(regular);
                const d = Number(v);
                setSale(r && d > 0 && d < 100 ? String(Math.round(r * (1 - d / 100))) : "");
              }}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="stock" className="label">Stock</label>
            <input id="stock" name="stock" type="number" min={0} step={1} required inputMode="numeric" defaultValue={product?.stock ?? 0} className="input" />
          </div>
        </div>
        <p className="text-xs text-ink/60">Type either the sale price or the discount %. The other one fills in automatically. Leave both empty for no sale.</p>
      </section>

      <section className="card space-y-5">
        <h2 className="font-display text-lg font-bold text-maroon-700">Images and video</h2>
        <MediaUploader name="images" label="Product images" kind="image" multiple initial={product?.images ?? []} folder="products" help="Up to 10 images, 10 MB each. The first image is the main one." />
        <MediaUploader name="video_url" label="Product video (optional)" kind="video" initial={product?.video_url ? [product.video_url] : []} folder="videos" help="MP4 or WebM, up to 50 MB." />
      </section>

      <section className="card flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="h-4 w-4 accent-maroon-600" />
          Visible in the store
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} className="h-4 w-4 accent-maroon-600" />
          Featured on the homepage
        </label>
      </section>

      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{state.error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn-primary px-8">{pending ? "Saving…" : "Save product"}</button>
        <Link href="/admin/products" className="btn-outline">Cancel</Link>
      </div>
    </form>
  );
}
