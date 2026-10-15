// LootMall checkout (standalone). This file needs NO other project files.
// It validates the order, then asks the Supabase database function create_order()
// to create it. Prices, stock, delivery charge and COD/advance are decided by the
// database, never by the browser.
import { NextResponse } from "next/server";

type Json = Record<string, unknown>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FRIENDLY = /(stock|no longer available|cart is empty|invalid quantity|advance payment)/i;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** 0312 9585407, +92 312 9585407 and 923129585407 all become 03129585407 */
function localPhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  let p = "";
  if (d.length === 12 && d.startsWith("92")) p = "0" + d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) p = d;
  else if (d.length === 10 && d.startsWith("3")) p = "0" + d;
  return /^03\d{9}$/.test(p) ? p : null;
}

function fail(message: string, status: number, extra?: Json) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

async function callCreateOrder(url: string, key: string, params: Json) {
  const headers: Record<string, string> = { "Content-Type": "application/json", apikey: key };
  // Old-style JWT keys also go in Authorization. New "sb_secret_..." keys use apikey only.
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/rpc/create_order`, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
    cache: "no-store",
  });
  const raw = await res.text();
  let data: unknown = null;
  try {
    data = JSON.parse(raw);
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

export async function POST(req: Request) {
  let body: Json;
  try {
    const parsed: unknown = await req.json();
    if (typeof parsed !== "object" || parsed === null) throw new Error("bad body");
    body = parsed as Json;
  } catch {
    return fail("Invalid request.", 400);
  }

  if (str(body.website)) return fail("Invalid request.", 400); // spam trap

  const fieldErrors: Record<string, string[]> = {};
  const name = str(body.customer_name);
  if (name.length < 2 || name.length > 80) fieldErrors.customer_name = ["Enter your full name"];
  const phone = localPhone(str(body.phone));
  if (!phone) fieldErrors.phone = ["Enter a valid Pakistani mobile number, for example 03XXXXXXXXX"];
  const address = str(body.address);
  if (address.length < 10 || address.length > 300) fieldErrors.address = ["Enter your complete delivery address"];
  const city = str(body.city);
  if (city.length < 2 || city.length > 60) fieldErrors.city = ["Enter your city"];
  const notes = str(body.notes).slice(0, 500);
  const reference = str(body.payment_reference).slice(0, 120);

  if (Object.keys(fieldErrors).length > 0) {
    return fail("Please check the highlighted fields.", 422, { fieldErrors });
  }

  const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
  const items: { product_id: string; quantity: number }[] = [];
  for (const it of rawItems) {
    const o = (typeof it === "object" && it !== null ? it : {}) as Json;
    const id = o.product_id;
    const q = o.quantity;
    if (typeof id !== "string" || !UUID.test(id) || typeof q !== "number" || !Number.isInteger(q) || q < 1 || q > 20) {
      return fail("Your cart is empty or invalid. Please refresh and try again.", 422);
    }
    items.push({ product_id: id, quantity: q });
  }
  if (items.length < 1 || items.length > 50) return fail("Your cart is empty.", 422);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("checkout: Supabase environment variables are missing");
    return fail("We could not place your order. Please try again or contact us on WhatsApp. (Code: CONFIG)", 500);
  }

  try {
    // Newer database (upgrade-v2.sql). Only IDs and quantities are sent, never prices.
    let result = await callCreateOrder(url, key, {
      p_customer_name: name,
      p_phone: phone,
      p_address: address,
      p_city: city,
      p_notes: notes,
      p_items: items,
      p_payment_reference: reference,
    });

    // Older database (v1) has no payment_reference parameter: retry without it.
    const first = (result.data ?? {}) as Json;
    if (!result.ok && first.code === "PGRST202") {
      result = await callCreateOrder(url, key, {
        p_customer_name: name,
        p_phone: phone,
        p_address: address,
        p_city: city,
        p_notes: notes,
        p_items: items,
      });
    }

    if (!result.ok) {
      const err = (result.data ?? {}) as Json;
      const message = typeof err.message === "string" ? err.message : "";
      if (FRIENDLY.test(message)) return fail(message, 409);
      const code = typeof err.code === "string" && err.code ? err.code : `HTTP${result.status}`;
      console.error("create_order failed:", code, message);
      return fail(`We could not place your order. Please try again or contact us on WhatsApp. (Code: ${code})`, 500);
    }

    const row = (Array.isArray(result.data) ? result.data[0] : result.data) as Json | null;
    const orderNumber = row && typeof row.out_order_number === "string" ? row.out_order_number : "";
    if (!orderNumber) return fail("We could not place your order. Please try again. (Code: EMPTY)", 500);

    return NextResponse.json({
      order_number: orderNumber,
      total: row?.out_total ?? null,
      payment_method: row?.out_payment_method ?? null,
    });
  } catch (e) {
    console.error("checkout error:", e);
    return fail("We could not place your order. Please try again or contact us on WhatsApp. (Code: SERVER)", 500);
  }
}

// Cloudflare Pages runs this route on the Edge runtime.
export const runtime = "edge";
export const dynamic = "force-dynamic";
