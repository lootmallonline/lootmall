import { CheckoutForm } from "@/components/shop/CheckoutForm";
import { getSettings } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const settings = await getSettings();
  const user = await getCurrentUser();
  let name = "";
  let phone = "";
  if (user) {
    try {
      const supabase = await createServerSupabase();
      const { data } = await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle();
      name = data?.full_name ?? "";
      phone = data?.phone ?? "";
    } catch {
      // checkout still works without prefilled details
    }
  }
  return (
    <div>
      <h1 className="mb-4 font-display text-3xl font-bold text-maroon-700">Checkout</h1>
      <CheckoutForm settings={settings} defaults={{ name, phone, loggedIn: !!user }} />
    </div>
  );
}
