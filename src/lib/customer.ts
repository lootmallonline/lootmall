/** Customers log in with a mobile number. It is mapped to a private, never-mailed address. */
export function phoneToAuthEmail(localPhone: string): string {
  return `${localPhone}@customers.lootmall.online`;
}

export function looksLikeEmail(value: string): boolean {
  return /^\S+@\S+\.\S+$/.test((value || "").trim());
}
