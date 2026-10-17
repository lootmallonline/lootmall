import { CartProvider } from "@/components/cart/CartProvider";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { getSettings } from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <CartProvider>
      <Header storeName={settings.store_name} />
      <main className="mx-auto min-h-[60vh] max-w-6xl px-4 py-6">{children}</main>
      <Footer settings={settings} />
    </CartProvider>
  );
}
