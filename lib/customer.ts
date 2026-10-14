/**
 * Customers log in with their mobile number. Behind the scenes each mobile number
 * is stored as a private login address on lootmall.online. Nothing is ever emailed
 * to it, so customers do not need an email account at all.
 */
export function phoneToAuthEmail(localPhone: string): string {
  return `${localPhone.replace(/\D/g, "")}@customers.lootmall.online`;
}
