"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/format";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/types";
import type { FormState } from "@/lib/admin-types";

function text(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

function intOrNull(fd: FormData, key: string): number | null {
  const raw = text(fd, key);
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : NaN;
}

function refresh() {
  revalidatePath("/", "layout");
}

function friendly(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "That name, slug or SKU is already used. Please change it.";
  if (error.code === "23514") return "One of the numbers is not allowed (the sale price must be lower than the regular price).";
  return error.message;
}

// ---------------------------------------------------------------- login / logout

export async function adminLoginAction(fd: FormData): Promise<FormState> {
  const email = text(fd, "email");
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: "Wrong email or password." };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
  if (!profile || profile.role !== "admin") {
    await supabase.auth.signOut();
    return { error: "This account is not an administrator." };
  }
  redirect("/admin");
}

export async function adminLogoutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------- orders

export async function updateOrderStatusAction(orderId: string, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const status = text(fd, "status");
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return { error: "Unknown status." };
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };
  refresh();
  return { success: "Order status updated." };
}

export async function updatePaymentStatusAction(orderId: string, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const paymentStatus = text(fd, "payment_status");
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) return { error: "Unknown payment status." };
  const { error } = await supabase.from("orders").update({ payment_status: paymentStatus }).eq("id", orderId);
  if (error) return { error: error.message };
  refresh();
  return { success: "Payment status updated." };
}

// ---------------------------------------------------------------- products

export async function saveProductAction(id: string | null, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();

  const name = text(fd, "name");
  if (name.length < 2) return { error: "Please enter the product name." };
  const slug = slugify(text(fd, "slug") || name);
  if (!slug) return { error: "Please enter a valid slug (letters and numbers)." };

  const regular = intOrNull(fd, "regular_price");
  const sale = intOrNull(fd, "sale_price");
  const stock = intOrNull(fd, "stock");
  if (regular === null || Number.isNaN(regular) || regular < 0) return { error: "Enter the regular price." };
  if (sale !== null && (Number.isNaN(sale) || sale < 0)) return { error: "The sale price is not valid." };
  if (sale !== null && sale >= regular) return { error: "The sale price must be lower than the regular price." };
  if (stock === null || Number.isNaN(stock) || stock < 0) return { error: "Enter the stock quantity (0 or more)." };

  let images: string[] = [];
  try {
    const parsed = JSON.parse(text(fd, "images") || "[]");
    if (Array.isArray(parsed)) images = parsed.filter((x): x is string => typeof x === "string" && x.length > 0);
  } catch {
    images = [];
  }

  const row = {
    name,
    slug,
    sku: text(fd, "sku") || null,
    category_id: text(fd, "category_id") || null,
    short_description: text(fd, "short_description") || null,
    description: text(fd, "description") || null,
    regular_price: regular,
    sale_price: sale,
    stock,
    is_active: fd.get("is_active") === "on",
    is_featured: fd.get("is_featured") === "on",
    images,
    video_url: text(fd, "video_url") || null,
  };

  const { error } = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);
  if (error) return { error: friendly(error) };

  refresh();
  redirect("/admin/products");
}

export async function deleteProductAction(id: string): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: friendly(error) };
  refresh();
  return { success: "Product deleted." };
}

// ---------------------------------------------------------------- categories

export async function saveCategoryAction(id: string | null, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const name = text(fd, "name");
  if (name.length < 2) return { error: "Please enter the category name." };
  const slug = slugify(text(fd, "slug") || name);
  if (!slug) return { error: "Please enter a valid slug." };
  const sort = intOrNull(fd, "sort_order");

  const row = {
    name,
    slug,
    image_url: text(fd, "image_url") || null,
    sort_order: sort === null || Number.isNaN(sort) ? 0 : sort,
    is_active: fd.get("is_active") === "on",
  };
  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);
  if (error) return { error: friendly(error) };
  refresh();
  return { success: id ? "Category saved." : "Category added." };
}

export async function deleteCategoryAction(id: string): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: friendly(error) };
  refresh();
  return { success: "Category deleted." };
}

// ---------------------------------------------------------------- banners

export async function saveBannerAction(id: string | null, fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const title = text(fd, "title");
  if (title.length < 2) return { error: "Please enter the banner title." };
  const sort = intOrNull(fd, "sort_order");
  const placement = text(fd, "placement") === "promo" ? "promo" : "hero";

  const row = {
    title,
    subtitle: text(fd, "subtitle") || null,
    image_url: text(fd, "image_url") || null,
    link_url: text(fd, "link_url") || null,
    placement,
    sort_order: sort === null || Number.isNaN(sort) ? 0 : sort,
    is_active: fd.get("is_active") === "on",
  };
  const { error } = id
    ? await supabase.from("banners").update(row).eq("id", id)
    : await supabase.from("banners").insert(row);
  if (error) return { error: friendly(error) };
  refresh();
  return { success: id ? "Banner saved." : "Banner added." };
}

export async function deleteBannerAction(id: string): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) return { error: friendly(error) };
  refresh();
  return { success: "Banner deleted." };
}

// ---------------------------------------------------------------- settings

export async function saveSettingsAction(fd: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const delivery = intOrNull(fd, "delivery_charge");
  if (delivery === null || Number.isNaN(delivery) || delivery < 0) return { error: "Enter the delivery charge." };

  const row = {
    store_name: text(fd, "store_name") || "LootMall",
    tagline: text(fd, "tagline"),
    delivery_charge: delivery,
    contact_phone: text(fd, "contact_phone"),
    contact_email: text(fd, "contact_email"),
    cod_cities: text(fd, "cod_cities"),
    bank_name: text(fd, "bank_name"),
    bank_account_title: text(fd, "bank_account_title"),
    bank_account_number: text(fd, "bank_account_number"),
    bank_qr_url: text(fd, "bank_qr_url"),
    easypaisa_title: text(fd, "easypaisa_title"),
    easypaisa_number: text(fd, "easypaisa_number"),
    easypaisa_qr_url: text(fd, "easypaisa_qr_url"),
    jazzcash_title: text(fd, "jazzcash_title"),
    jazzcash_number: text(fd, "jazzcash_number"),
    jazzcash_qr_url: text(fd, "jazzcash_qr_url"),
  };
  const { error } = await supabase.from("settings").update(row).eq("id", 1);
  if (error) return { error: error.message };
  refresh();
  return { success: "Settings saved." };
}

// ---------------------------------------------------------------- customers

export async function setCustomerPasswordAction(customerId: string, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const password = String(fd.get("password") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  try {
    const service = createServiceClient();
    const { error } = await service.auth.admin.updateUserById(customerId, { password });
    if (error) return { error: error.message };
  } catch {
    return { error: "SUPABASE_SERVICE_ROLE_KEY is missing on the server." };
  }
  return { success: "New password set. Tell the customer." };
}
