import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function sources(): Record<string, unknown>[] {
  const list: Record<string, unknown>[] = [process.env as Record<string, unknown>];
  try {
    list.push(getCloudflareContext().env as unknown as Record<string, unknown>);
  } catch {
    // not running on Cloudflare (for example during a local build)
  }
  return list;
}

/**
 * Reads a server setting, ignoring upper/lower case in the NAME (so SUPABASE_SERVICE_ROLE_KEY
 * and supabase_service_role_key both work) and trimming stray spaces from the VALUE.
 * It looks in process.env and in the Cloudflare Worker's own variables.
 */
export function readEnv(name: string): string | undefined {
  const wanted = name.toLowerCase();
  for (const src of sources()) {
    const exact = src[name];
    if (typeof exact === "string" && exact.trim()) return exact.trim();
    for (const key of Object.keys(src)) {
      if (key.toLowerCase() === wanted) {
        const v = src[key];
        if (typeof v === "string" && v.trim()) return v.trim();
      }
    }
  }
  return undefined;
}

/** The Supabase secret key (never the public anon key). Accepts the usual names people give it. */
export function serviceRoleKey(): string | undefined {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY") ?? readEnv("SUPABASE_SECRET_KEY") ?? readEnv("SUPABASE_SERVICE_KEY");
}

/** Names (never values) of the settings this Worker can see that look Supabase related. */
export function visibleSettingNames(): string[] {
  const names = new Set<string>();
  for (const src of sources()) Object.keys(src).forEach((k) => names.add(k));
  return [...names].filter((n) => /supabase|service|secret|site_url/i.test(n)).sort();
}
