"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function SimilarProducts({
  currentProductId,
  images = [],
  similarList = [],
  activeImage,
  onSelectImage,
}) {
  // If similar products list from backend is provided, use it; otherwise use product's multi-angle/color images
  const items =
    Array.isArray(similarList) && similarList.length > 0
      ? similarList
      : (images || []).map((img, idx) => ({
          _id: `var-${idx}`,
          image: img,
          title: `Color Variant ${idx + 1}`,
        }));

  if (!items || items.length <= 1) return null;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xs font-black tracking-wider text-slate-800 uppercase">
          <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          <span>{items.length} Similar Products / Colors</span>
        </h2>
        <span className="text-[11px] font-bold text-slate-400">
          Tap to view
        </span>
      </div>

      {/* Horizontal Swatch Thumbnails (Screenshot 4) */}
      <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1">
        {items.map((item, idx) => {
          const itemImg = item.image || item.images?.[0] || item;
          const isActive =
            activeImage === itemImg ||
            (currentProductId && item._id === currentProductId) ||
            (!activeImage && idx === 0);

          const isInternalLink = item.slug || (item._id && !item._id.startsWith("var-"));

          const content = (
            <div
              className={`group relative flex h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-slate-50 p-1 transition-all active:scale-95 ${
                isActive
                  ? "border-orange-500 ring-2 ring-orange-500/30 shadow-sm"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <img
                src={itemImg}
                alt={item.title || "Variant"}
                className="h-full w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-105"
              />
              {item.price && (
                <span className="absolute bottom-1 right-1 rounded-md bg-black/75 px-1 py-0.5 text-[8px] font-black text-white">
                  ₹{item.price}
                </span>
              )}
            </div>
          );

          if (isInternalLink) {
            return (
              <Link
                key={item._id || idx}
                href={`/products/${item.slug || item._id}`}
                prefetch={false}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectImage && onSelectImage(itemImg)}
              className="text-left"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}