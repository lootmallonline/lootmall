import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="font-display text-6xl font-bold text-maroon-600">404</p>
      <p className="text-gray-700">This page could not be found.</p>
      <Link href="/" className="btn-primary">
        Back to the store
      </Link>
    </div>
  );
}
