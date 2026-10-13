"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/types";
import type { FormState } from "@/lib/admin-types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const text = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const checked = (fd: FormData, key: string) => fd.get(key) === "on";
/** "" -> null, whole number -> number, anything else -> NaN */
const intOrNull = (v: string): number | null => {
  if (v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
};
const refreshStore = () => revalidatePath("/", "layout");

// ---------------------------------------------------------------- auth
export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email");
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Wrong email or password." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  if (profile?.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "This account is not an administrator." };
  }
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ------------------------------------------------------------ products
export async function saveProductAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const id = text(fd, "id");
  if (id && !UUID.test(id)) return { error: "Invalid product." };

  const name = text(fd, "name");
  if (name.length < 2) return { error: "Enter the product name." };

  const regular = intOrNull(text(fd, "regular_price"));
  if (regular === null || Number.isNaN(regular) || regular < 0) {
    return { error: "Enter a valid regular price in whole rupees." };
  }
  const sale = intOrNull(text(fd, "sale_price"));
  if (sale !== null && (Number.isNaN(sale) || sale < 0 || sale >= regular)) {
    return { error: "Sale price must be a whole number lower than the regular price." };
  }
  const stock = intOrNull(text(fd, "stock"));
  if (stock === null || Number.isNaN(stock) || stock < 0) return { error: "Enter the stock quantity (0 or more)." };

  let images: string[] = [];
  try {
    const parsed: unknown = JSON.parse(text(fd, "images") || "[]");
    if (Array.isArray(parsed)) {
      images = parsed.filter((u): u is string => typeof u === "string" && u.startsWith("https://")).slice(0, 10);
    }
  } catch {
    return { error: "Images could not be read. Please upload them again." };
  }

  const video = text(fd, "video_url");
  if (video && !video.startsWith("https://")) return { error: "Video link is not valid." };

  const categoryId = text(fd, "category_id");
  if (categoryId && !UUID.test(categoryId)) return { error: "Invalid category." };

  const row = {
    name,
    slug: slugify(text(fd, "slug") || name) || `product-${Date.now()}`,
    sku: text(fd, "sku") || null,
    category_id: categoryId || null,
    short_description: text(fd, "short_description") || null,
    description: text(fd, "description") || null,
    regular_price: regular,
    sale_price: sale,
    stock,
    is_active: checked(fd, "is_active"),
    is_featured: checked(fd, "is_featured"),
    images,
    video_url: video || null,
  };

  const { error } = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);

  if (error) {
    if (error.code === "23505") return { error: "Another product already uses this URL name (slug) or SKU." };
    return { error: `Could not save the product: ${error.message}` };
  }
  refreshStore();
  redirect("/admin/products");
}

export async function deleteProductAction(id: string, _fd: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return;
  await supabase.from("products").delete().eq("id", id);
  refreshStore();
}

// ---------------------------------------------------------- categories
export async function saveCategoryAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  const name = text(fd, "name");
  if (name.length < 2) return { error: "Enter the category name." };
  const sort = intOrNull(text(fd, "sort_order") || "0");
  if (sort === null || Number.isNaN(sort)) return { error: "Sort order must be a whole number." };
  const isActive = checked(fd, "is_active");

  let error;
  if (id) {
    if (!UUID.test(id)) return { error: "Invalid category." };
    ({ error } = await supabase.from("categories").update({ name, sort_order: sort, is_active: isActive }).eq("id", id));
  } else {
    ({ error } = await supabase
      .from("categories")
      .insert({ name, slug: slugify(name) || `category-${Date.now()}`, sort_order: sort, is_active: isActive }));
  }
  if (error) {
    if (error.code === "23505") return { error: "A category with this name already exists." };
    return { error: `Could not save: ${error.message}` };
  }
  refreshStore();
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string, _fd: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return;
  await supabase.from("categories").delete().eq("id", id);
  refreshStore();
  revalidatePath("/admin/categories");
}

// ------------------------------------------------------------- banners
export async function saveBannerAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const id = text(fd, "id");
  if (id && !UUID.test(id)) return { error: "Invalid banner." };

  const title = text(fd, "title");
  if (title.length < 2) return { error: "Enter a banner title." };
  const link = text(fd, "link_url");
  if (link && !(link.startsWith("/") || link.startsWith("https://"))) {
    return { error: "Link must start with / (page on your store) or https://" };
  }
  const image = text(fd, "image_url");
  if (image && !image.startsWith("https://")) return { error: "Image link is not valid." };
  const placement = text(fd, "placement") === "promo" ? "promo" : "hero";
  const sort = intOrNull(text(fd, "sort_order") || "0");
  if (sort === null || Number.isNaN(sort)) return { error: "Sort order must be a whole number." };

  const row = {
    title,
    subtitle: text(fd, "subtitle") || null,
    image_url: image || null,
    link_url: link || null,
    placement,
    sort_order: sort,
    is_active: checked(fd, "is_active"),
  };
  const { error } = id
    ? await supabase.from("banners").update(row).eq("id", id)
    : await supabase.from("banners").insert(row);
  if (error) return { error: `Could not save the banner: ${error.message}` };

  refreshStore();
  redirect("/admin/banners");
}

export async function deleteBannerAction(id: string, _fd: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  if (!UUID.test(id)) return;
  await supabase.from("banners").delete().eq("id", id);
  refreshStore();
  revalidatePath("/admin/banners");
}

// -------------------------------------------------------------- orders
export async function updateOrderStatusAction(id: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const status = text(fd, "status");
  if (!UUID.test(id) || !(ORDER_STATUSES as readonly string[]).includes(status)) {
    return { error: "Invalid status." };
  }
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) return { error: `Could not update: ${error.message}` };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
  return { ok: true };
}

// ------------------------------------------------------------ settings
export async function saveSettingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const delivery = intOrNull(text(fd, "delivery_charge"));
  if (delivery === null || Number.isNaN(delivery) || delivery < 0) {
    return { error: "Delivery charge must be a whole number of rupees (0 or more)." };
  }
  const phone = text(fd, "contact_phone");
  if (!/^[0-9+\s-]{10,16}$/.test(phone)) return { error: "Enter a valid phone number." };
  const email = text(fd, "contact_email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  const storeName = text(fd, "store_name");
  const tagline = text(fd, "tagline");
  if (!storeName || !tagline) return { error: "Store name and tagline cannot be empty." };

  const { error } = await supabase
    .from("settings")
    .update({ store_name: storeName, tagline, delivery_charge: delivery, contact_phone: phone, contact_email: email })
    .eq("id", 1);
  if (error) return { error: `Could not save: ${error.message}` };
  refreshStore();
  return { ok: true };
}
