import { createPublicClient } from "@/lib/supabase/public";
import type { Banner, Category, Product, Settings } from "@/lib/types";

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  store_name: "LootMall",
  tagline: "Shop Smart, Save Big Every Day",
  delivery_charge: 299,
  contact_phone: "03129585407",
  contact_email: "lootmall.online@gmail.com",
  cod_cities: "Rawalpindi, Islamabad",
  bank_name: "",
  bank_account_title: "",
  bank_account_number: "",
  bank_qr_url: "",
  easypaisa_title: "",
  easypaisa_number: "",
  easypaisa_qr_url: "",
  jazzcash_title: "",
  jazzcash_number: "",
  jazzcash_qr_url: "",
};

export async function getSettings(): Promise<Settings> {
  try {
    const sb = createPublicClient();
    if (!sb) return DEFAULT_SETTINGS;
    const { data } = await sb.from("settings").select("*").eq("id", 1).maybeSingle();
    return { ...DEFAULT_SETTINGS, ...(data ?? {}) } as Settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const sb = createPublicClient();
    if (!sb) return [];
    const { data } = await sb
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    return (data ?? []) as Category[];
  } catch {
    return [];
  }
}

export async function getBanners(placement: "hero" | "promo"): Promise<Banner[]> {
  try {
    const sb = createPublicClient();
    if (!sb) return [];
    const { data } = await sb
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .eq("placement", placement)
      .order("sort_order", { ascending: true });
    return (data ?? []) as Banner[];
  } catch {
    return [];
  }
}

export async function getProducts(opts: {
  categorySlug?: string;
  q?: string;
  featured?: boolean;
  limit?: number;
} = {}): Promise<Product[]> {
  try {
    const sb = createPublicClient();
    if (!sb) return [];
    let query = sb.from("products").select("*").eq("is_active", true);

    if (opts.categorySlug) {
      const { data: cat } = await sb.from("categories").select("id").eq("slug", opts.categorySlug).maybeSingle();
      if (!cat) return [];
      query = query.eq("category_id", cat.id);
    }
    if (opts.featured) query = query.eq("is_featured", true);
    if (opts.q) {
      const safe = opts.q.replace(/[%,()*\\]/g, " ").trim();
      if (safe) query = query.or(`name.ilike.%${safe}%,short_description.ilike.%${safe}%`);
    }
    query = query.order("created_at", { ascending: false }).limit(opts.limit ?? 48);
    const { data } = await query;
    return (data ?? []) as Product[];
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const sb = createPublicClient();
    if (!sb) return null;
    const { data } = await sb.from("products").select("*").eq("slug", slug).eq("is_active", true).maybeSingle();
    return (data as Product | null) ?? null;
  } catch {
    return null;
  }
}

export function effectivePrice(p: Pick<Product, "regular_price" | "sale_price">): number {
  return p.sale_price ?? p.regular_price;
}
