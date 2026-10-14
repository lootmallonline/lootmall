import { paymentAccounts } from "@/lib/payment";
import type { Settings } from "@/lib/types";

export function PaymentDetails({ settings }: { settings: Settings }) {
  const accounts = paymentAccounts(settings);
  if (accounts.length === 0) {
    return (
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
        Payment account details are not available yet. Please message us on WhatsApp at {settings.contact_phone} and we will send them to you.
      </p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {accounts.map((a) => (
        <div key={a.key} className="rounded-xl border border-gold-300 bg-gold-300/10 p-3 text-sm">
          <p className="font-semibold text-maroon-700">{a.label}</p>
          {a.title && <p>Account title: <span className="font-medium">{a.title}</span></p>}
          <p className="break-all">Number: <span className="font-mono font-medium">{a.number}</span></p>
          {a.qr && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.qr} alt={`${a.label} QR code`} loading="lazy" className="mt-2 h-32 w-32 rounded-lg border border-maroon-100 bg-white object-contain" />
          )}
        </div>
      ))}
    </div>
  );
}
