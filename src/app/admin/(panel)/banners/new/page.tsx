import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { BannerForm } from "@/components/admin/BannerForm";

export const metadata: Metadata = { title: "Add banner" };

export default async function NewBanner() {
  await requireAdmin();
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Add banner</h1>
      <BannerForm />
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
