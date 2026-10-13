"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/lib/types";

function Slide({ banner }: { banner: Banner }) {
  const inner = (
    <div className="relative h-56 overflow-hidden rounded-card bg-gradient-to-r from-maroon-700 to-maroon-500 sm:h-80 lg:h-[26rem]">
      {banner.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={banner.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-maroon-800/80 via-maroon-800/40 to-transparent" />
      <div className="relative flex h-full max-w-xl flex-col justify-center gap-2 p-6 text-white sm:p-12">
        <h2 className="font-display text-2xl font-bold sm:text-4xl">{banner.title}</h2>
        {banner.subtitle && <p className="text-sm text-gold-300 sm:text-lg">{banner.subtitle}</p>}
      </div>
    </div>
  );
  if (!banner.link_url) return inner;
  return banner.link_url.startsWith("/") ? (
    <Link href={banner.link_url} aria-label={banner.title}>{inner}</Link>
  ) : (
    <a href={banner.link_url} aria-label={banner.title} target="_blank" rel="noopener noreferrer">{inner}</a>
  );
}

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const count = banners.length;
  const go = (n: number) => setIndex((n + count) % count);

  return (
    <section aria-roledescription="carousel" aria-label="Promotions" className="relative">
      <Slide banner={banners[index]} />
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-maroon-700 shadow hover:bg-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-maroon-700 shadow hover:bg-white"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={`h-2.5 rounded-full transition-all ${i === index ? "w-6 bg-gold-400" : "w-2.5 bg-white/70"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
