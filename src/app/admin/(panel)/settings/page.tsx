import { requireAdmin } from "@/lib/auth";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { DEFAULT_SETTINGS } from "@/lib/data";
import type { Settings } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) } as Settings;
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
