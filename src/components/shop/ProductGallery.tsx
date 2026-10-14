"use client";

import { useState } from "react";
import { Play, ShoppingBag } from "lucide-react";

type Media = { type: "image" | "video"; src: string };

export function ProductGallery({
  name,
  images,
  videoUrl,
}: {
  name: string;
  images: string[];
  videoUrl: string | null;
}) {
  const media: Media[] = [
    ...images.map((src) => ({ type: "image" as const, src })),
    ...(videoUrl ? [{ type: "video" as const, src: videoUrl }] : []),
  ];
  const [active, setActive] = useState(0);
  const current = media[active];

  if (!current) {
    return (
      <div className="grid aspect-square place-items-center rounded-card bg-maroon-50 text-maroon-500/40">
        <ShoppingBag size={72} aria-hidden />
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-card border border-maroon-100 bg-maroon-50">
        {current.type === "image" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.src} alt={name} className="h-full w-full object-contain" />
        ) : (
          <video key={current.src} src={current.src} controls playsInline className="h-full w-full bg-black object-contain">
            Your browser cannot play this video.
          </video>
        )}
      </div>
      {media.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Product media">
          {media.map((m, i) => (
            <li key={m.src}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={m.type === "video" ? "Show product video" : `Show image ${i + 1}`}
                aria-current={i === active}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-maroon-50 ${
                  i === active ? "border-maroon-600" : "border-transparent hover:border-maroon-100"
                }`}
              >
                {m.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.src} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center bg-maroon-700 text-white">
                    <Play size={20} aria-hidden />
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
