import { CartView } from "@/components/cart/CartView";
import { getSettings } from "@/lib/data";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Your cart" };

export default async function CartPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl font-bold text-maroon-700">Your cart</h1>
      <CartView deliveryCharge={settings.delivery_charge} />
    </div>
  );
}
