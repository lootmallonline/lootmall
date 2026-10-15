import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { createPublicClient } from "@/lib/supabase/public";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = ["", "/products", "/contact", "/privacy-policy", "/shipping-policy", "/return-policy"].map(
    (p) => ({ url: `${SITE_URL}${p}` })
  );
  try {
    const supabase = createPublicClient();
    if (!supabase) return pages;
    const [{ data: products }, { data: categories }] = await Promise.all([
      supabase.from("products").select("slug,updated_at").eq("is_active", true).limit(5000),
      supabase.from("categories").select("slug").eq("is_active", true),
    ]);
    return [
      ...pages,
      ...(categories ?? []).map((c) => ({ url: `${SITE_URL}/category/${c.slug}` })),
      ...(products ?? []).map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, lastModified: p.updated_at as string })),
    ];
  } catch {
    return pages;
  }
}

export const dynamic = "force-dynamic";
