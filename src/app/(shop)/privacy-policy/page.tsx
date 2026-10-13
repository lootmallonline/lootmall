import type { Metadata } from "next";
import { PolicyPage } from "@/components/shop/PolicyPage";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy-policy" } };

export default async function Page() {
  const s = await getSettings();
  return (
    <PolicyPage
      title="Privacy Policy"
      intro="This policy explains what information LootMall collects when you place an order and how we use it."
      sections={[
        { heading: "What we collect", body: "When you place an order we collect your name, phone number, delivery address, city and any notes you write. We do not ask you to create an account and we do not collect payment card details on this website." },
        { heading: "How we use it", body: "We use your details only to confirm your order, contact you about it, and deliver it to you. We may also use them to answer questions you send us about your order." },
        { heading: "Sharing", body: "We share your name, phone number and delivery address with the delivery company only so that your order can be delivered. We do not sell your information." },
        { heading: "Storage and security", body: "Order details are stored in a secured database. Only authorised LootMall staff can view them." },
        { heading: "Your choices", body: `To ask us to correct or delete your order details, contact us at ${s.contact_email} or on WhatsApp at ${s.contact_phone}.` },
      ]}
    />
  );
}
