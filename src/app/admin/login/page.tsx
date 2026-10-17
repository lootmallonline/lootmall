import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminContext } from "@/lib/auth";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdminContext()) redirect("/admin");
  return (
    <div className="flex min-h-screen items-center justify-center bg-maroon-50 px-4">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-center font-display text-3xl font-bold text-maroon-700">Admin login</h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
