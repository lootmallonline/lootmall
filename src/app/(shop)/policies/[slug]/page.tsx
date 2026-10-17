import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

interface Policy {
  title: string;
  body: (codCities: string, delivery: number, phone: string, email: string) => string[];
}

const POLICIES: Record<string, Policy> = {
  shipping: {
    title: "Shipping and payment",
    body: (cod, delivery, phone) => [
      `Delivery charge: Rs. ${delivery} per order, anywhere in Pakistan.`,
      `Cash on Delivery is available in: ${cod}. In these cities you pay when the parcel arrives.`,
      "For all other cities, advance payment is required. Send the payment to the bank, EasyPaisa or JazzCash account shown at checkout and enter your transaction ID. We confirm your order after verifying the payment.",
      "Orders are usually dispatched within 1 to 2 working days. Delivery usually takes 2 to 5 working days depending on your city.",
      `Questions? Call or WhatsApp ${phone}.`,
    ],
  },
  returns: {
    title: "Returns and refunds",
    body: (_cod, _delivery, phone) => [
      "If your parcel arrives damaged or you receive the wrong item, contact us within 48 hours of delivery with clear photos.",
      "Items must be unused and in the original packaging to be returned.",
      "Once we approve a return, we will send a replacement or refund the product price. For advance payments, refunds are sent back to the account you paid from.",
      `Contact us on ${phone} to start a return.`,
    ],
  },
  privacy: {
    title: "Privacy",
    body: (_cod, _delivery, _phone, email) => [
      "We collect only what is needed to deliver your order: your name, mobile number, address and city.",
      "We do not sell your personal information. It is used to process and deliver orders and to contact you about them.",
      "If you create an account, your orders are visible only to you.",
      `To ask us to delete your data, email ${email}.`,
    ],
  },
  terms: {
    title: "Terms of service",
    body: () => [
      "By placing an order you confirm that the details you gave are correct.",
      "Prices and stock can change without notice. If an item is out of stock after you order, we will contact you for a replacement or refund.",
      "We may cancel orders that look fraudulent or have wrong contact details.",
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: POLICIES[slug]?.title ?? "Policy" };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = POLICIES[slug];
  if (!policy) notFound();
  const s = await getSettings();
  return (
    <article className="mx-auto max-w-2xl space-y-3">
      <h1 className="font-display text-3xl font-bold text-maroon-700">{policy.title}</h1>
      {policy.body(s.cod_cities, s.delivery_charge, s.contact_phone, s.contact_email).map((p) => (
        <p key={p} className="text-gray-700">{p}</p>
      ))}
    </article>
  );
}
