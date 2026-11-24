"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, Layers, Heart } from "lucide-react";

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const productId = product?._id || product?.id || product?.slug;

  useEffect(() => {
    if (!productId) return;
    try {
      const saved = localStorage.getItem("texora_wishlist");
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          setIsWishlisted(list.some((item) => (item._id || item.id || item.slug) === productId));
        }
      }
    } catch (e) {}
  }, [productId]);

  if (!product) return null;

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = localStorage.getItem("texora_wishlist");
      let list = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(list)) list = [];

      const exists = list.some((item) => (item._id || item.id || item.slug) === productId);
      if (exists) {
        list = list.filter((item) => (item._id || item.id || item.slug) !== productId);
        setIsWishlisted(false);
      } else {
        list.unshift(product);
        setIsWishlisted(true);
      }
      localStorage.setItem("texora_wishlist", JSON.stringify(list));
    } catch (err) {
      console.error(err);
    }
  };

  const primaryImage =
    product.images?.[0] ||
    product.image ||
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80";

  const numPrice = Number(product.price || 0);
  const numMrp = Number(product.mrp || numPrice);
  const stockCount = Number(product.stock !== undefined ? product.stock : 25);
  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  const discountPercent =
    numMrp > numPrice && numPrice > 0
      ? Math.round(((numMrp - numPrice) / numMrp) * 100)
      : 0;

  const variantCount =
    (product.images?.length || 1) + (product.colors?.length > 1 ? product.colors.length - 1 : 0);

  const reviewsCount =
    product.reviewsCount ||
    product.ratingsCount ||
    Math.floor((numPrice * 19) % 850 + 48);

  const productUrl = `/products/${product.slug || product._id}`;

  return (
    <Link
      href={productUrl}
      prefetch={false}
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200/90 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md cursor-pointer"
    >
      {/* 1. Meesho Edge-to-Edge Tall Image Area (aspect-[3/4]) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[1px]">
            <span className="rounded-md bg-rose-600 px-2.5 py-1 text-[10px] font-black tracking-wider text-white uppercase shadow-md">
              Out of Stock
            </span>
          </div>
        )}

        {/* Shopsy/Meesho % OFF Tag (Top Left) */}
        {!isOutOfStock && discountPercent > 0 && (
          <span className="absolute top-2 left-2 rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black text-white shadow-xs">
            {discountPercent}% off
          </span>
        )}

        {/* ❤️ 1-Click Wishlist Heart Button (Top Right) */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label="Add to Wishlist"
          className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition hover:scale-110 active:scale-95"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600 hover:text-rose-500"
            }`}
          />
        </button>

        {/* Meesho "+2 More" Variant Badge (Bottom Right of Image) */}
        {variantCount > 1 && (
          <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-md bg-black/65 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm backdrop-blur-xs">
            <Layers className="h-2.5 w-2.5" />
            <span>+{variantCount > 5 ? 4 : variantCount - 1} More</span>
          </span>
        )}
      </div>

      {/* 2. Content Area */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase truncate">
            {product.brand || "Texora Choice"}
          </p>

          <h3 className="mt-0.5 line-clamp-1 text-xs font-semibold text-slate-800 group-hover:text-orange-600 transition">
            {product.title}
          </h3>
        </div>

        <div className="mt-2 space-y-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-black text-slate-900">
              ₹{numPrice.toLocaleString("en-IN")}
            </span>
            {numMrp > numPrice && (
              <>
                <span className="text-[10px] sm:text-[11px] text-slate-400 line-through">
                  ₹{numMrp.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600">
                  {discountPercent}% off
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-700 px-1.5 py-0.5 text-[10px] font-black text-white">
              {product.rating || "4.2"} <Star className="h-2.5 w-2.5 fill-current" />
            </span>
            <span className="text-[10px] font-medium text-slate-400 truncate">
              {reviewsCount.toLocaleString("en-IN")} Reviews
            </span>
          </div>

          {(isOutOfStock || isLowStock) && (
            <div className="pt-0.5 text-[10px]">
              {isOutOfStock ? (
                <span className="font-extrabold text-rose-600">Out of Stock</span>
              ) : (
                <span className="font-extrabold text-orange-600 animate-pulse">⚡ Only {stockCount} left!</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}