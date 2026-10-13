"use client";

import { saveSettingsAction } from "@/app/admin/actions";
import type { Settings } from "@/lib/types";
import { useAdminForm } from "./useAdminForm";

export function SettingsForm({ settings }: { settings: Settings }) {
  const { state, pending, onSubmit } = useAdminForm(saveSettingsAction, {});
  return (
    <form onSubmit={onSubmit} className="card max-w-xl space-y-4">
      <div>
        <label htmlFor="store_name" className="label">Store name</label>
        <input id="store_name" name="store_name" required defaultValue={settings.store_name} className="input" />
      </div>
      <div>
        <label htmlFor="tagline" className="label">Tagline</label>
        <input id="tagline" name="tagline" required defaultValue={settings.tagline} className="input" />
      </div>
      <div>
        <label htmlFor="delivery_charge" className="label">Delivery charge per order (Rs.)</label>
        <input id="delivery_charge" name="delivery_charge" type="number" min={0} step={1} required inputMode="numeric" defaultValue={settings.delivery_charge} className="input" />
      </div>
      <div>
        <label htmlFor="contact_phone" className="label">Phone / WhatsApp number</label>
        <input id="contact_phone" name="contact_phone" type="tel" required defaultValue={settings.contact_phone} className="input" />
      </div>
      <div>
        <label htmlFor="contact_email" className="label">Contact email</label>
        <input id="contact_email" name="contact_email" type="email" required defaultValue={settings.contact_email} className="input" />
      </div>
      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" role="status">Settings saved.</p>}
      <button type="submit" disabled={pending} className="btn-primary px-8">{pending ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
