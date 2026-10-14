import type { Settings } from "@/lib/types";

/** Same rule the database uses: the city contains one of the COD cities from Admin > Settings. */
export function isCodCity(city: string, codCities: string): boolean {
  const c = city.trim().toLowerCase();
  if (!c) return false;
  return codCities
    .toLowerCase()
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .some((entry) => c.includes(entry));
}

export type PaymentAccount = { key: string; label: string; title: string; number: string; qr: string };

/** Only accounts the admin has filled in are returned. */
export function paymentAccounts(s: Settings): PaymentAccount[] {
  const list: PaymentAccount[] = [
    { key: "bank", label: s.bank_name ? `Bank: ${s.bank_name}` : "Bank account", title: s.bank_account_title, number: s.bank_account_number, qr: s.bank_qr_url },
    { key: "easypaisa", label: "EasyPaisa", title: s.easypaisa_title, number: s.easypaisa_number, qr: s.easypaisa_qr_url },
    { key: "jazzcash", label: "JazzCash", title: s.jazzcash_title, number: s.jazzcash_number, qr: s.jazzcash_qr_url },
  ];
  return list.filter((a) => a.number.trim() !== "");
}
