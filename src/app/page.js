
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Sparkles, RefreshCw } from "lucide-react";

import HeroBanner from "@/components/home/HeroBanner";
import Benefits from "@/components/home/Benefits";
import ProductCard from "@/components/product-card/ProductCard";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
)
  .trim()
  .replace(/\/+$/, "");

const getCategoryName = (product) => {
  const category = product?.category;

  if (typeof category === "string") {
    return category.trim();
  }

  if (category && typeof category === "object") {
    return (
      category.name ||
      category.title ||
      category.label ||
      ""
    ).toString().trim();
  }

  if (Array.isArray(product?.categories)) {
    return product.categories
      .map((item) =>
        typeof item === "string"
          ? item.trim()
          : item?.name || item?.title || ""
      )
      .filter(Boolean)[0] || "";
  }

  return "";
};

const normalizeCategory = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const productsUrl = `${API_BASE}/products`;

      console.log("API BASE:", API_BASE);
      console.log("PRODUCTS URL:", productsUrl);

      const response = await fetch(productsUrl, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Products API failed: ${response.status}`);
      }

      const data = await response.json();

      let productList = [];

      if (Array.isArray(data)) {
        productList = data;
      } else if (Array.isArray(data.products)) {
        productList = data.products;
      } else if (Array.isArray(data.data)) {
        productList = data.data;
      } else {
        throw new Error("Invalid products API response.");
      }

      console.log("Products received:", productList.length);
      console.log(
        "Available categories:",
        [...new Set(productList.map(getCategoryName).filter(Boolean))]
      );

      setProducts(productList);
    } catch (err) {
      console.error("Home products fetch error:", err);
      setProducts([]);
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Automatically generate categories from actual API data.
  const filterTabs = useMemo(() => {
    const categories = [
      ...new Map(
        products
          .map((product) => getCategoryName(product))
          .filter(Boolean)
          .map((category) => [
            normalizeCategory(category),
            category,
          ])
      ).values(),
    ];

    return [
      { id: "all", label: "All Products", type: "fixed" },
      { id: "deals", label: "Top Deals 🔥", type: "fixed" },
      ...categories.map((category) => ({
        id: `category:${normalizeCategory(category)}`,
        label: category,
        category,
        type: "category",
      })),
      { id: "under-499", label: "Under ₹499", type: "fixed" },
    ];
  }, [products]);

  const displayedProducts = useMemo(() => {
    if (activeTab === "all") {
      return products;
    }

    if (activeTab === "deals") {
      return products.filter((product) => {
        const price = Number(product.price || 0);
        const mrp = Number(product.mrp || price);

        if (mrp <= price || price <= 0) return false;

        const discount = ((mrp - price) / mrp) * 100;
        return discount >= 25;
      });
    }

    if (activeTab === "under-499") {
      return products.filter(
        (product) =>
          Number(product.price || 0) > 0 &&
          Number(product.price || 0) <= 499
      );
    }

    if (activeTab.startsWith("category:")) {
      const selectedCategory = activeTab.replace("category:", "");

      return products.filter(
        (product) =>
          normalizeCategory(getCategoryName(product)) === selectedCategory
      );
    }

    return products;
  }, [products, activeTab]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 px-2.5 py-3 sm:px-4 sm:py-5">
      <HeroBanner />

      <Benefits />

      <section className="pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="flex items-center gap-1.5 text-base font-black text-slate-900 sm:text-xl">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span>Products For You</span>
            </h2>

            <p className="text-[11px] font-medium text-slate-400">
              Lowest prices • Verified suppliers •{" "}
              {displayedProducts.length} items
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-black text-orange-600 hover:underline"
          >
            Explore All ({products.length}) →
          </Link>
        </div>

        {/* Dynamic Category Filters */}
        <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-black transition active:scale-95 ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3.5">
          {loading ? (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((number) => (
                <div
                  key={number}
                  className="aspect-[3/4] animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : error ? (
            <div className="my-8 rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
              <p className="text-sm font-bold text-red-600">
                Products could not be loaded.
              </p>

              <p className="mt-1 text-xs text-red-500">{error}</p>

              <button
                type="button"
                onClick={loadProducts}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white hover:bg-orange-600"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </button>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="my-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="text-xs font-bold text-slate-400">
                {products.length === 0
                  ? "No products available right now."
                  : "No products found in this selection."}
              </p>

              {products.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="mt-3 rounded-xl bg-orange-500 px-4 py-2 text-xs font-black text-white hover:bg-orange-600"
                >
                  Reset to All Products
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-5">
              {displayedProducts.map((product, index) => (
                <ProductCard
                  key={
                    product._id ||
                    product.slug ||
                    `product-${index}`
                  }
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
