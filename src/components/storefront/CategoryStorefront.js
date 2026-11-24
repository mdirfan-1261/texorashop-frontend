"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Filter,
  X,
  Star,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import ProductCard from "@/components/product-card/ProductCard";

const PRICE_RANGES = [
  { id: "under-499", label: "Under ₹499", min: 0, max: 499 },
  { id: "500-999", label: "₹500 - ₹999", min: 500, max: 999 },
  { id: "1000-2499", label: "₹1,000 - ₹2,499", min: 1000, max: 2499 },
  { id: "2500-above", label: "₹2,500 & Above", min: 2500, max: Infinity },
];

const DISCOUNT_RANGES = [
  { id: "10", label: "10% and above", min: 10 },
  { id: "20", label: "20% and above", min: 20 },
  { id: "30", label: "30% and above", min: 30 },
  { id: "50", label: "50% and above", min: 50 },
];

const RATING_RANGES = [
  { id: "4", label: "4.0★ & above", min: 4.0 },
  { id: "3", label: "3.5★ & above", min: 3.5 },
];

function CategoryStorefrontContent({
  categoryName = "Fashion",
  title = "Fashion Collection",
  subtitle = "Discover trending apparel, ethnic wear and western styles.",
  subCategories = [],
}) {
  const searchParams = useSearchParams();
  const urlSub = searchParams.get("sub");
  const urlSearch = searchParams.get("search");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shopsy / Meesho Filter States
  const [selectedSubs, setSelectedSubs] = useState(urlSub ? [urlSub] : []);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [search, setSearch] = useState(urlSearch || "");
  const [sortBy, setSortBy] = useState("popularity"); // Shopsy default

  // Collapsible Accordions
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    discount: true,
    rating: true,
  });

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (urlSub) {
      setSelectedSubs([urlSub]);
    }
  }, [urlSub]);

  useEffect(() => {
    if (urlSearch !== null && urlSearch !== undefined) {
      setSearch(urlSearch);
    }
  }, [urlSearch]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/products", {
          cache: "no-store",
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          const catItems =
            !categoryName || categoryName.toLowerCase() === "all"
              ? data
              : data.filter(
                  (p) => p.category?.toLowerCase() === categoryName.toLowerCase()
                );
          setProducts(catItems);
        }
      } catch (err) {
        console.error(`Failed to load ${categoryName} products:`, err);
      } finally {
        setLoading(false);
      }
    }

    if (categoryName) {
      fetchProducts();
    }
  }, [categoryName]);

  const toggleSub = (sub) => {
    setSelectedSubs((prev) =>
      prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
    );
  };

  const togglePrice = (id) => {
    setSelectedPrices((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const toggleDiscount = (id) => {
    setSelectedDiscounts((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleRating = (id) => {
    setSelectedRatings((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSelectedSubs([]);
    setSelectedPrices([]);
    setSelectedDiscounts([]);
    setSelectedRatings([]);
    setSearch("");
    setSortBy("popularity");
  };

  const activeFiltersCount =
    selectedSubs.length +
    selectedPrices.length +
    selectedDiscounts.length +
    selectedRatings.length;

  // Filter Computation
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSub =
        selectedSubs.length === 0 ||
        selectedSubs.some((s) => {
          const sLower = s.toLowerCase();
          const pSubLower = (p.subCategory || "").toLowerCase();
          const pTitleLower = (p.title || p.name || "").toLowerCase();
          return (
            (pSubLower && (pSubLower.includes(sLower) || sLower.includes(pSubLower))) ||
            pTitleLower.includes(sLower)
          );
        });

      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q);

      const pPrice = Number(p.price || 0);
      const matchPrice =
        selectedPrices.length === 0 ||
        selectedPrices.some((priceId) => {
          const range = PRICE_RANGES.find((r) => r.id === priceId);
          return range && pPrice >= range.min && pPrice <= range.max;
        });

      const pMrp = Number(p.mrp || pPrice);
      const discount =
        pMrp > pPrice && pPrice > 0
          ? Math.round(((pMrp - pPrice) / pMrp) * 100)
          : 0;
      const matchDiscount =
        selectedDiscounts.length === 0 ||
        selectedDiscounts.some((discId) => {
          const range = DISCOUNT_RANGES.find((d) => d.id === discId);
          return range && discount >= range.min;
        });

      const rating = Number(p.rating || 4.3);
      const matchRating =
        selectedRatings.length === 0 ||
        selectedRatings.some((rateId) => {
          const range = RATING_RANGES.find((r) => r.id === rateId);
          return range && rating >= range.min;
        });

      return matchSub && matchSearch && matchPrice && matchDiscount && matchRating;
    });
  }, [products, selectedSubs, search, selectedPrices, selectedDiscounts, selectedRatings]);

  // Shopsy Sort Computation
  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortBy === "price_asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "price_desc") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === "discount") {
      list.sort((a, b) => {
        const discA = a.mrp > a.price ? Math.round(((a.mrp - a.price) / a.mrp) * 100) : 0;
        const discB = b.mrp > b.price ? Math.round(((b.mrp - b.price) / b.mrp) * 100) : 0;
        return discB - discA;
      });
    }
    return list; // 'popularity' uses default order
  }, [filtered, sortBy]);

  // Sidebar Filter Component
  const FilterSidebar = (
    <div className="space-y-4">
      {/* Filters Header + Clear All (Shopsy Style) */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black tracking-wider text-slate-900 uppercase">
          Filters
        </h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-black text-orange-600 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filter Chips (Shopsy [X] Badges) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
          {selectedSubs.map((sub) => (
            <span
              key={sub}
              onClick={() => toggleSub(sub)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
            >
              <X className="h-3 w-3 text-slate-400" /> {sub}
            </span>
          ))}
          {selectedPrices.map((pId) => {
            const range = PRICE_RANGES.find((r) => r.id === pId);
            return (
              <span
                key={pId}
                onClick={() => togglePrice(pId)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
              >
                <X className="h-3 w-3 text-slate-400" /> {range?.label}
              </span>
            );
          })}
        </div>
      )}

      {/* 1. Category Accordion */}
      {subCategories.length > 0 && (
        <div className="border-b border-slate-100 pb-3.5">
          <button
            onClick={() => toggleSection("categories")}
            className="flex w-full items-center justify-between text-xs font-black text-slate-800 uppercase tracking-wider"
          >
            <span>Category</span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${
                openSections.categories ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.categories && (
            <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
              {subCategories.map((sub) => {
                const checked = selectedSubs.includes(sub);
                const count = products.filter((p) => {
                  const sLower = sub.toLowerCase();
                  const pSubLower = (p.subCategory || "").toLowerCase();
                  const pTitleLower = (p.title || p.name || "").toLowerCase();
                  return (
                    (pSubLower && (pSubLower.includes(sLower) || sLower.includes(pSubLower))) ||
                    pTitleLower.includes(sLower)
                  );
                }).length;
                return (
                  <label
                    key={sub}
                    className="flex cursor-pointer items-center justify-between text-xs text-slate-600 hover:text-slate-900"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSub(sub)}
                        className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
                      />
                      <span className={checked ? "font-bold text-slate-900" : ""}>
                        {sub}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">({count})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. Price Accordion */}
      <div className="border-b border-slate-100 pb-3.5">
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between text-xs font-black text-slate-800 uppercase tracking-wider"
        >
          <span>Price</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              openSections.price ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-2">
            {PRICE_RANGES.map((pr) => {
              const checked = selectedPrices.includes(pr.id);
              return (
                <label
                  key={pr.id}
                  className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePrice(pr.id)}
                    className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
                  />
                  <span className={checked ? "font-bold text-slate-900" : ""}>
                    {pr.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Discount Accordion */}
      <div className="border-b border-slate-100 pb-3.5">
        <button
          onClick={() => toggleSection("discount")}
          className="flex w-full items-center justify-between text-xs font-black text-slate-800 uppercase tracking-wider"
        >
          <span>Discount</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              openSections.discount ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.discount && (
          <div className="mt-3 space-y-2">
            {DISCOUNT_RANGES.map((dr) => {
              const checked = selectedDiscounts.includes(dr.id);
              return (
                <label
                  key={dr.id}
                  className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDiscount(dr.id)}
                    className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
                  />
                  <span className={checked ? "font-bold text-emerald-700" : ""}>
                    {dr.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Rating Accordion */}
      <div>
        <button
          onClick={() => toggleSection("rating")}
          className="flex w-full items-center justify-between text-xs font-black text-slate-800 uppercase tracking-wider"
        >
          <span>Customer Rating</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform ${
              openSections.rating ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.rating && (
          <div className="mt-3 space-y-2">
            {RATING_RANGES.map((rr) => {
              const checked = selectedRatings.includes(rr.id);
              return (
                <label
                  key={rr.id}
                  className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleRating(rr.id)}
                    className="h-4 w-4 rounded accent-orange-500 cursor-pointer"
                  />
                  <span className={checked ? "font-bold text-slate-900" : ""}>
                    {rr.label}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Breadcrumb Strip */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-3 text-xs text-slate-500">
          <Link href="/" className="hover:text-orange-600">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <Link href="/products" className="hover:text-orange-600">
            Shop
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-bold text-slate-800">{categoryName}</span>
          {selectedSubs.length === 1 && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-bold text-orange-600">{selectedSubs[0]}</span>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* Title Header */}
        <div className="mb-4">
          <h1 className="text-xl font-black text-slate-900 md:text-2xl">
            {selectedSubs.length === 1 ? selectedSubs[0] : title}
          </h1>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* SHOPSY-STYLE HORIZONTAL SORTING BAR */}
        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-black text-white shadow-xs md:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>

            <p className="text-xs font-semibold text-slate-600">
              Showing{" "}
              <strong className="text-slate-900">{sorted.length}</strong>{" "}
              products
            </p>
          </div>

          {/* Shopsy Horizontal Sort Links */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold scrollbar-none">
            <span className="text-slate-400 pr-1 shrink-0">Sort By:</span>
            {[
              { id: "popularity", label: "Popularity" },
              { id: "price_asc", label: "Price -- Low to High" },
              { id: "price_desc", label: "Price -- High to Low" },
              { id: "discount", label: "Discount %" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSortBy(tab.id)}
                className={`shrink-0 rounded-lg px-2.5 py-1 transition ${
                  sortBy === tab.id
                    ? "border-b-2 border-orange-500 font-black text-orange-600 bg-orange-50/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Layout: Left Sidebar + Product Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* DESKTOP SIDEBAR (3 cols) */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-32 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
              {FilterSidebar}
            </div>
          </aside>

          {/* PRODUCT CARDS (9 cols) */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="py-24 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                <p className="mt-3 text-xs font-bold text-slate-500">
                  Loading {categoryName} collection...
                </p>
              </div>
            ) : sorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="mt-3 text-sm font-black text-slate-900">
                  No products found in {categoryName}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Try clearing your filters or adding new products from Admin.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {sorted.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER BOTTOM DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-xs md:hidden">
          <div className="w-full max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900">
                Filters ({activeFiltersCount})
              </h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4">{FilterSidebar}</div>

            <div className="sticky bottom-0 mt-4 flex gap-2 border-t border-slate-100 bg-white pt-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 rounded-xl bg-orange-500 py-3 text-xs font-black text-white shadow-md shadow-orange-500/30"
              >
                Apply ({sorted.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoryStorefront(props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        </div>
      }
    >
      <CategoryStorefrontContent {...props} />
    </Suspense>
  );
}
