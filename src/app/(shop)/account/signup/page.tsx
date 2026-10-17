import { redirect } from "next/navigation";
import { SignupForm } from "@/components/shop/AuthForms";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Create account" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Create your account</h1>
      <SignupForm />
    </div>
  );
}
