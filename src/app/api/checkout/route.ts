import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient, ConfigError } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { isValidLocalPhone, toLocalPhone } from "@/lib/format";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const schema = z.object({
  customer_name: z.string().trim().min(2, "Please enter your name").max(100),
  phone: z.string().trim().min(10, "Please enter a valid mobile number").max(25),
  address: z.string().trim().min(5, "Please enter your full address").max(300),
  city: z.string().trim().min(2, "Please enter your city").max(60),
  notes: z.string().trim().max(500).optional().default(""),
  payment_reference: z.string().trim().max(100).optional().default(""),
  website: z.string().optional().default(""),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "Your cart is empty")
    .max(50),
});

function fail(error: string, code: string, status: number) {
  return NextResponse.json({ ok: false, error, code }, { status });
}

async function handle(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", "BAD_JSON", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Please check the form and try again.", "VALIDATION", 400);
  }
  const input = parsed.data;

  // Hidden spam-trap field: real people never fill it. Pretend it worked.
  if (input.website) {
    return NextResponse.json({ ok: true, order_number: "LM-000000-000000", total: 0, payment_method: "cod" });
  }

  const phone = toLocalPhone(input.phone);
  if (!isValidLocalPhone(phone)) {
    return fail("Please enter a valid mobile number like 03001234567.", "PHONE", 400);
  }

  let service;
  try {
    service = createServiceClient();
  } catch (e) {
    if (e instanceof ConfigError) {
      return fail("Orders are temporarily unavailable. Please contact us on WhatsApp.", "CONFIG", 500);
    }
    return fail("Orders are temporarily unavailable.", "INIT", 500);
  }

  // If the visitor is logged in, link the order to their account.
  let customerId: string | null = null;
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.auth.getUser();
    customerId = data.user?.id ?? null;
  } catch {
    customerId = null;
  }

  const { data, error } = await service.rpc("create_order", {
    p_customer_name: input.customer_name,
    p_phone: phone,
    p_address: input.address,
    p_city: input.city,
    p_notes: input.notes,
    p_items: input.items,
    p_customer_id: customerId,
    p_payment_reference: input.payment_reference,
  });

  if (error) {
    // Rules we raise ourselves in create_order() (stock, advance payment...) use code P0001.
    if (error.code === "P0001") {
      return fail(error.message, "RULE", 400);
    }
    if (error.code === "PGRST202" || error.code === "42883") {
      return fail("The store database is not updated yet.", error.code, 500);
    }
    return fail("We could not place your order right now. Please try again.", error.code || "DB", 500);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.out_order_number) {
    return fail("We could not place your order right now. Please try again.", "EMPTY", 500);
  }

  return NextResponse.json({
    ok: true,
    order_number: row.out_order_number as string,
    total: row.out_total as number,
    payment_method: (row.out_payment_method as string) ?? "cod",
  });
}

// Same route, but it can never crash silently: any unexpected error comes back as
// readable JSON with a short code, and is written to the Cloudflare logs.
export async function POST(request: Request) {
  try {
    return await handle(request);
  } catch (e) {
    console.error("checkout crashed:", e);
    const name = e instanceof Error ? e.name : "UNKNOWN";
    return fail("We could not place your order right now. Please try again or contact us on WhatsApp.", `EXC-${name}`, 500);
  }
}

// Open /api/checkout in a browser to check that this route runs.
// It shows only true/false for the two server settings, never their values.
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
