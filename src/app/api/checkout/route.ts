import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST(req: NextRequest) {
  try {
    // Safely retrieve Cloudflare runtime environment variables via OpenNext adapter
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    try {
      const cfContext = await getCloudflareContext({ async: true });
      const cfEnv = cfContext?.env as Record<string, string | undefined>;
      if (cfEnv) {
        supabaseUrl = supabaseUrl || cfEnv.NEXT_PUBLIC_SUPABASE_URL;
        supabaseServiceKey = supabaseServiceKey || cfEnv.SUPABASE_SERVICE_ROLE_KEY;
      }
    } catch {
      // Fallback gracefully if context is evaluated outside worker runtime
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Order service configuration missing." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { name, phone, address, city, notes, items, spam_trap } = body;

    // Spam Trap Check
    if (spam_trap) {
      return NextResponse.json({ error: "Spam detected" }, { status: 400 });
    }

    // Required Field Validation
    if (!name || !phone || !address || !city) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Region-based payment logic: COD strictly for Rawalpindi/Islamabad, else Advance Payment
    const normalizedCity = city.trim().toLowerCase();
    const isCODAllowed = normalizedCity === "rawalpindi" || normalizedCity === "islamabad";
    const paymentMethod = isCODAllowed ? "COD" : "Advance Payment";

    // Generate Unique Order Number
    const orderNumber = "LM-" + Math.floor(100000 + Math.random() * 900000);

    // Direct Database Insert into orders table matching existing schema
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          customer_name: name,
          customer_phone: phone,
          customer_address: address,
          customer_city: city,
          notes: notes || "",
          payment_method: paymentMethod,
          payment_status: "pending",
          tracking_stage: "pending"
        }
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Direct Order Insert Error:", orderError);
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // Insert Order Items matching existing schema
    if (items && Array.isArray(items) && items.length > 0 && orderData?.id) {
      const formattedItems = items.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.product_id || item.id,
        quantity: item.quantity || 1
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(formattedItems);

      if (itemsError) {
        console.error("Order Items Insert Warning:", itemsError);
      }
    }

    return NextResponse.json({
      success: true,
      order_number: orderNumber,
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
  return NextResponse.json({ status: "Checkout API active" });
}
