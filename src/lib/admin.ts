import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

/** Call at the top of every admin page and every admin action. */
export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin") redirect("/admin/login?error=forbidden");

  return { supabase, user };
}
