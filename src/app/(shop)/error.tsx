"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold text-maroon-700">Something went wrong</h1>
      <p className="mt-3 text-sm text-ink/70">
        The page could not be loaded. Check your internet connection and try again.
      </p>
      <button onClick={reset} className="mt-6 rounded-full bg-maroon-600 px-6 py-3 text-sm font-semibold text-white hover:bg-maroon-700">
        Try again
      </button>
    </div>
  );
}
