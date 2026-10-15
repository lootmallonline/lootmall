import type { Metadata } from "next";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { getSettings } from "@/lib/data";
import { whatsappUrl } from "@/lib/format";

export const metadata: Metadata = { title: "Contact us", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Contact us</h1>
      <p className="mt-3 text-ink/80">Questions about a product or an order? Reach us any of these ways.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <a href={whatsappUrl(s.contact_phone, "Hello LootMall, I need help.")} target="_blank" rel="noopener noreferrer" className="card flex flex-col items-center gap-2 text-center transition hover:-translate-y-1 hover:shadow-lg">
          <MessageCircle className="text-[#25D366]" aria-hidden /> <span className="font-semibold">WhatsApp</span>
          <span className="text-sm text-ink/70">{s.contact_phone}</span>
        </a>
        <a href={`tel:${s.contact_phone}`} className="card flex flex-col items-center gap-2 text-center transition hover:-translate-y-1 hover:shadow-lg">
          <Phone className="text-maroon-600" aria-hidden /> <span className="font-semibold">Phone</span>
          <span className="text-sm text-ink/70">{s.contact_phone}</span>
        </a>
        <a href={`mailto:${s.contact_email}`} className="card flex flex-col items-center gap-2 text-center transition hover:-translate-y-1 hover:shadow-lg">
          <Mail className="text-maroon-600" aria-hidden /> <span className="font-semibold">Email</span>
          <span className="break-all text-sm text-ink/70">{s.contact_email}</span>
        </a>
      </div>
    </div>
  );
}
