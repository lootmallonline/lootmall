import { redirect } from "next/navigation";
import { LoginForm } from "@/components/shop/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Log in" };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Log in</h1>
      <LoginForm />
    </div>
  );
}
