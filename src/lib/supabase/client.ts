import { createBrowserClient } from "@supabase/ssr";

/** Browser client (admin login and uploads). Anon key only; admin rights come from RLS. */
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
