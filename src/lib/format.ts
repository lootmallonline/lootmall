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
