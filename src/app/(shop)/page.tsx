import Link from "next/link";
import { getBanners, getCategories, getProducts, getSettings } from "@/lib/data";
import { ProductCard } from "@/components/shop/ProductCard";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, hero, promo, categories, featured, latest] = await Promise.all([
    getSettings(),
    getBanners("hero"),
    getBanners("promo"),
    getCategories(),
    getProducts({ featured: true, limit: 8 }),
    getProducts({ limit: 12 }),
  ]);
  const banner = hero[0];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-card bg-gradient-to-r from-maroon-700 to-maroon-500 text-white">
        {banner?.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        )}
        <div className="relative px-6 py-14 sm:px-12 sm:py-20">
          <h1 className="font-display text-3xl font-bold sm:text-5xl">{banner?.title ?? settings.tagline}</h1>
          <p className="mt-3 max-w-xl text-maroon-100">
            {banner?.subtitle ?? "Cash on Delivery in Rawalpindi and Islamabad. Fast delivery across Pakistan."}
          </p>
          <Link href={banner?.link_url || "/products"} className="btn-gold mt-6">
            Shop now
          </Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold text-maroon-700">Categories</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/category/${c.slug}`}
                className="card flex h-24 items-center justify-center p-3 text-center text-sm font-semibold text-maroon-700 transition hover:bg-maroon-50"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {promo.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2">
          {promo.slice(0, 2).map((b) => (
            <Link key={b.id} href={b.link_url || "/products"} className="card block bg-gold-300/30 p-6">
              <p className="font-display text-xl font-bold text-maroon-700">{b.title}</p>
              {b.subtitle && <p className="mt-1 text-sm text-gray-700">{b.subtitle}</p>}
            </Link>
          ))}
        </section>
      )}

      {featured.length > 0 && (
        <section>
          <h2 className="mb-4 font-display text-2xl font-bold text-maroon-700">Featured</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold text-maroon-700">New arrivals</h2>
          <Link href="/products" className="text-sm font-semibold text-maroon-600">View all</Link>
        </div>
        {latest.length === 0 ? (
          <p className="rounded-card bg-maroon-50 p-8 text-center text-gray-600">Products are coming soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
