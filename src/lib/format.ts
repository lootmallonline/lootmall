export function formatPrice(n: number | null | undefined): string {
  return "Rs. " + Math.round(Number(n ?? 0)).toLocaleString("en-US");
}

/** Turns +92 300 1234567, 0092-300-1234567, 3001234567 ... into 03001234567. */
export function toLocalPhone(input: string): string {
  let d = (input || "").replace(/\D/g, "");
  if (d.startsWith("0092")) d = d.slice(4);
  else if (d.startsWith("92")) d = d.slice(2);
  if (d.length === 10 && d.startsWith("3")) d = "0" + d;
  return d;
}

export function isValidLocalPhone(phone: string): boolean {
  return /^03\d{9}$/.test(phone);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      timeZone: "Asia/Karachi",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Same rule as the database: COD when the city contains any listed COD city name. */
export function isCodCity(city: string, codCities: string): boolean {
  const c = (city || "").toLowerCase();
  if (!c.trim()) return false;
  return (codCities || "")
    .toLowerCase()
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .some((x) => c.includes(x));
}
