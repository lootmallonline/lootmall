"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/banners", label: "Banners" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex gap-1 overflow-x-auto lg:flex-col">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium ${
              active ? "bg-maroon-600 text-white" : "hover:bg-maroon-50"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
      <a href="/" target="_blank" rel="noopener noreferrer" className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium text-maroon-700 hover:bg-maroon-50">
        View store
      </a>
    </nav>
  );
}
