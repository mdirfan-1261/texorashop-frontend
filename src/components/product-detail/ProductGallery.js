"use client";

import { useState } from "react";

export default function ProductGallery({
  images = [],
  title = "Product Image",
  discountPercent = 0,
}) {
  const fallback =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";
  const galleryList = images.length > 0 ? images : [fallback];
  const [activeImage, setActiveImage] = useState(galleryList[0]);

  return (
    <div className="space-y-3.5">
      {/* Main Large Image Display */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
        <img
          src={activeImage || galleryList[0]}
          alt={title}
          className="h-full w-full rounded-xl object-contain transition-all duration-300"
        />

        {discountPercent > 0 && (
          <span className="absolute top-4 left-4 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-black text-white shadow-sm">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Thumbnails Row */}
      {galleryList.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {galleryList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(img)}
              className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition ${
                activeImage === img
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <img
                src={img}
                alt={`${title} thumbnail ${idx + 1}`}
                className="h-full w-full rounded-lg object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}