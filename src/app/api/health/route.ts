import { NextResponse } from "next/server";
import { readEnv, serviceRoleKey, visibleSettingNames } from "@/lib/env";

// Open /api/health in a browser to check which app is answering and whether the
// Supabase settings reach the server. It shows true/false and setting NAMES, never values.
export async function GET() {
  return NextResponse.json(
    {
      app: "lootmall-next",
      version: 3,
      supabase_url: !!readEnv("NEXT_PUBLIC_SUPABASE_URL"),
      anon_key: !!readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      service_role_key: !!serviceRoleKey(),
      names_the_server_can_see: visibleSettingNames(),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export const dynamic = "force-dynamic";
