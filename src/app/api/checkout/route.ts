// LootMall checkout. Uses NO Supabase library and NO other project file, only the
// platform's own fetch, so it cannot crash because of a library on Cloudflare.
// Response format matches the CheckoutForm: { ok, error?, code?, order_number?, total?, payment_method? }
import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type Json = Record<string, unknown>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function fail(error: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error, code }, { status });
}

/** 0312 9585407, +92 312 9585407 and 923129585407 all become 03129585407 */
function localPhone(input: string): string | null {
  const d = input.replace(/\D/g, "");
  let p = "";
  if (d.length === 12 && d.startsWith("92")) p = "0" + d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) p = d;
  else if (d.length === 10 && d.startsWith("3")) p = "0" + d;
  return /^03\d{9}$/.test(p) ? p : null;
}

function readCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  (header ?? "").split(";").forEach((part) => {
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  });
  return out;
}

function decodeBase64Url(s: string): string {
  let b = s.replace(/-/g, "+").replace(/_/g, "/");
  while (b.length % 4) b += "=";
  const bin = atob(b);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** If the visitor is logged in, returns their user id so the order is linked to the account. */
async function currentUserId(req: Request, supabaseUrl: string): Promise<string | null> {
  try {
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!anon) return null;
    const cookies = readCookies(req.headers.get("cookie"));
    const first = Object.keys(cookies).find((k) => /^sb-.+-auth-token(\.0)?$/.test(k));
    if (!first) return null;
    const name = first.replace(/\.0$/, "");
    let raw = cookies[name];
    if (raw === undefined) {
      raw = "";
      for (let i = 0; cookies[`${name}.${i}`] !== undefined; i++) raw += cookies[`${name}.${i}`];
    }
    if (!raw) return null;
    raw = decodeURIComponent(raw);
    const json = raw.startsWith("base64-") ? decodeBase64Url(raw.slice(7)) : raw;
    const session = JSON.parse(json) as { access_token?: string };
    if (!session.access_token) return null;
    const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: { apikey: anon, Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return null;
    const user = (await res.json()) as { id?: string };
    return typeof user.id === "string" && UUID.test(user.id) ? user.id : null;
  } catch {
    return null; // not logged in, or cookie unreadable: treat as guest
  }
}

async function handle(req: Request): Promise<Response> {
  let body: Json;
  try {
    const parsed: unknown = await req.json();
    if (typeof parsed !== "object" || parsed === null) throw new Error("bad body");
    body = parsed as Json;
  } catch {
    return fail("Invalid request.", "BAD_JSON", 400);
  }

  // Hidden spam-trap field: real people never fill it. Pretend it worked.
  if (str(body.website)) {
    return NextResponse.json({ ok: true, order_number: "LM-000000-000000", total: 0, payment_method: "cod" });
  }

  const name = str(body.customer_name);
  if (name.length < 2 || name.length > 100) return fail("Please enter your name", "VALIDATION", 400);
  const phone = localPhone(str(body.phone));
  if (!phone) return fail("Please enter a valid mobile number like 03001234567.", "PHONE", 400);
  const address = str(body.address);
  if (address.length < 5 || address.length > 300) return fail("Please enter your full address", "VALIDATION", 400);
  const city = str(body.city);
  if (city.length < 2 || city.length > 60) return fail("Please enter your city", "VALIDATION", 400);
  const notes = str(body.notes).slice(0, 500);
  const reference = str(body.payment_reference).slice(0, 100);

  const rawItems: unknown[] = Array.isArray(body.items) ? body.items : [];
  const items: { product_id: string; quantity: number }[] = [];
  for (const it of rawItems) {
    const o = (typeof it === "object" && it !== null ? it : {}) as Json;
    const id = o.product_id;
    const q = o.quantity;
    if (typeof id !== "string" || !UUID.test(id) || typeof q !== "number" || !Number.isInteger(q) || q < 1 || q > 20) {
      return fail("Your cart is empty or invalid. Please refresh and try again.", "ITEMS", 400);
    }
    items.push({ product_id: id, quantity: q });
  }
  if (items.length < 1 || items.length > 50) return fail("Your cart is empty", "ITEMS", 400);

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!rawUrl || !key) {
    return fail("Orders are temporarily unavailable. Please contact us on WhatsApp.", "CONFIG", 500);
  }
  const url = rawUrl.replace(/\/+$/, "");

  const customerId = await currentUserId(req, url);

  const headers: Record<string, string> = { "Content-Type": "application/json", apikey: key };
  // Old-style JWT keys also go in Authorization. New "sb_secret_..." keys use apikey only.
  if (!key.startsWith("sb_")) headers.Authorization = `Bearer ${key}`;

  const res = await fetch(`${url}/rest/v1/rpc/create_order`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      p_customer_name: name,
      p_phone: phone,
      p_address: address,
      p_city: city,
      p_notes: notes,
      p_items: items,
      p_customer_id: customerId,
      p_payment_reference: reference,
    }),
  });

  const text = await res.text();
  let data: unknown = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = (data !== null && typeof data === "object" && !Array.isArray(data) ? data : {}) as Json;
    const code = typeof err.code === "string" && err.code ? err.code : `HTTP${res.status}`;
    const message = typeof err.message === "string" ? err.message : "";
    // Rules raised by create_order() itself (stock, advance payment...) use code P0001.
    if (code === "P0001" && message) return fail(message, "RULE", 400);
    if (code === "PGRST202" || code === "42883") return fail("The store database is not updated yet.", code, 500);
    if (res.status === 401 || res.status === 403) {
      return fail("Orders are temporarily unavailable. Please contact us on WhatsApp.", `KEY${res.status}`, 500);
    }
    console.error("create_order failed:", code, message);
    return fail("We could not place your order right now. Please try again.", code, 500);
  }

  const row = (Array.isArray(data) ? data[0] : data) as Json | null;
  const orderNumber = row && typeof row.out_order_number === "string" ? row.out_order_number : "";
  if (!orderNumber) return fail("We could not place your order right now. Please try again.", "EMPTY", 500);

  return NextResponse.json({
    ok: true,
    order_number: orderNumber,
    total: typeof row?.out_total === "number" ? row.out_total : 0,
    payment_method: typeof row?.out_payment_method === "string" ? row.out_payment_method : "cod",
  });
}

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (e) {
    console.error("checkout crashed:", e);
    const name = e instanceof Error ? e.name : "UNKNOWN";
    return fail("We could not place your order right now. Please try again or contact us on WhatsApp.", `EXC-${name}`, 500);
  }
}

// Open /api/checkout in a browser to check this route runs. Shows only true/false, never values.
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "lootmall-checkout",
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
