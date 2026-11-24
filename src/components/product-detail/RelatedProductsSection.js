"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export default function RelatedProductsSection({
  category = "Fashion",
  subCategory = "",
  currentProductId = "",
}) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    async function loadRelated() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/products", {
          cache: "no-store",
        });
        if (res.ok) {
          const all = await res.json();
          if (Array.isArray(all)) {
            // Same category ke products filter karein, current product ko chhodkar
            const filtered = all
              .filter((p) => p._id !== currentProductId && p.category === category)
              .sort((a, b) => {
                // Same subCategory wale pehle dikhein
                if (subCategory && a.subCategory === subCategory && b.subCategory !== subCategory) return -1;
                if (subCategory && b.subCategory === subCategory && a.subCategory !== subCategory) return 1;
                return 0;
              });

            // Agar same category mein kam items hain toh baaki active products add kar lein
            if (filtered.length < 4) {
              const others = all.filter(
                (p) => p._id !== currentProductId && p.category !== category
              );
              setRelated([...filtered, ...others].slice(0, 12));
            } else {
              setRelated(filtered.slice(0, 12));
            }
          }
        }
      } catch (e) {
        console.error("Related products fetch error:", e);
      } finally {
        setLoading(false);
      }
    }

    if (category) {
      loadRelated();
    }
  }, [category, subCategory, currentProductId]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!loading && related.length === 0) return null;

  return (
    <div className="mt-10 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      {/* 1. Header: Similar Products + Scroll Arrows + View All (Screenshot Match) */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-black text-slate-900 sm:text-lg">
            <Sparkles className="h-4 w-4 text-orange-500" />
            <span>Similar Products</span>
          </h2>
          <p className="text-xs text-slate-400">
            Customers shopping for {subCategory || category} also viewed these
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll Buttons */}
          <button
            type="button"
            onClick={() => scroll("left")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-orange-500 hover:text-orange-600 active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:border-orange-500 hover:text-orange-600 active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <Link
            href={`/products?category=${encodeURIComponent(category)}`}
            className="ml-2 text-xs font-black text-orange-600 hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      {/* 2. Horizontal Scrollable Cards Strip (Screenshot Match) */}
      <div
        ref={scrollRef}
        className="mt-4 flex gap-4 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
      >
        {loading ? (
          /* Skeleton Loader */
          [1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="h-64 w-44 shrink-0 animate-pulse rounded-xl bg-slate-100 p-3"
            />
          ))
        ) : (
          related.map((item) => {
            const numPrice = Number(item.price || 0);
            const numMrp = Number(item.mrp || numPrice);
            const discount =
              numMrp > numPrice && numPrice > 0
                ? Math.round(((numMrp - numPrice) / numMrp) * 100)
                : 0;

            const primaryImg =
              item.images?.[0] ||
              item.image ||
              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";

            return (
              <Link
                key={item._id}
                href={`/products/${item.slug || item._id}`}
                prefetch={false}
                className="group flex w-44 shrink-0 flex-col justify-between overflow-hidden rounded-xl border border-slate-200/80 bg-white p-2.5 transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-md"
              >
                {/* Image Area */}
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-slate-50 p-2">
                  <img
                    src={primaryImg}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.images?.length > 1 && (
                    <span className="absolute bottom-1.5 right-1.5 rounded-md bg-black/60 px-1 py-0.5 text-[8px] font-bold text-white">
                      +{item.images.length - 1} More
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="mt-2 space-y-1 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase truncate">
                    {item.brand || "Texora"}
                  </p>
                  <p className="line-clamp-1 text-xs font-semibold text-slate-800 group-hover:text-orange-600 transition">
                    {item.title}
                  </p>

                  {/* Shopsy Style Price: "89% off 599 ₹63" (Screenshot Match) */}
                  <div className="flex items-baseline gap-1.5 flex-wrap pt-0.5">
                    {discount > 0 && (
                      <span className="text-[11px] font-extrabold text-emerald-600">
                        {discount}% off
                      </span>
                    )}
                    {numMrp > numPrice && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {numMrp}
                      </span>
                    )}
                    <span className="text-xs font-black text-slate-900">
                      ₹{numPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}