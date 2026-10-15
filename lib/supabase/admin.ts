import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getSupabaseServiceEnvironment() {
  const processEnvironment = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  const needsCloudflareBindings = !processEnvironment.url || !processEnvironment.key;
  const cloudflareEnvironment =
    needsCloudflareBindings &&
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NODE_ENV === "production"
      ? getCloudflareContext().env
      : undefined;

  return {
    url: processEnvironment.url ?? cloudflareEnvironment?.NEXT_PUBLIC_SUPABASE_URL,
    key: processEnvironment.key ?? cloudflareEnvironment?.SUPABASE_SERVICE_ROLE_KEY,
  };
}

/**
 * Service-role client. It bypasses Row Level Security and is restricted to
 * server code; "server-only" prevents importing it from browser code.
 */
export function createServiceClient(url?: string, key?: string) {
  const environment = url && key ? { url, key } : getSupabaseServiceEnvironment();
  url = environment.url;
  key = environment.key;
  if (!url || !key) throw new Error("Supabase server environment variables are missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
