"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function placeOrderAction(formData: FormData) {
  const supabase = createServerSupabase();

  const fullName = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const city = formData.get("city") as string;
  const cartItemsJson = formData.get("cartItems") as string;
  
  if (!fullName || !phone || !address || !cartItemsJson) {
    return { success: false, error: "Please fill in all required fields." };
  }

  const cartItems = JSON.parse(cartItemsJson);
  let totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

  // 1. Insert into 'orders' table
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: fullName,
      phone: phone,
      address: address,
      city: city || "Islamabad",
      total_amount: totalAmount,
      status: "pending",
      payment_method: "COD"
    })
    .select()
    .single();

  if (orderError || !orderData) {
    console.error("Order insert error:", orderError);
    return { success: false, error: "Failed to place order. Please try again." };
  }

  // 2. Insert items into 'order_items' table
  const orderItemsData = cartItems.map((item: any) => ({
    order_id: orderData.id,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItemsData);

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
    return { success: false, error: "Failed to save order items." };
  }

  revalidatePath("/admin/orders");
  return { success: true, orderId: orderData.id };
}
