"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Flame, Tag, RefreshCw } from "lucide-react";
import HeroBanner from "@/components/home/HeroBanner";
import Benefits from "@/components/home/Benefits";
import ProductCard from "@/components/product-card/ProductCard";

const FILTER_TABS = [
  { id: "all", label: "All Products" },
  { id: "deals", label: "Top Deals 🔥" },
  { id: "Fashion", label: "Fashion" },
  { id: "Mobiles", label: "Mobiles" },
  { id: "Electronics", label: "Electronics" },
  { id: "under-499", label: "Under ₹499" },
];

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      }
    } catch (e) {
      console.error("Home products fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products based on selected tab
  const displayedProducts = useMemo(() => {
    if (activeTab === "all") return products;

    if (activeTab === "deals") {
      return products.filter((p) => {
        const numPrice = Number(p.price || 0);
        const numMrp = Number(p.mrp || numPrice);
        const discount = numMrp > numPrice ? ((numMrp - numPrice) / numMrp) * 100 : 0;
        return discount >= 25;
      });
    }

    if (activeTab === "under-499") {
      return products.filter((p) => Number(p.price || 0) <= 499);
    }

    return products.filter((p) => p.category === activeTab);
  }, [products, activeTab]);

  return (
    <div className="mx-auto max-w-7xl px-2.5 py-3 sm:px-4 sm:py-5 space-y-4">
      {/* 1. Compact Hero Banner + Quick Deals */}
      <HeroBanner />

      {/* 2. 1-Line Trust Badges */}
      <Benefits />

      {/* 3. Meesho "Products For You" Section */}
      <section className="pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="flex items-center gap-1.5 text-base font-black text-slate-900 sm:text-xl">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span>Products For You</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Lowest prices • Verified suppliers • {displayedProducts.length} items
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-black text-orange-600 hover:underline"
          >
            Explore All ({products.length}) →
          </Link>
        </div>

        {/* Shopsy Filter Tabs (Horizontal Scrollable on Mobile) */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-black transition active:scale-95 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid: Mobile 2-Cols (Compact), Desktop 5-Cols */}
        <div className="mt-3.5">
          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <div
                  key={n}
                  className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="my-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="text-xs font-bold text-slate-400">
                No items found for this selection. Try selecting &quot;All Products&quot;.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className="mt-3 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white hover:bg-orange-600"
              >
                Reset to All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-5">
              {displayedProducts.map((p) => (
                <ProductCard key={p._id || p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}