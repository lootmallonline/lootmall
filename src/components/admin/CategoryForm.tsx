"use client";

import { saveCategoryAction, deleteCategoryAction } from "@/app/admin/actions";
import { useActionForm } from "@/components/useActionForm";
import { Field, FormMessage, SubmitButton } from "./ui";
import { UploadField } from "./UploadField";
import { DeleteButton } from "./DeleteButton";
import type { Category } from "@/lib/types";

export function CategoryForm({ category }: { category?: Category }) {
  const { state, pending, onSubmit } = useActionForm(saveCategoryAction.bind(null, category?.id ?? null));
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Name">
          <input name="name" required defaultValue={category?.name} className="input" />
        </Field>
        <Field label="Slug" hint="Empty = made from the name.">
          <input name="slug" defaultValue={category?.slug} className="input" />
        </Field>
        <Field label="Order (small number first)">
          <input name="sort_order" type="number" defaultValue={category?.sort_order ?? 0} className="input" />
        </Field>
      </div>
      <div>
        <span className="label">Image (optional)</span>
        <UploadField name="image_url" defaultValue={category?.image_url} folder="categories" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} /> Visible in the store
      </label>
      <FormMessage state={state} />
      <div className="flex items-center gap-4">
        <SubmitButton pending={pending}>{category ? "Save" : "Add category"}</SubmitButton>
        {category && (
          <DeleteButton
            action={deleteCategoryAction.bind(null, category.id)}
            confirmText="Delete this category? Its products stay but will have no category."
          />
        )}
      </div>
    </form>
  );
}
