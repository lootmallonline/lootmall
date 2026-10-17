"use client";

import Link from "next/link";
import { ShoppingCart, User, Search } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";

export function Header({ storeName }: { storeName: string }) {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-maroon-800 bg-maroon-700 text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="font-display text-xl font-bold text-gold-300">
          {storeName}
        </Link>
        <form action="/products" className="mx-2 hidden flex-1 md:block">
          <div className="relative">
            <input
              name="q"
              placeholder="Search products..."
              className="w-full rounded-full border-0 bg-white/95 py-2 pl-4 pr-10 text-sm text-ink outline-none"
            />
            <Search className="absolute right-3 top-2 h-5 w-5 text-gray-500" />
          </div>
        </form>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link href="/products" className="hidden hover:text-gold-300 sm:block">
            Shop
          </Link>
          <Link href="/track" className="hidden hover:text-gold-300 sm:block">
            Track order
          </Link>
          <Link href="/account" className="flex items-center gap-1 hover:text-gold-300">
            <User className="h-5 w-5" />
            <span className="hidden sm:inline">Account</span>
          </Link>
          <Link href="/cart" className="relative flex items-center gap-1 hover:text-gold-300">
            <ShoppingCart className="h-5 w-5" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-xs font-bold text-ink">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
      <form action="/products" className="px-4 pb-3 md:hidden">
        <input name="q" placeholder="Search products..." className="w-full rounded-full bg-white/95 px-4 py-2 text-sm text-ink outline-none" />
      </form>
    </header>
  );
}
