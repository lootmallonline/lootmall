"use client";

import { useState } from "react";

export function Gallery({ images, name, video }: { images: string[]; name: string; video?: string | null }) {
  const [active, setActive] = useState(0);
  const main = images[active];
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-card bg-maroon-50">
        {main ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={main} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">No image</div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-square overflow-hidden rounded-xl border-2 ${i === active ? "border-maroon-600" : "border-transparent"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {video && (
        <video src={video} controls preload="metadata" className="mt-3 w-full rounded-card bg-black" />
      )}
    </div>
  );
}
