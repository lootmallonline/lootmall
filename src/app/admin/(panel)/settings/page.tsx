import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { DEFAULT_SETTINGS } from "@/lib/data";
import { SettingsForm } from "@/components/admin/SettingsForm";
import type { Settings } from "@/lib/types";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettings() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
  const settings = { ...DEFAULT_SETTINGS, ...(data ?? {}) } as Settings;
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Store settings</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
