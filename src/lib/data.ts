import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { sanitizeSearch } from "@/lib/utils";
import type { Banner, Category, Product, Settings } from "@/lib/types";

export const PAGE_SIZE = 24;

export const DEFAULT_SETTINGS: Settings = {
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

export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const supabase = createPublicClient();
    if (!supabase) return DEFAULT_SETTINGS;
    const { data } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
    return data ? { ...DEFAULT_SETTINGS, ...data } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    return (data ?? []) as Category[];
  } catch {
    return [];
  }
});

export async function getBanners(placement: "hero" | "promo"): Promise<Banner[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];
    const { data } = await supabase
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

type ProductQuery = {
  categoryId?: string;
  q?: string;
  featured?: boolean;
  page?: number;
  pageSize?: number;
};

export async function getProducts(opts: ProductQuery = {}): Promise<{ products: Product[]; total: number }> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return { products: [], total: 0 };
    const pageSize = opts.pageSize ?? PAGE_SIZE;
    const page = Math.max(1, opts.page ?? 1);
    let query = supabase.from("products").select("*", { count: "exact" }).eq("is_active", true);
    if (opts.categoryId) query = query.eq("category_id", opts.categoryId);
    if (opts.featured) query = query.eq("is_featured", true);
    const q = opts.q ? sanitizeSearch(opts.q) : "";
    if (q) query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
    const from = (page - 1) * pageSize;
    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    return { products: (data ?? []) as Product[], total: count ?? 0 };
  } catch {
    return { products: [], total: 0 };
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return null;
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    return (data as Product | null) ?? null;
  } catch {
    return null;
  }
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (!product.category_id) return [];
  try {
    const supabase = createPublicClient();
    if (!supabase) return [];
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(limit);
    return (data ?? []) as Product[];
  } catch {
    return [];
  }
}
