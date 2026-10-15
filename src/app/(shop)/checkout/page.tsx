import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";
import { getSettings } from "@/lib/data";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const settings = await getSettings();

  // If the customer is logged in, pre-fill their name and phone.
  let defaults: { name: string; phone: string } | null = null;
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("full_name,phone").eq("id", user.id).maybeSingle();
      if (profile) defaults = { name: (profile.full_name as string) ?? "", phone: (profile.phone as string) ?? "" };
    }
  } catch {
    defaults = null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-maroon-700">Checkout</h1>
      <CheckoutForm settings={settings} defaults={defaults} />
    </div>
  );
}
