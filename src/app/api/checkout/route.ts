
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error("Checkout: Supabase environment variables missing");
      return NextResponse.json(
        { error: "Order service is temporarily unavailable." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);
    const body = await req.json();

    const {
      name,
      phone,
      address,
      city,
      notes,
      items,
      spam_trap,
    } = body;

    if (spam_trap) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    if (
      typeof name !== "string" || !name.trim() ||
      typeof phone !== "string" || !phone.trim() ||
      typeof address !== "string" || !address.trim() ||
      typeof city !== "string" || !city.trim()
    ) {
      return NextResponse.json(
        { error: "Please enter your name, phone, address and city." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    // Validate and combine duplicate product IDs.
    const quantities = new Map<string, number>();

    for (const item of items) {
      const id = item?.product_id || item?.id;
      const quantity = Number(item?.quantity ?? 1);

      if (
        typeof id !== "string" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 100
      ) {
        return NextResponse.json(
          { error: "Invalid product or quantity in cart." },
          { status: 400 }
        );
      }

      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }

    const productIds = [...quantities.keys()];

    const { data: products, error: productError } = await supabase
      .from("products")
      .select(
        "id, name, sku, regular_price, sale_price, stock, is_active"
      )
      .in("id", productIds);

    if (productError) {
      console.error("Checkout product lookup failed:", productError.message);
      return NextResponse.json(
        { error: "Unable to verify cart products. Please try again." },
        { status: 500 }
      );
    }

    if (!products || products.length !== productIds.length) {
      return NextResponse.json(
        { error: "A product in your cart is no longer available." },
        { status: 400 }
      );
    }

    const formattedItems = [];

    let subtotal = 0;

    for (const product of products) {
      const quantity = quantities.get(product.id)!;

      if (!product.is_active) {
        return NextResponse.json(
          { error: `${product.name} is currently unavailable.` },
          { status: 400 }
        );
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}.` },
          { status: 400 }
        );
      }

      const price =
        product.sale_price != null && product.sale_price > 0
          ? product.sale_price
          : product.regular_price;

      const lineTotal = price * quantity;

      if (!Number.isSafeInteger(lineTotal)) {
        return NextResponse.json(
          { error: "Invalid product total." },
          { status: 400 }
        );
      }

      subtotal += lineTotal;

      formattedItems.push({
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        unit_price: price,
        quantity,
        line_total: lineTotal,
      });
    }

    const normalizedCity = city.trim().toLowerCase();
    const isCODAllowed =
      normalizedCity === "rawalpindi" ||
      normalizedCity === "islamabad";

    const paymentMethod = isCODAllowed ? "COD" : "Advance Payment";
    const deliveryCharge = 299;
    const total = subtotal + deliveryCharge;

    const orderNumber =
      "LM-" + Date.now().toString().slice(-8) +
      Math.floor(Math.random() * 10);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        status: "pending",
        customer_name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        customer_phone: phone.trim(),
        customer_address: address.trim(),
        customer_city: city.trim(),
        notes: typeof notes === "string" ? notes.trim() : null,
        subtotal,
        delivery_charge: deliveryCharge,
        total,
        payment_method: paymentMethod,
        payment_status: "pending",
        tracking_stage: "pending",
      })
      .select("id, order_number")
      .single();

    if (orderError || !order) {
      console.error(
        "Checkout order insert failed:",
        orderError?.message
      );

      return NextResponse.json(
        { error: "Unable to save your order. Please try again." },
        { status: 500 }
      );
    }

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        formattedItems.map((item) => ({
          ...item,
          order_id: order.id,
          vendor_id: null,
        }))
      );

    if (itemsError) {
      console.error("Checkout item insert failed:", itemsError.message);

      // Remove incomplete order if its items could not be saved.
      const { error: cleanupError } = await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (cleanupError) {
        console.error("Checkout cleanup failed:", cleanupError.message);
      }

      return NextResponse.json(
        { error: "Unable to save order items. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      subtotal,
      delivery_charge: deliveryCharge,
      total,
      payment_method: paymentMethod,
      is_cod: isCODAllowed,
      message: "Your order has been placed successfully.",
    });
  } catch (error) {
    console.error(
      "Checkout exception:",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "Checkout API active" });
}
