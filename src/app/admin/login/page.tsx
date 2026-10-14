import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin login" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function LoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="mb-1 text-center font-display text-3xl font-bold text-maroon-700">LootMall Admin</h1>
      <p className="mb-6 text-center text-sm text-ink/70">Sign in to manage your store.</p>
      {sp.error === "forbidden" && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">This account does not have administrator access.</p>
      )}
      <LoginForm />
    </div>
  );
}

// Cloudflare Pages runs these routes on the Edge runtime.
export const runtime = "edge";
