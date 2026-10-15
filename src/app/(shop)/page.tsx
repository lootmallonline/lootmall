import Link from "next/link";
import { Headphones, Truck, Wallet } from "lucide-react";
import { getBanners, getCategories, getProducts, getSettings } from "@/lib/data";
import { formatPKR, whatsappUrl } from "@/lib/format";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { CategoryTiles } from "@/components/shop/CategoryTiles";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { EmptyState } from "@/components/shop/EmptyState";


export default async function HomePage() {
  const [settings, categories, heroBanners, promoBanners, featured, latest] = await Promise.all([
    getSettings(),
    getCategories(),
    getBanners("hero"),
    getBanners("promo"),
    getProducts({ featured: true, pageSize: 8 }),
    getProducts({ pageSize: 12 }),
  ]);

  const featuredIds = new Set(featured.products.map((p) => p.id));
  const newArrivals = latest.products.filter((p) => !featuredIds.has(p.id)).slice(0, 8);
  const hasProducts = featured.products.length + newArrivals.length > 0;

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 pt-6">
      {heroBanners.length > 0 ? (
        <HeroCarousel banners={heroBanners} />
      ) : (
        <section className="relative overflow-hidden rounded-card bg-gradient-to-br from-maroon-800 via-maroon-600 to-maroon-500 px-6 py-14 text-white sm:px-12 sm:py-20">
          <span className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold-400/20" aria-hidden />
          <span className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-white/10" aria-hidden />
          <div className="relative max-w-xl">
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{settings.tagline}</h1>
            <p className="mt-4 text-maroon-100 sm:text-lg">
              Browse our products, add them to your cart and get them delivered to your door anywhere in Pakistan.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className="btn-gold px-6 py-3">Shop now</Link>
              <a href={whatsappUrl(settings.contact_phone, "Hello LootMall, I have a question.")} target="_blank" rel="noopener noreferrer" className="btn border border-white/60 px-6 py-3 text-white hover:bg-white/10">
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </section>
      )}

      <section aria-label="Store information" className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Truck, title: `Delivery ${formatPKR(settings.delivery_charge)}`, text: "Flat delivery charge per order" },
          { icon: Wallet, title: "Prices in PKR", text: "No hidden charges at checkout" },
          { icon: Headphones, title: "WhatsApp support", text: settings.contact_phone },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 rounded-card border border-maroon-100 bg-maroon-50/60 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-maroon-600 text-gold-300"><Icon size={20} aria-hidden /></span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-ink/70">{text}</p>
            </div>
          </div>
        ))}
      </section>

      {categories.length > 0 && (
        <section aria-labelledby="cat-heading">
          <h2 id="cat-heading" className="mb-4 font-display text-2xl font-bold text-maroon-700">Shop by category</h2>
          <CategoryTiles categories={categories} />
        </section>
      )}

      {promoBanners.length > 0 && (
        <section aria-label="Offers" className="grid gap-4 md:grid-cols-2">
          {promoBanners.map((b) => {
            const body = (
              <div className="relative flex h-40 items-end overflow-hidden rounded-card bg-gradient-to-br from-gold-400 to-gold-500 p-5 text-ink sm:h-48">
                {b.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className={`relative rounded-xl p-3 ${b.image_url ? "bg-white/85" : ""}`}>
                  <p className="font-display text-xl font-bold">{b.title}</p>
                  {b.subtitle && <p className="text-sm">{b.subtitle}</p>}
                </div>
              </div>
            );
            if (!b.link_url) return <div key={b.id}>{body}</div>;
            return b.link_url.startsWith("/") ? (
              <Link key={b.id} href={b.link_url}>{body}</Link>
            ) : (
              <a key={b.id} href={b.link_url} target="_blank" rel="noopener noreferrer">{body}</a>
            );
          })}
        </section>
      )}

      {featured.products.length > 0 && (
        <section aria-labelledby="featured-heading">
          <div className="mb-4 flex items-end justify-between">
            <h2 id="featured-heading" className="font-display text-2xl font-bold text-maroon-700">Featured products</h2>
            <Link href="/products" className="text-sm font-semibold text-maroon-600 hover:underline">View all</Link>
          </div>
          <ProductGrid products={featured.products} />
        </section>
      )}

      {newArrivals.length > 0 && (
        <section aria-labelledby="new-heading">
          <div className="mb-4 flex items-end justify-between">
            <h2 id="new-heading" className="font-display text-2xl font-bold text-maroon-700">New arrivals</h2>
            <Link href="/products" className="text-sm font-semibold text-maroon-600 hover:underline">View all</Link>
          </div>
          <ProductGrid products={newArrivals} />
        </section>
      )}

      {!hasProducts && (
        <EmptyState
          title="Products are coming soon"
          message="We are adding products to the store. Message us on WhatsApp and we will help you find what you need."
          actionHref={whatsappUrl(settings.contact_phone, "Hello LootMall, I want to know about your products.")}
          actionLabel="Chat on WhatsApp"
        />
      )}
    </div>
  );
}
