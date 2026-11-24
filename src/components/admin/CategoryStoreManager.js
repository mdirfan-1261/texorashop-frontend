"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  Check,
  X,
  Percent,
  PackageCheck,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

/* ── UI-only style tokens (light + dark) ── */
const card =
  "rounded-xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-slate-900 dark:ring-slate-800";
const editInput =
  "h-7 rounded-md border px-2 text-xs font-bold tabular-nums outline-none focus:ring-2 focus:ring-orange-300 dark:text-white";

const CATEGORY_DEFAULTS = {
  Fashion: {
    subCategories: [
      "Women Kurtis & Sets",
      "Sarees & Lehengas",
      "Western Tops & Dresses",
      "Men Shirts & T-Shirts",
      "Men Jeans & Trousers",
      "Ethnic Wear",
    ],
    badgeColor: "bg-pink-100 text-pink-700",
    subtitle: "Manage Kurtis, Sarees, Dresses, Shirts, Jeans and Ethnic wear.",
  },
  Mobiles: {
    subCategories: [
      "5G Smartphones",
      "iPhones & Flagships",
      "Budget Smartphones",
      "Mobile Covers & Cases",
      "Fast Chargers & Cables",
      "Power Banks",
    ],
    badgeColor: "bg-blue-100 text-blue-700",
    subtitle: "Manage Smartphones, Accessories, Chargers and Cases.",
  },
  Electronics: {
    subCategories: [
      "Laptops & MacBooks",
      "TWS Earbuds & Headphones",
      "Smartwatches",
      "Bluetooth Speakers",
      "Computer Accessories",
      "Smart TVs & Appliances",
    ],
    badgeColor: "bg-purple-100 text-purple-700",
    subtitle: "Manage Laptops, Audio, Smartwatches and Home Appliances.",
  },
  Footwear: {
    subCategories: [
      "Men Sports & Running Shoes",
      "Casual Sneakers",
      "Women Heels & Flats",
      "Formal Shoes",
      "Sandals & Flip-Flops",
    ],
    badgeColor: "bg-amber-100 text-amber-700",
    subtitle: "Manage Sports shoes, Sneakers, Heels, Flats and Sandals.",
  },
  Bags: {
    subCategories: [
      "Women Handbags & Totes",
      "Laptop Backpacks",
      "Travel Trolleys & Duffles",
      "Sling & Clutch Bags",
      "Men Wallets & Belts",
    ],
    badgeColor: "bg-rose-100 text-rose-700",
    subtitle: "Manage Handbags, Backpacks, Trolleys and Wallets.",
  },
  Beauty: {
    subCategories: [
      "Makeup & Lipsticks",
      "Face Wash & Serums",
      "Sunscreen & Moisturizers",
      "Hair Oils & Shampoos",
      "Perfumes & Fragrances",
    ],
    badgeColor: "bg-emerald-100 text-emerald-700",
    subtitle: "Manage Skincare, Haircare, Makeup and Fragrances.",
  },
  Kids: {
    subCategories: [
      "Boys Clothing Sets",
      "Girls Frocks & Dresses",
      "Toys & Action Figures",
      "Baby Care Essentials",
      "School Bags & Bottles",
    ],
    badgeColor: "bg-yellow-100 text-yellow-700",
    subtitle: "Manage Kids clothing, Toys, Baby essentials and School gear.",
  },
  Grocery: {
    subCategories: [
      "Dry Fruits & Nuts",
      "Cooking Oils & Ghee",
      "Spices & Masalas",
      "Snacks & Biscuits",
      "Tea, Coffee & Beverages",
    ],
    badgeColor: "bg-green-100 text-green-700",
    subtitle: "Manage Staples, Dry Fruits, Oils, Spices and Beverages.",
  },
};

const CACHE_KEY = "texora_products_cache";

export default function CategoryStoreManager({
  category,
  categoryName: propCategoryName,
  title: propTitle,
  subtitle: propSubtitle,
  subCategories: propSubCategories,
  badgeColor: propBadgeColor,
}) {
  // Support both 'category' and 'categoryName'
  const activeCategory = category || propCategoryName || "Fashion";
  const catConfig = CATEGORY_DEFAULTS[activeCategory] || {};

  const subCategories =
    propSubCategories && propSubCategories.length > 0
      ? propSubCategories
      : catConfig.subCategories || [];

  const badgeColor =
    propBadgeColor || catConfig.badgeColor || "bg-orange-100 text-orange-700";

  const title = propTitle || `${activeCategory} Store Management`;
  const subtitle =
    propSubtitle ||
    catConfig.subtitle ||
    `Manage all ${activeCategory} products, subcategories, discount % and stock separately.`;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeSub, setActiveSub] = useState("All");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Quick Inline Price / Discount % / Stock Editor state
  const [quickEditId, setQuickEditId] = useState(null);
  const [qMrp, setQMrp] = useState("");
  const [qPct, setQPct] = useState("");
  const [qPrice, setQPrice] = useState("");
  const [qStock, setQStock] = useState("");
  const [savingQuick, setSavingQuick] = useState(false);

  const fetchCategoryProducts = async (showSpinner = false) => {
    if (showSpinner) setSyncing(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/products?category=${encodeURIComponent(
          activeCategory
        )}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error(`Failed to load ${activeCategory} products:`, err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Instant load from sessionStorage cache if available
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const catFiltered = parsed.filter(
            (p) =>
              p.category &&
              p.category.toLowerCase() === activeCategory.toLowerCase()
          );
          if (catFiltered.length > 0) {
            setProducts(catFiltered);
            setLoading(false);
          }
        }
      }
    } catch (e) {}

    // 2. Fetch fresh category items from MongoDB
    fetchCategoryProducts(false);
  }, [activeCategory]);

  const startQuickEdit = (item) => {
    const p = Number(item.price || 0);
    const m = Number(item.mrp || item.price || 0);
    const pct = m > p && p > 0 ? Math.round(((m - p) / m) * 100) : 0;

    setQuickEditId(item._id);
    setQMrp(String(m));
    setQPct(String(pct));
    setQPrice(String(p));
    setQStock(String(item.stock ?? 25));
  };

  const handleQuickPctChange = (val) => {
    const clean = Math.min(95, Math.max(0, Number(val || 0)));
    setQPct(val === "" ? "" : String(clean));
    const numMrp = Number(qMrp);
    if (numMrp > 0) {
      setQPrice(String(Math.max(1, Math.round(numMrp - (numMrp * clean) / 100))));
    }
  };

  const handleQuickMrpChange = (val) => {
    setQMrp(val);
    const numMrp = Number(val);
    const numPct = Number(qPct);
    if (numMrp > 0 && numPct > 0) {
      setQPrice(
        String(Math.max(1, Math.round(numMrp - (numMrp * numPct) / 100)))
      );
    }
  };

  const handleQuickPriceChange = (val) => {
    setQPrice(val);
    const numP = Number(val);
    const numM = Number(qMrp);
    if (numM > numP && numP > 0) {
      setQPct(String(Math.round(((numM - numP) / numM) * 100)));
    } else {
      setQPct("0");
    }
  };

  const saveQuickEdit = async (id) => {
    setSavingQuick(true);
    try {
      const saved = localStorage.getItem("texora_admin");
      const token = saved ? JSON.parse(saved).token : "";

      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mrp: Number(qMrp || qPrice),
          price: Number(qPrice),
          stock: Number(qStock),
        }),
      });

      if (res.ok) {
        const updatedItem = await res.json();
        setProducts((prev) =>
          prev.map((item) => (item._id === id ? updatedItem : item))
        );
        setQuickEditId(null);
      } else {
        alert("Failed to update product rate/stock");
      }
    } catch (err) {
      alert("Error saving changes");
    } finally {
      setSavingQuick(false);
    }
  };

  const handleDelete = async (id, itemTitle) => {
    if (!window.confirm(`Delete "${itemTitle}" from ${activeCategory} Store?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const saved = localStorage.getItem("texora_admin");
      const token = saved ? JSON.parse(saved).token : "";

      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((item) => item._id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      alert("Error deleting product");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchSub =
      activeSub === "All" ||
      p.subCategory?.toLowerCase().includes(activeSub.toLowerCase());
    const matchSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.subCategory?.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock || 0) <= 10).length;

  /* ── UI-only KPI definitions (values from the totals above) ── */
  const kpis = [
    { label: `Total ${activeCategory} Products`, value: products.length, icon: Sparkles, v: "text-slate-900 dark:text-white", i: "text-orange-500" },
    { label: "Total Inventory Units", value: totalStock, icon: PackageCheck, v: "text-emerald-700 dark:text-emerald-400", i: "text-emerald-500" },
    { label: "Low Stock Items (≤10)", value: lowStockCount, icon: AlertTriangle, v: "text-rose-700 dark:text-rose-400", i: "text-rose-500" },
  ];

  return (
    <div className="space-y-3 p-3 text-slate-800 dark:text-slate-100 sm:p-4">
      {/* Category Header Banner */}
      <div className={`${card} flex flex-col justify-between gap-2.5 px-3.5 py-3 sm:flex-row sm:items-center sm:px-4`}>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href="/admin/products"
              prefetch={false}
              className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-500 transition hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> All Categories
            </Link>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${badgeColor} dark:bg-slate-800 dark:text-slate-100`}
            >
              {activeCategory} Store
            </span>
          </div>

          <h1 className="mt-1 text-lg font-extrabold leading-6 tracking-tight text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h1>
          <p className="mt-0.5 line-clamp-2 text-[11.5px] text-slate-500 dark:text-slate-400 sm:line-clamp-none">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchCategoryProducts(true)}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[11.5px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 sm:flex-none"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-orange-500" : ""}`}
            />
            {syncing ? "Syncing..." : "Refresh"}
          </button>

          <Link
            href={`/admin/products/new?category=${encodeURIComponent(activeCategory)}`}
            prefetch={false}
            className="inline-flex h-8 flex-[2] items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3.5 text-[11.5px] font-bold text-white shadow-sm shadow-orange-500/30 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:flex-none"
          >
            <Plus className="h-3.5 w-3.5" /> Add {activeCategory} Product
          </Link>
        </div>
      </div>

      {/* Quick Category KPI Strip */}
      <div className={`${card} overflow-hidden`}>
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="flex min-w-0 items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-[11px]">
                    {k.label}
                  </p>
                  <p className={`mt-0.5 text-lg font-extrabold leading-6 tabular-nums sm:text-xl ${k.v}`}>
                    {k.value}
                  </p>
                </div>
                <Icon className={`hidden h-5 w-5 shrink-0 sm:block ${k.i}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Subcategory Filter Chips + Search */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800 lg:flex-row lg:items-center">
          {/* chips scroll horizontally on small screens (one compact row) */}
          <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] lg:flex-wrap lg:overflow-visible lg:pb-0">
            <button
              onClick={() => setActiveSub("All")}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-[11.5px] font-semibold transition ${
                activeSub === "All"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              All ({products.length})
            </button>
            {subCategories.map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1 text-[11.5px] font-semibold transition ${
                  activeSub === sub
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="relative w-full shrink-0 lg:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search in ${activeCategory}...`}
              aria-label={`Search in ${activeCategory}`}
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Products Table */}
        {loading && products.length === 0 ? (
          <div className="py-10 text-center text-xs font-semibold text-slate-400">
            Loading {activeCategory} products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
              No products found in {activeCategory} ({activeSub})
            </p>
            <Link
              href={`/admin/products/new?category=${encodeURIComponent(activeCategory)}`}
              prefetch={false}
              className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-500 px-3.5 text-[11.5px] font-bold text-white transition hover:bg-orange-600"
            >
              <Plus className="h-3.5 w-3.5" /> Add First {activeCategory} Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-[10.5px] font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-3.5 py-1.5 font-medium">Product</th>
                  <th className="hidden px-3 py-1.5 font-medium md:table-cell">Subcategory & Specs</th>
                  <th className="px-3 py-1.5 font-medium">MRP (₹)</th>
                  <th className="px-3 py-1.5 font-medium">Discount %</th>
                  <th className="px-3 py-1.5 font-medium">Selling Price (₹)</th>
                  <th className="px-3 py-1.5 font-medium">Stock</th>
                  <th className="px-3.5 py-1.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                {filtered.map((item) => {
                  const isEditing = quickEditId === item._id;
                  const discount =
                    item.mrp > item.price
                      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                      : 0;

                  return (
                    <tr
                      key={item._id}
                      className={`transition ${
                        isEditing
                          ? "bg-orange-50/50 dark:bg-orange-500/5"
                          : "hover:bg-orange-50/30 dark:hover:bg-slate-800/50"
                      }`}
                    >
                      <td className="px-3.5 py-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              item.images?.[0] ||
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"
                            }
                            alt={item.title}
                            width={44}
                            height={44}
                            loading="lazy"
                            className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-1 max-w-[170px] font-semibold leading-4 text-slate-900 dark:text-white sm:max-w-[240px]">
                              {item.title}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Brand: {item.brand || "Texora Choice"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="hidden px-3 py-2 md:table-cell">
                        <span className="rounded bg-slate-100 px-1.5 py-px text-[10.5px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {item.subCategory || "General"}
                        </span>
                        {item.sizes?.length > 0 && (
                          <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-slate-500 dark:text-slate-400">
                            Sizes: {item.sizes.join(", ")}
                          </p>
                        )}
                      </td>

                      {/* MRP */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <input
                            type="number"
                            value={qMrp}
                            onChange={(e) => handleQuickMrpChange(e.target.value)}
                            aria-label="MRP"
                            className={`${editInput} w-20 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-950`}
                          />
                        ) : (
                          <span className="whitespace-nowrap tabular-nums text-slate-400 line-through">
                            ₹
                            {Number(item.mrp || item.price).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        )}
                      </td>

                      {/* Discount % */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <div className="relative w-20">
                            <input
                              type="number"
                              min="0"
                              max="95"
                              value={qPct}
                              onChange={(e) =>
                                handleQuickPctChange(e.target.value)
                              }
                              aria-label="Discount percent"
                              className={`${editInput} w-full border-emerald-400 bg-emerald-50 pr-5 text-emerald-700 dark:border-emerald-500/50 dark:bg-emerald-500/10 dark:text-emerald-300`}
                            />
                            <Percent className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-emerald-600" />
                          </div>
                        ) : (
                          <span className="whitespace-nowrap rounded bg-emerald-50 px-1.5 py-px text-[10.5px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            {discount}% OFF
                          </span>
                        )}
                      </td>

                      {/* Selling Price */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <input
                            type="number"
                            value={qPrice}
                            onChange={(e) =>
                              handleQuickPriceChange(e.target.value)
                            }
                            aria-label="Selling price"
                            className={`${editInput} w-20 border-orange-400 bg-orange-50 text-slate-900 dark:border-orange-500/50 dark:bg-orange-500/10`}
                          />
                        ) : (
                          <span className="whitespace-nowrap text-[13px] font-bold tabular-nums text-slate-900 dark:text-white">
                            ₹{Number(item.price).toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-3 py-2">
                        {isEditing ? (
                          <input
                            type="number"
                            value={qStock}
                            onChange={(e) => setQStock(e.target.value)}
                            aria-label="Stock"
                            className={`${editInput} w-16 border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-950`}
                          />
                        ) : (
                          <span
                            className={`whitespace-nowrap rounded-full px-2 py-px text-[10.5px] font-semibold tabular-nums ${
                              (item.stock ?? 0) <= 10
                                ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                            }`}
                          >
                            {item.stock ?? 0} left
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-2 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => saveQuickEdit(item._id)}
                              disabled={savingQuick}
                              className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <Check className="h-3 w-3" /> {savingQuick ? "..." : "Save"}
                            </button>
                            <button
                              onClick={() => setQuickEditId(null)}
                              aria-label="Cancel quick edit"
                              className="grid h-7 w-7 place-items-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => startQuickEdit(item)}
                              className="h-6 whitespace-nowrap rounded-md bg-emerald-50 px-2 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-600 dark:hover:text-white"
                            >
                              % Rate
                            </button>
                            <Link
                              href={`/admin/products/edit/${item._id}`}
                              prefetch={false}
                              className="inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-md bg-white px-2 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:text-orange-600 hover:ring-orange-400 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:text-orange-400 dark:hover:ring-orange-500/50"
                            >
                              <Edit3 className="h-3 w-3" /> Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(item._id, item.title)}
                              disabled={deletingId === item._id}
                              aria-label={`Delete ${item.title}`}
                              className="grid h-6 w-6 place-items-center rounded-md bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100 transition hover:bg-rose-600 hover:text-white disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-600 dark:hover:text-white"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}