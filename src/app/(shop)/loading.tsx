export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16" role="status" aria-live="polite">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-maroon-100 border-t-maroon-600" />
      <p className="mt-4 text-center text-sm text-maroon-700">Loading…</p>
    </div>
  );
}
