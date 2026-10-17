import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getCategories, getProducts } from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts({ limit: 500 }), getCategories()]);
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/products` },
    ...categories.map((c) => ({ url: `${SITE_URL}/category/${c.slug}` })),
    ...products.map((p) => ({ url: `${SITE_URL}/product/${p.slug}` })),
  ];
}
