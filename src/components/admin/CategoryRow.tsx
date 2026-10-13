"use client";

import { useEffect, useRef } from "react";
import { saveCategoryAction } from "@/app/admin/actions";
import type { Category } from "@/lib/types";
import { useAdminForm } from "./useAdminForm";

export function CategoryRow({ category, deleteSlot }: { category?: Category; deleteSlot?: React.ReactNode }) {
  const { state, pending, onSubmit } = useAdminForm(saveCategoryAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok && !category) formRef.current?.reset();
  }, [state.ok, category]);

  const prefix = category ? `c-${category.id}` : "c-new";
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-end gap-3">
      <form ref={formRef} onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        {category && <input type="hidden" name="id" value={category.id} />}
        <div className="min-w-[10rem] flex-1">
          <label htmlFor={`${prefix}-name`} className="label">Name</label>
          <input id={`${prefix}-name`} name="name" required defaultValue={category?.name} className="input" />
        </div>
        <div className="w-24">
          <label htmlFor={`${prefix}-sort`} className="label">Order</label>
          <input id={`${prefix}-sort`} name="sort_order" type="number" step={1} defaultValue={category?.sort_order ?? 0} className="input" />
        </div>
        <label className="flex items-center gap-2 pb-3 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} className="h-4 w-4 accent-maroon-600" /> Visible
        </label>
        <button type="submit" disabled={pending} className="btn-primary">{category ? "Save" : "Add category"}</button>
      </form>
      {deleteSlot}
      </div>
      {state.error && <p className="mt-1 text-sm text-red-700" role="alert">{state.error}</p>}
      {state.ok && <p className="mt-1 text-sm text-emerald-700" role="status">Saved.</p>}
    </div>
  );
}
