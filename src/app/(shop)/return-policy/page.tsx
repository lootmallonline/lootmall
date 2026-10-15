import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Return Policy", alternates: { canonical: "/return-policy" } };

export default async function Page() {
  const s = await getSettings();
  return (
    <PolicyPage
      title="Return Policy"
      intro="We want you to be happy with your order. This page explains what to do if something is wrong."
      sections={[
        { heading: "Damaged or wrong items", body: `If you receive a damaged item or a different item from what you ordered, contact us as soon as possible on WhatsApp at ${s.contact_phone} or at ${s.contact_email}. Please include your order number and clear photos.` },
        { heading: "How we resolve it", body: "After we check the problem we will tell you the available options, such as a replacement or a refund, depending on the product and the situation." },
        { heading: "Product details", body: "Please read the product description before ordering. Details such as what is included with the product are written on each product page." },
      ]}
    />
  );
}
