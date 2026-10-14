import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { createServiceClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";

// Customer-facing messages thrown by the create_order database function.
const FRIENDLY = /(stock|no longer available|cart is empty|invalid quantity|advance payment)/i;

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Spam trap: bots fill the hidden "website" field, people never see it.
  if (typeof body === "object" && body !== null && (body as { website?: unknown }).website) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }
  const d = parsed.data;

  try {
    // If the customer is logged in, the order is linked to their account.
    let customerId: string | null = null;
    try {
      const userClient = await createServerSupabase();
      const {
        data: { user },
      } = await userClient.auth.getUser();
      customerId = user?.id ?? null;
    } catch {
      customerId = null;
    }

    const supabase = createServiceClient();
    // The database function decides prices, stock, delivery charge and COD/advance itself.
    const { data, error } = await supabase.rpc("create_order", {
      p_customer_name: d.customer_name,
      p_phone: d.phone,
      p_address: d.address,
      p_city: d.city,
      p_notes: d.notes,
      p_items: d.items,
      p_customer_id: customerId,
      p_payment_reference: d.payment_reference,
    });

    if (error) {
      if (FRIENDLY.test(error.message)) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      const code = error.code || (/fetch/i.test(error.message) ? "NETWORK" : "DB");
      console.error("create_order failed:", code, error.message);
      return NextResponse.json(
        { error: `We could not place your order. Please try again or contact us on WhatsApp. (Code: ${code})` },
        { status: 500 }
      );
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.out_order_number) {
      return NextResponse.json({ error: "We could not place your order. Please try again. (Code: EMPTY)" }, { status: 500 });
    }
    return NextResponse.json({
      order_number: row.out_order_number as string,
      total: row.out_total as number,
      payment_method: row.out_payment_method as string,
    });
  } catch (e) {
    console.error("checkout error:", e);
    const code = e instanceof Error && /environment variables/i.test(e.message) ? "CONFIG" : "SERVER";
    return NextResponse.json(
      { error: `We could not place your order. Please try again or contact us on WhatsApp. (Code: ${code})` },
      { status: 500 }
    );
  }
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
export const dynamic = "force-dynamic";
