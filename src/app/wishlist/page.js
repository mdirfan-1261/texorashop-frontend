"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Trash2 } from "lucide-react";
import ProductCard from "@/components/product-card/ProductCard";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("texora_wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setWishlist(parsed);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleClearWishlist = () => {
    localStorage.removeItem("texora_wishlist");
    setWishlist([]);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Heart className="text-rose-500 fill-rose-500" size={22} />
              <span>My Saved Wishlist ({wishlist.length})</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Your favorite saved styles, gadgets, and deals in one place
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="inline-flex items-center gap-1.5 border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 px-3.5 py-2 rounded-xl text-xs font-bold transition"
            >
              <Trash2 size={14} />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Empty State or Grid */}
        {wishlist.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto my-10 shadow-2xs">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart size={32} />
            </div>
            <h3 className="text-base font-black text-gray-900">Your wishlist is empty</h3>
            <p className="text-xs text-gray-500 mt-1.5 mb-6 leading-relaxed">
              Explore our catalog and save your favorite fashion, footwear, and electronics for later!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20"
            >
              <span>Explore Top Deals</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {wishlist.map((item) => (
              <ProductCard key={item._id || item.id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}