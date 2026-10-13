export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Removes characters that could change the meaning of a database search filter. */
export function sanitizeSearch(input: string): string {
  return input.replace(/[^\p{L}\p{N}\s\-_.]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
