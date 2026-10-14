import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client. It bypasses Row Level Security, so it is used ONLY in
 * server code (the checkout API). "server-only" makes the build fail if this
 * file is ever imported by browser code.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server environment variables are missing");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
