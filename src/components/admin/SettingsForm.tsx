"use client";

import { saveSettingsAction } from "@/app/admin/actions";
import { useActionForm } from "@/components/useActionForm";
import { Field, FormMessage, SubmitButton } from "./ui";
import { UploadField } from "./UploadField";
import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const { state, pending, onSubmit } = useActionForm(saveSettingsAction);
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="card space-y-3 p-5">
        <h2 className="font-display text-xl font-bold text-maroon-700">Store</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Store name">
            <input name="store_name" defaultValue={settings.store_name} className="input" />
          </Field>
          <Field label="Tagline">
            <input name="tagline" defaultValue={settings.tagline} className="input" />
          </Field>
          <Field label="Support phone">
            <input name="contact_phone" defaultValue={settings.contact_phone} className="input" />
          </Field>
          <Field label="Support email">
            <input name="contact_email" defaultValue={settings.contact_email} className="input" />
          </Field>
          <Field label="Delivery charge (Rs.)">
            <input name="delivery_charge" type="number" min={0} defaultValue={settings.delivery_charge} className="input" />
          </Field>
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="font-display text-xl font-bold text-maroon-700">Cash on Delivery cities</h2>
        <Field label="COD cities (separate with commas)" hint="Example: Rawalpindi, Islamabad, Pindi, RWP. Any other city must pay in advance.">
          <input name="cod_cities" defaultValue={settings.cod_cities} className="input" />
        </Field>
      </section>

      <section className="card space-y-4 p-5">
        <h2 className="font-display text-xl font-bold text-maroon-700">Advance payment accounts</h2>
        <p className="text-sm text-gray-600">Customers outside the COD cities see these at checkout. Leave an account empty to hide it.</p>

        <div className="space-y-3 rounded-xl border p-4">
          <h3 className="font-semibold">Bank</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Bank name">
              <input name="bank_name" defaultValue={settings.bank_name} className="input" />
            </Field>
            <Field label="Account title">
              <input name="bank_account_title" defaultValue={settings.bank_account_title} className="input" />
            </Field>
            <Field label="Account number / IBAN">
              <input name="bank_account_number" defaultValue={settings.bank_account_number} className="input" />
            </Field>
          </div>
          <div>
            <span className="label">QR image (optional)</span>
            <UploadField name="bank_qr_url" defaultValue={settings.bank_qr_url} folder="qr" />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border p-4">
          <h3 className="font-semibold">EasyPaisa</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Account title">
              <input name="easypaisa_title" defaultValue={settings.easypaisa_title} className="input" />
            </Field>
            <Field label="Number">
              <input name="easypaisa_number" defaultValue={settings.easypaisa_number} className="input" />
            </Field>
          </div>
          <div>
            <span className="label">QR image (optional)</span>
            <UploadField name="easypaisa_qr_url" defaultValue={settings.easypaisa_qr_url} folder="qr" />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border p-4">
          <h3 className="font-semibold">JazzCash</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Account title">
              <input name="jazzcash_title" defaultValue={settings.jazzcash_title} className="input" />
            </Field>
            <Field label="Number">
              <input name="jazzcash_number" defaultValue={settings.jazzcash_number} className="input" />
            </Field>
          </div>
          <div>
            <span className="label">QR image (optional)</span>
            <UploadField name="jazzcash_qr_url" defaultValue={settings.jazzcash_qr_url} folder="qr" />
          </div>
        </div>
      </section>

      <FormMessage state={state} />
      <SubmitButton pending={pending}>Save settings</SubmitButton>
    </form>
  );
}
