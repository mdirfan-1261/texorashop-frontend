"use client";

import Link from "next/link";
import { Store, Star, ShieldCheck, ChevronRight, PackageCheck } from "lucide-react";

export default function ProductSellerCard({
  sellerName = "Texora Verified Trader",
  rating = "3.9",
  ratingsCount = 961,
  productsCount = 60,
  category = "Store",
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase">
          Sold By
        </h2>
        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
          <ShieldCheck className="h-3.5 w-3.5" /> Verified Supplier
        </span>
      </div>

      {/* Main Vendor Row (Screenshot 4) */}
      <div className="mt-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 hover:text-orange-600 transition">
              {sellerName}
            </h3>
            <p className="text-[11px] font-medium text-slate-400">
              Trusted supplier for {category}
            </p>
          </div>
        </div>

        {/* View Shop Button */}
        <Link
          href={`/products?brand=${encodeURIComponent(sellerName)}`}
          className="rounded-xl border border-orange-500 bg-white px-3.5 py-1.5 text-xs font-black text-orange-600 shadow-2xs transition hover:bg-orange-50 active:scale-95"
        >
          View Shop
        </Link>
      </div>

      {/* Supplier Metrics Grid (Screenshot 4: 3.9 ★ 961 Ratings | 60 Products) */}
      <div className="mt-4 grid grid-cols-2 divide-x divide-slate-100 rounded-xl bg-slate-50/70 p-3 text-center text-xs">
        <div className="pr-2">
          <div className="flex items-center justify-center gap-1">
            <span className="inline-flex items-center gap-0.5 rounded-md bg-emerald-700 px-1.5 py-0.5 text-[10px] font-black text-white">
              {rating} <Star className="h-2.5 w-2.5 fill-current" />
            </span>
            <span className="text-[11px] font-bold text-slate-700">
              {ratingsCount.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400 font-semibold">Ratings & Reviews</p>
        </div>

        <div className="pl-2">
          <div className="flex items-center justify-center gap-1 text-slate-800 font-bold text-[11px]">
            <PackageCheck className="h-3.5 w-3.5 text-orange-500" />
            <span>{productsCount}+ Items</span>
          </div>
          <p className="mt-0.5 text-[10px] text-slate-400 font-semibold">Listed in Store</p>
        </div>
      </div>
    </div>
  );
}