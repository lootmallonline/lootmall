import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Anonymous read-only client for public storefront data. Returns null when env vars are missing. */
export function createPublicClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
