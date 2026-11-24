"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Percent, ArrowUpDown, ChevronRight, Tag, Copy, Check, Sparkles } from "lucide-react";
import ProductCard from "@/components/product-card/ProductCard";

const DEFAULT_COUPONS = [
  { code: "TEXORA50", discount: "₹50 Flat Off", minOrder: 499, active: true },
  { code: "FESTIVE20", discount: "20% Instant Discount", minOrder: 999, active: true },
  { code: "FREESHIP", discount: "100% Free Express Delivery", minOrder: 199, active: true },
];

export default function SpecialOffersPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("discount");
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    // Load active coupons created by Admin in /admin/discounts
    try {
      const saved = localStorage.getItem("texora_coupons");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCoupons(parsed.filter((c) => c.active));
        }
      }
    } catch (e) {}

    async function fetchOffers() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/products", {
          cache: "no-store",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to load special offers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOffers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sorted = [...products].sort((a, b) => {
    if (sortBy === "price_asc") return Number(a.price) - Number(b.price);
    if (sortBy === "price_desc") return Number(b.price) - Number(a.price);
    const discA = a.mrp > a.price ? Math.round(((a.mrp - a.price) / a.mrp) * 100) : 0;
    const discB = b.mrp > b.price ? Math.round(((b.mrp - b.price) / b.mrp) * 100) : 0;
    return discB - discA;
  });

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-slate-500">
          <Link href="/" className="hover:text-orange-600">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-bold text-slate-800">Special Offers & Coupons</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="border-b border-slate-200/80 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700">
            <Percent className="h-3.5 w-3.5 text-orange-600" /> MEGA SAVINGS HUB
          </span>
          <h1 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
            Special Offers & Festive Coupons
          </h1>
          <p className="mt-1 text-xs text-slate-500 md:text-sm">
            Copy exclusive store promo codes below and apply them in your cart for instant discounts!
          </p>

          {/* Live Admin Coupons Grid */}
          {coupons.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {coupons.map((c, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-orange-300 bg-white p-4 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-1 font-mono text-xs font-black text-orange-600 border border-orange-200">
                        <Tag className="h-3 w-3" /> {c.code}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(c.code)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white transition"
                      >
                        {copiedCode === c.code ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="mt-2.5 text-sm font-black text-slate-900">{c.discount}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Valid on orders above <strong>₹{c.minOrder}</strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Discounted Products Grid */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-3">
          <p className="text-xs font-semibold text-slate-600">
            Showing <strong className="text-slate-900">{sorted.length}</strong> special deal products
          </p>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-orange-500"
            >
              <option value="discount">Sort: Biggest Discount %</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            <p className="mt-3 text-xs font-bold text-slate-500">Loading special deals...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xs font-bold text-slate-400">No special offer items found.</p>
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