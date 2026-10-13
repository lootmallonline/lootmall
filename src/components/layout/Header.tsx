"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { LOGO_SRC, SITE_NAME } from "@/lib/site";

export function Header({ tagline }: { tagline: string }) {
  const { count, hydrated } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-maroon-100 bg-white/95 backdrop-blur">
      <div className="bg-maroon-700 px-4 py-1.5 text-center text-xs text-gold-300 sm:text-sm">
        {tagline}
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${SITE_NAME} home`}>
          {LOGO_SRC ? (
            <Image src={LOGO_SRC} alt={SITE_NAME} width={140} height={44} priority className="h-10 w-auto" />
          ) : (
            <span className="font-display text-2xl font-bold text-maroon-700">
              Loot<span className="text-gold-500">Mall</span>
            </span>
          )}
        </Link>

        <form action="/search" role="search" className="mx-auto hidden max-w-xl flex-1 sm:block">
          <label htmlFor="site-search" className="sr-only">Search products</label>
          <div className="flex overflow-hidden rounded-full border border-maroon-100 bg-maroon-50 focus-within:border-maroon-500">
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search products"
              className="w-full bg-transparent px-4 py-2 text-sm outline-none"
            />
            <button type="submit" className="px-4 text-maroon-700 hover:text-maroon-500" aria-label="Search">
              <Search size={18} />
            </button>
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:ml-0">
          <Link href="/products" className="hidden rounded-full px-3 py-2 text-sm font-medium hover:bg-maroon-50 md:block">
            All products
          </Link>
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-maroon-700 hover:bg-maroon-50"
            aria-label={`Shopping cart${hydrated ? `, ${count} items` : ""}`}
          >
            <ShoppingBag size={24} />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-ink">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <form action="/search" role="search" className="px-4 pb-3 sm:hidden">
        <label htmlFor="mobile-search" className="sr-only">Search products</label>
        <div className="flex overflow-hidden rounded-full border border-maroon-100 bg-maroon-50 focus-within:border-maroon-500">
          <input
            id="mobile-search"
            name="q"
            type="search"
            placeholder="Search products"
            className="w-full bg-transparent px-4 py-2 text-sm outline-none"
          />
          <button type="submit" className="px-4 text-maroon-700" aria-label="Search">
            <Search size={18} />
          </button>
        </div>
      </form>
    </header>
  );
}
