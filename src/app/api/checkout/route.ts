"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function placeOrderAction(formData: FormData) {
  try {
    // 1. Await server supabase client (Next.js 15 Fix)
    const supabase = await createServerSupabase();

    const fullName = (formData.get("fullName") || formData.get("customer_name")) as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = (formData.get("city") as string) || "Islamabad";
    const cartItemsJson = formData.get("cartItems") as string;

    if (!fullName || !phone || !address || !cartItemsJson) {
      return { success: false, error: "Please fill in all required fields." };
    }

    let cartItems = [];
    try {
      cartItems = JSON.parse(cartItemsJson);
    } catch {
      return { success: false, error: "Invalid cart format." };
    }

    const totalAmount = cartItems.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    // 2. Insert into 'orders' table
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: fullName,
        phone: phone,
        address: address,
        city: city,
        total_amount: totalAmount,
        status: "pending",
        payment_method: "COD",
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order insert DB error:", orderError);
      return { success: false, error: `Database Error: ${orderError.message}` };
    }

    if (!orderData) {
      return { success: false, error: "Order record creation failed." };
    }

    // 3. Insert items into 'order_items' table
    if (cartItems.length > 0) {
      const orderItemsData = cartItems.map((item: any) => ({
        order_id: orderData.id,
        product_id: item.id || item.product_id || null,
        quantity: item.quantity || 1,
        price: item.price || 0,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsData);

      if (itemsError) {
        console.error("Order items insert error:", itemsError);
      }
    }

    revalidatePath("/admin/orders");
    return { success: true, orderId: orderData.id };

  } catch (err: any) {
    console.error("CRITICAL CHECKOUT EXCEPTION:", err);
    return { 
      success: false, 
      error: err?.message || "Order service is temporarily unavailable." 
    };
  }
}
