export function formatPKR(amount: number): string {
  return `Rs. ${Math.round(amount).toLocaleString("en-PK")}`;
}

type Priced = { regular_price: number; sale_price: number | null };

export function effectivePrice(p: Priced): number {
  return p.sale_price ?? p.regular_price;
}

export function discountPercent(p: Priced): number {
  if (p.sale_price === null || p.sale_price >= p.regular_price || p.regular_price <= 0) return 0;
  return Math.round(((p.regular_price - p.sale_price) / p.regular_price) * 100);
}

/** Turns 0312 9585407 into 923129585407 as WhatsApp links require. */
export function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  return digits;
}

export function whatsappUrl(phone: string, message?: string): string {
  const base = `https://wa.me/${whatsappNumber(phone)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Turns any common Pakistani mobile format into 03XXXXXXXXX.
 * Returns null when the number is not a valid mobile number.
 */
export function toLocalPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  let local = "";
  if (digits.length === 12 && digits.startsWith("92")) local = "0" + digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) local = digits;
  else if (digits.length === 10 && digits.startsWith("3")) local = "0" + digits;
  return /^03\d{9}$/.test(local) ? local : null;
}
