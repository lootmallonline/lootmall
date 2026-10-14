import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Page not found</h1>
      <p className="mt-3 text-sm text-ink/70">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn-primary mt-6">Back to LootMall</Link>
    </div>
  );
}
