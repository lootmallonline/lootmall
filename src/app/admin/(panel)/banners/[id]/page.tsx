import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { BannerForm } from "@/components/admin/BannerForm";
import type { Banner } from "@/lib/types";

export const metadata: Metadata = { title: "Edit banner" };
type Props = { params: Promise<{ id: string }> };

export default async function EditBanner({ params }: Props) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("banners").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Edit banner</h1>
      <BannerForm banner={data as Banner} />
    </div>
  );
}
