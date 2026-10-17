import Link from "next/link";
import type { Settings } from "@/lib/types";

export function Footer({ settings }: { settings: Settings }) {
  return (
    <footer className="mt-16 bg-maroon-800 text-sm text-maroon-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-gold-300">{settings.store_name}</p>
          <p className="mt-2">{settings.tagline}</p>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Help</p>
          <ul className="space-y-1">
            <li><Link href="/track" className="hover:text-gold-300">Track your order</Link></li>
            <li><Link href="/policies/shipping" className="hover:text-gold-300">Shipping and payment</Link></li>
            <li><Link href="/policies/returns" className="hover:text-gold-300">Returns</Link></li>
            <li><Link href="/policies/privacy" className="hover:text-gold-300">Privacy</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 font-semibold text-white">Contact</p>
          <p>
            <a href={`tel:${settings.contact_phone}`} className="hover:text-gold-300">{settings.contact_phone}</a>
          </p>
          <p>
            <a href={`mailto:${settings.contact_email}`} className="hover:text-gold-300">{settings.contact_email}</a>
          </p>
        </div>
      </div>
      <div className="border-t border-maroon-700 py-4 text-center text-xs">
        © {new Date().getFullYear()} {settings.store_name}. All rights reserved.
      </div>
    </footer>
  );
}
