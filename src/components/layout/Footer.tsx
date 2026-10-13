import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { SITE_NAME } from "@/lib/site";
import type { Settings } from "@/lib/types";

const links = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
  { href: "/return-policy", label: "Return Policy" },
  { href: "/contact", label: "Contact" },
];

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-16 border-t-4 border-gold-400 bg-maroon-800 text-maroon-100">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold text-white">{SITE_NAME}</p>
          <p className="mt-2 text-sm text-gold-300">{settings.tagline}</p>
        </div>
        <nav aria-label="Store policies">
          <p className="font-semibold text-white">Help</p>
          <ul className="mt-3 space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold-300">{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-semibold text-white">Contact us</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Phone size={16} aria-hidden /> <a href={`tel:${settings.contact_phone}`} className="hover:text-gold-300">{settings.contact_phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} aria-hidden /> <a href={`mailto:${settings.contact_email}`} className="hover:text-gold-300">{settings.contact_email}</a>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-t border-maroon-700 py-4 text-center text-xs text-maroon-100/80">
        © {new Date().getFullYear()} {SITE_NAME}. All prices are in Pakistani Rupees (Rs.).
      </p>
    </footer>
  );
}
