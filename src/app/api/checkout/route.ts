import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cloudflare / Vercel Edge Compatible Supabase Service Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, address, city, notes, items, spam_trap } = body;

    // Spam Trap Check
    if (spam_trap) {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    // Input Validation
    if (!name || !phone || !address || !city || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // City-based Payment Logic
    const normalizedCity = city.trim().toLowerCase();
    const isCODAllowed = normalizedCity === "rawalpindi" || normalizedCity === "islamabad";
    const paymentMethod = isCODAllowed ? "COD" : "Advance Payment";

    // Call Supabase RPC create_order for secure atomic order creation
    const { data: orderData, error: orderError } = await supabase.rpc("create_order", {
      p_customer_name: name,
      p_customer_phone: phone,
      p_customer_address: address,
      p_customer_city: city,
      p_notes: notes || "",
      p_items: items, // Expects [{ product_id, quantity }]
      p_payment_method: paymentMethod
    });

    if (orderError) {
      console.error("Order Creation Error:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order_number: orderData?.order_number || orderData?.id,
      payment_method: paymentMethod,
      is_cod: isCODAllowed,
      message: isCODAllowed
        ? "Order placed successfully via Cash on Delivery!"
        : "Order submitted! Please follow advance payment instructions to confirm."
    });

  } catch (err: any) {
    console.error("Checkout Exception:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Checkout API is active and running" });
}
