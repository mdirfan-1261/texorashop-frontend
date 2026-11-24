"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ArrowUpDown, ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card/ProductCard";

export default function BestSellersPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    async function fetchBestSellers() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/products?bestSeller=true", {
          cache: "no-store",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          // If flag data empty, fallback to popular items
          if (data.length > 0) {
            setProducts(data);
          } else {
            const allRes = await fetch("http://localhost:5000/api/products");
            const all = await allRes.json();
            setProducts(Array.isArray(all) ? all.slice(0, 15) : []);
          }
        }
      } catch (err) {
        console.error("Failed to load best sellers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBestSellers();
  }, []);

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "price_asc") return Number(a.price) - Number(b.price);
    if (sortBy === "price_desc") return Number(b.price) - Number(a.price);
    if (sortBy === "discount") {
      const discA = a.mrp > a.price ? Math.round(((a.mrp - a.price) / a.mrp) * 100) : 0;
      const discB = b.mrp > b.price ? Math.round(((b.mrp - b.price) / b.mrp) * 100) : 0;
      return discB - discA;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-slate-500">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-bold text-slate-800">Best Sellers</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-transparent bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">
            <Flame className="h-3.5 w-3.5 text-rose-600 fill-current" /> MOST POPULAR
          </span>
          <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
            Best Selling Products
          </h1>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            Top customer-rated favorites flying off the shelves with verified ratings.
          </p>
        </div>
      </div>

      {/* Grid Area */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
          <p className="text-xs font-semibold text-slate-600">
            Showing <strong className="text-slate-900">{sorted.length}</strong> top sellers
          </p>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
            >
              <option value="default">Sort: Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Discount %</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="mt-3 text-xs font-bold text-slate-500">Loading best sellers...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xs font-bold text-slate-400">No best seller items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sorted.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}