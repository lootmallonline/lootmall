import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { getSettings } from "@/lib/data";
import { formatPKR } from "@/lib/format";

export const metadata: Metadata = { title: "Shipping Policy", alternates: { canonical: "/shipping-policy" } };

export default async function Page() {
  const s = await getSettings();
  return (
    <PolicyPage
      title="Shipping Policy"
      intro="LootMall delivers orders within Pakistan."
      sections={[
        { heading: "Delivery charges", body: `A delivery charge of ${formatPKR(s.delivery_charge)} is added to every order. The exact amount is always shown in your cart and at checkout before you place the order.` },
        { heading: "Order confirmation", body: "After you place an order we contact you on the phone number you provided to confirm the order and delivery details. Please make sure your phone number and address are correct." },
        { heading: "Delivery time", body: "We will tell you the expected delivery time when we confirm your order, because it depends on your city and the product." },
        { heading: "Questions", body: `For any question about your delivery, message us on WhatsApp at ${s.contact_phone} with your order number.` },
      ]}
    />
  );
}
