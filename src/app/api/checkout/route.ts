import { NextResponse } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { createServiceClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const FRIENDLY = /(stock|no longer available|cart is empty|invalid quantity)/i;

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
    const supabase = createServiceClient();
    // The database function reads prices, stock and the delivery charge itself.
    const { data, error } = await supabase.rpc("create_order", {
      p_customer_name: d.customer_name,
      p_phone: d.phone,
      p_address: d.address,
      p_city: d.city,
      p_notes: d.notes,
      p_items: d.items,
    });

    if (error) {
      if (FRIENDLY.test(error.message)) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      console.error("create_order failed:", error.message);
      return NextResponse.json(
        { error: "We could not place your order. Please try again or contact us on WhatsApp." },
        { status: 500 }
      );
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row?.out_order_number) {
      return NextResponse.json({ error: "We could not place your order. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ order_number: row.out_order_number as string, total: row.out_total as number });
  } catch (e) {
    console.error("checkout error:", e);
    return NextResponse.json(
      { error: "We could not place your order. Please try again or contact us on WhatsApp." },
      { status: 500 }
    );
  }
}
