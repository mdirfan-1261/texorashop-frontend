"use client";

import { useState, useEffect } from "react";
import { Star, Info, ShieldCheck, Truck } from "lucide-react";

export default function ProductPricing({
  title = "Untitled Product",
  brand = "Texora Choice",
  category = "General",
  subCategory = "",
  price = 0,
  mrp = 0,
  stock = 25,
  rating = "3.9",
  ratingsCount,
  reviewsCount,
}) {
  const [deliveryInfo, setDeliveryInfo] = useState({
    fee: 40,
    minOrder: 499,
    isFree: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("texora_store_settings");
      if (saved) {
        const s = JSON.parse(saved);
        setDeliveryInfo({
          fee: s.deliveryFee !== undefined ? s.deliveryFee : 40,
          minOrder: s.freeDeliveryMinOrder !== undefined ? s.freeDeliveryMinOrder : 499,
          isFree: s.isFreeDeliveryActive !== undefined ? s.isFreeDeliveryActive : true,
        });
      }
    } catch (e) {}
  }, []);

  const numPrice = Number(price || 0);
  const numMrp = Number(mrp || numPrice);
  const stockCount = Number(stock !== undefined ? stock : 25);
  const isOutOfStock = stockCount <= 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;
  const discountPercent =
    numMrp > numPrice && numPrice > 0
      ? Math.round(((numMrp - numPrice) / numMrp) * 100)
      : 0;

  // Dynamic Meesho counts fallback
  const totalRatings = ratingsCount || Math.floor((numPrice * 17) % 600 + 120);
  const totalReviews = reviewsCount || Math.floor(totalRatings * 0.42);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      {/* Brand & Subcategory Tag */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold tracking-wider text-orange-600 uppercase">
          {brand}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500">
          {subCategory || category}
        </span>
      </div>

      {/* 1. Product Title (Meesho Style clean & prominent) */}
      <h1 className="mt-2 text-lg font-bold text-slate-900 md:text-xl leading-snug">
        {title}
      </h1>

      {/* 2. Meesho Signature Price: "₹272 onwards ⓘ" */}
      <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
        <span className="text-3xl font-black text-slate-900">
          ₹{numPrice.toLocaleString("en-IN")}
        </span>
        <span className="text-sm font-semibold text-slate-500 flex items-center gap-1">
          onwards
          <span title="Price may vary based on size/color selection" className="cursor-help text-slate-400 hover:text-slate-600">
            <Info className="h-3.5 w-3.5" />
          </span>
        </span>

        {numMrp > numPrice && (
          <div className="flex items-center gap-2 ml-1">
            <span className="text-sm font-semibold text-slate-400 line-through">
              ₹{numMrp.toLocaleString("en-IN")}
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-700">
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </div>

      {/* 3. Rating & Reviews Pill (Screenshot 3) */}
      <div className="mt-3.5 flex items-center gap-2.5 flex-wrap border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-700 px-2 py-0.5 text-xs font-black text-white shadow-xs">
          {rating} <Star className="h-3 w-3 fill-current" />
        </span>
        <span className="text-xs font-semibold text-slate-500">
          {totalRatings.toLocaleString("en-IN")} Ratings, {totalReviews.toLocaleString("en-IN")} Reviews
        </span>
      </div>

      {/* 4. Free Delivery & Tax Assured Tag */}
      <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-1 text-emerald-700 font-bold">
          <Truck className="h-3.5 w-3.5" />{" "}
          {deliveryInfo.isFree && (deliveryInfo.minOrder <= 0 || numPrice >= deliveryInfo.minOrder)
            ? "Free Delivery"
            : `Delivery ₹${deliveryInfo.fee}`}
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-500" /> Inclusive of all taxes
        </span>
      </div>

      {/* 5. Live Inventory Stock Status Badge */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        {isOutOfStock ? (
          <div className="inline-flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-extrabold text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
            <span>Out of Stock — Currently Unavailable</span>
          </div>
        ) : isLowStock ? (
          <div className="inline-flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-extrabold text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span>⚡ Hurry, only {stockCount} items left in stock!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>In Stock ({stockCount} units available)</span>
          </div>
        )}
      </div>
    </div>
  );
}