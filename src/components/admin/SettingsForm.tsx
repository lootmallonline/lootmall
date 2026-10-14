"use client";

import { saveSettingsAction } from "@/app/admin/actions";
import { useAdminForm } from "./useAdminForm";
import { MediaUploader } from "./MediaUploader";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const { state, pending, onSubmit } = useAdminForm(saveSettingsAction, {});
  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <section className="card space-y-4">
        <h2 className="font-display text-lg font-bold text-maroon-700">Store</h2>
        <div>
          <label htmlFor="store_name" className="label">Store name</label>
          <input id="store_name" name="store_name" required defaultValue={settings.store_name} className="input" />
        </div>
        <div>
          <label htmlFor="tagline" className="label">Tagline</label>
          <input id="tagline" name="tagline" required defaultValue={settings.tagline} className="input" />
        </div>
        <div>
          <label htmlFor="contact_phone" className="label">Phone / WhatsApp number</label>
          <input id="contact_phone" name="contact_phone" type="tel" required defaultValue={settings.contact_phone} className="input" />
        </div>
        <div>
          <label htmlFor="contact_email" className="label">Contact email</label>
          <input id="contact_email" name="contact_email" type="email" required defaultValue={settings.contact_email} className="input" />
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="font-display text-lg font-bold text-maroon-700">Delivery and Cash on Delivery</h2>
        <div>
          <label htmlFor="delivery_charge" className="label">Delivery charge per order (Rs.)</label>
          <input id="delivery_charge" name="delivery_charge" type="number" min={0} step={1} required inputMode="numeric" defaultValue={settings.delivery_charge} className="input" />
        </div>
        <div>
          <label htmlFor="cod_cities" className="label">Cash on Delivery cities (separate with commas)</label>
          <input id="cod_cities" name="cod_cities" defaultValue={settings.cod_cities} placeholder="Rawalpindi, Islamabad" className="input" />
          <p className="mt-1 text-xs text-ink/60">
            Customers in these cities can pay cash on delivery. Everyone else must pay in advance. A customer city matches when it contains one of these words (for example &quot;Islamabad F-7&quot; matches &quot;Islamabad&quot;). Add short forms such as Pindi or RWP here if customers write them.
          </p>
        </div>
      </section>

      <section className="card space-y-5">
        <div>
          <h2 className="font-display text-lg font-bold text-maroon-700">Advance payment accounts</h2>
          <p className="text-xs text-ink/60">Customers outside the COD cities see these details at checkout. Leave an account empty to hide it.</p>
        </div>

        <fieldset className="space-y-3 rounded-xl border border-maroon-100 p-4">
          <legend className="px-2 text-sm font-semibold">Bank account</legend>
          <div>
            <label htmlFor="bank_name" className="label">Bank name</label>
            <input id="bank_name" name="bank_name" defaultValue={settings.bank_name} className="input" />
          </div>
          <div>
            <label htmlFor="bank_account_title" className="label">Account title</label>
            <input id="bank_account_title" name="bank_account_title" defaultValue={settings.bank_account_title} className="input" />
          </div>
          <div>
            <label htmlFor="bank_account_number" className="label">Account number / IBAN</label>
            <input id="bank_account_number" name="bank_account_number" defaultValue={settings.bank_account_number} className="input" />
          </div>
          <MediaUploader name="bank_qr_url" label="Bank QR code (optional)" kind="image" initial={settings.bank_qr_url ? [settings.bank_qr_url] : []} folder="qr" />
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-maroon-100 p-4">
          <legend className="px-2 text-sm font-semibold">EasyPaisa</legend>
          <div>
            <label htmlFor="easypaisa_title" className="label">Account title</label>
            <input id="easypaisa_title" name="easypaisa_title" defaultValue={settings.easypaisa_title} className="input" />
          </div>
          <div>
            <label htmlFor="easypaisa_number" className="label">EasyPaisa number</label>
            <input id="easypaisa_number" name="easypaisa_number" defaultValue={settings.easypaisa_number} className="input" />
          </div>
          <MediaUploader name="easypaisa_qr_url" label="EasyPaisa QR code (optional)" kind="image" initial={settings.easypaisa_qr_url ? [settings.easypaisa_qr_url] : []} folder="qr" />
        </fieldset>

        <fieldset className="space-y-3 rounded-xl border border-maroon-100 p-4">
          <legend className="px-2 text-sm font-semibold">JazzCash</legend>
          <div>
            <label htmlFor="jazzcash_title" className="label">Account title</label>
            <input id="jazzcash_title" name="jazzcash_title" defaultValue={settings.jazzcash_title} className="input" />
          </div>
          <div>
            <label htmlFor="jazzcash_number" className="label">JazzCash number</label>
            <input id="jazzcash_number" name="jazzcash_number" defaultValue={settings.jazzcash_number} className="input" />
          </div>
          <MediaUploader name="jazzcash_qr_url" label="JazzCash QR code (optional)" kind="image" initial={settings.jazzcash_qr_url ? [settings.jazzcash_qr_url] : []} folder="qr" />
        </fieldset>
      </section>

      {state.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{state.error}</p>}
      {state.ok && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" role="status">Settings saved.</p>}
      <button type="submit" disabled={pending} className="btn-primary px-8">{pending ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
