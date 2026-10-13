import Link from "next/link";
import type { Category } from "@/lib/types";

// Full class names are listed so Tailwind keeps them in the build.
const COLORS = [
  "from-rose-500 to-maroon-600",
  "from-amber-400 to-orange-500",
  "from-teal-500 to-emerald-600",
  "from-fuchsia-500 to-purple-600",
  "from-sky-500 to-indigo-600",
  "from-lime-500 to-green-600",
];

export function CategoryTiles({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((c, i) => (
        <li key={c.id}>
          <Link
            href={`/category/${c.slug}`}
            className={`relative flex h-28 items-end overflow-hidden rounded-card bg-gradient-to-br ${COLORS[i % COLORS.length]} p-4 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:h-32`}
          >
            <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15" aria-hidden />
            <span className="relative font-display text-lg font-bold leading-tight">{c.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
