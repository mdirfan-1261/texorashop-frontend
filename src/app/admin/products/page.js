"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  Shirt,
  Smartphone,
  Laptop,
  Footprints,
  Briefcase,
  Sparkles,
  Baby,
  ShoppingBasket,
  AlertTriangle,
  ArrowUpRight,
  PackageCheck,
} from "lucide-react";

/* ── UI-only style tokens (light + dark) ── */
const card =
  "rounded-xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-slate-900 dark:ring-slate-800";

const CATEGORY_CARDS = [
  {
    name: "Fashion",
    slug: "fashion",
    desc: "Kurtis, Sarees, Menswear, Jeans & Ethnic",
    icon: Shirt,
    color:
      "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/30",
  },
  {
    name: "Mobiles",
    slug: "mobiles",
    desc: "5G Smartphones, iPhones & Mobile Accessories",
    icon: Smartphone,
    color:
      "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30",
  },
  {
    name: "Electronics",
    slug: "electronics",
    desc: "Laptops, Smartwatches, Earbuds & Audio",
    icon: Laptop,
    color:
      "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30",
  },
  {
    name: "Footwear",
    slug: "footwear",
    desc: "Sneakers, Running Shoes, Heels & Sandals",
    icon: Footprints,
    color:
      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30",
  },
  {
    name: "Bags",
    slug: "bags",
    desc: "Handbags, Backpacks, Travel Trolleys & Wallets",
    icon: Briefcase,
    color:
      "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30",
  },
  {
    name: "Beauty",
    slug: "beauty",
    desc: "Makeup, Skincare, Haircare & Perfumes",
    icon: Sparkles,
    color:
      "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/30",
  },
  {
    name: "Kids",
    slug: "kids",
    desc: "Kids Wear, Toys, Baby Care & School Bags",
    icon: Baby,
    color:
      "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30",
  },
  {
    name: "Grocery",
    slug: "grocery",
    desc: "Dry Fruits, Staples, Snacks, Tea & Beverages",
    icon: ShoppingBasket,
    color:
      "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/30",
  },
];

const CACHE_KEY = "texora_products_cache";

export default function AdminCategoriesHubPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [deletingId, setDeletingId] = useState(null);

  const fetchProducts = async (showSpinner = false) => {
    if (showSpinner) setSyncing(true);
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        cache: "no-store",
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {
          // ignore storage quota errors
        }
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    // 1. Load instantly from sessionStorage cache in 0ms
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
          setLoading(false);
        }
      }
    } catch (e) {
      // ignore cache parse error
    }

    // 2. Sync fresh data from MongoDB in background
    fetchProducts(false);
  }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}" permanently from TexoraShop?`)) {
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
        const updated = products.filter((item) => item._id !== id);
        setProducts(updated);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(updated));
        } catch (e) {}
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete product");
      }
    } catch (error) {
      alert("Error deleting product");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      selectedCat === "All" ||
      p.category?.toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch =
      !search ||
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.subCategory?.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-3 p-3 text-slate-800 dark:text-slate-100 sm:p-4">
      {/* Top Banner */}
      <div className="relative flex flex-col justify-between gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-orange-50 via-white to-amber-50/60 px-3.5 py-3 ring-1 ring-orange-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:from-orange-500/10 dark:via-slate-900 dark:to-amber-500/5 dark:ring-orange-500/20 sm:flex-row sm:items-center sm:px-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-700 dark:bg-orange-500/15 dark:text-orange-300">
            <ShoppingBag className="h-3 w-3" /> Category-Wise Store Catalog
          </span>
          <h1 className="mt-1 text-lg font-extrabold leading-6 tracking-tight text-slate-900 dark:text-white sm:text-xl">
            Manage All 8 Store Categories Separately
          </h1>
          <p className="mt-0.5 hidden text-[11.5px] text-slate-500 dark:text-slate-400 sm:block">
            Click any category below to open its dedicated store manager, or add
            a new product directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchProducts(true)}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-white px-3 text-[11.5px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700 sm:flex-none"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-orange-500" : ""}`}
            />
            {syncing ? "Syncing..." : "Refresh"}
          </button>

          <Link
            href="/admin/products/new"
            prefetch={false}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3.5 text-[11.5px] font-bold text-white shadow-sm shadow-orange-500/30 transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 sm:flex-none"
          >
            <Plus className="h-3.5 w-3.5" /> Add New Product
          </Link>
        </div>
      </div>

      {/* 8 Dedicated Category Store Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
        {CATEGORY_CARDS.map((cat) => {
          const Icon = cat.icon;
          const catItems = products.filter(
            (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
          );
          const totalStock = catItems.reduce((s, p) => s + (p.stock || 0), 0);
          const lowStock = catItems.filter((p) => (p.stock || 0) <= 10).length;

          return (
            <div
              key={cat.slug}
              className={`${card} group flex min-w-0 flex-col justify-between p-3 transition hover:ring-orange-300 hover:shadow-md dark:hover:ring-orange-500/40`}
            >
              <div>
                <div className="flex items-start justify-between gap-1.5">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${cat.color}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {catItems.length} Products
                  </span>
                </div>

                <h3 className="mt-2 text-[13px] font-extrabold leading-4 text-slate-900 dark:text-white sm:text-sm">
                  {cat.name} Store
                </h3>
                <p className="mt-0.5 line-clamp-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                  {cat.desc}
                </p>

                <div className="mt-2 flex items-center justify-between gap-1 border-t border-slate-100 pt-2 text-[10.5px] dark:border-slate-800">
                  <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                    <PackageCheck className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    Stock: <strong className="tabular-nums">{totalStock}</strong>
                  </span>
                  {lowStock > 0 ? (
                    <span className="flex items-center gap-1 whitespace-nowrap font-bold text-rose-600 dark:text-rose-400">
                      <AlertTriangle className="h-3 w-3" /> {lowStock} Low
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Healthy</span>
                  )}
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                <Link
                  href={`/admin/products/${cat.slug}`}
                  prefetch={false}
                  className="inline-flex h-7 items-center justify-center gap-1 rounded-lg bg-slate-900 px-2 text-[11px] font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  Manage <ArrowUpRight className="h-3 w-3" />
                </Link>
                <Link
                  href={`/admin/products/new?category=${cat.name}`}
                  prefetch={false}
                  className="inline-flex h-7 items-center justify-center gap-1 rounded-lg bg-orange-50 px-2 text-[11px] font-semibold text-orange-600 ring-1 ring-inset ring-orange-200 transition hover:bg-orange-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30 dark:hover:bg-orange-500 dark:hover:text-white"
                >
                  <Plus className="h-3 w-3" /> Add Item
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Filter & Search Table */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex flex-col justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">
              All Catalog Products (<span className="tabular-nums">{filteredProducts.length}</span>)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Quick search, filter by category, or edit price, MRP & stock
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title, brand, subcategory..."
                aria-label="Search catalog products"
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
              />
            </div>

            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              aria-label="Filter by category"
              className="h-8 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 outline-none focus:border-orange-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="All">All 8 Categories</option>
              {CATEGORY_CARDS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && products.length === 0 ? (
          <div className="py-10 text-center text-xs font-semibold text-slate-400">
            Syncing catalog products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">No products found</p>
            <p className="mt-0.5 text-xs text-slate-400">
              Try clearing your filter or add a new product to this category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-[10.5px] font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <th className="px-3.5 py-1.5 font-medium">Product</th>
                  <th className="hidden px-3 py-1.5 font-medium md:table-cell">Category</th>
                  <th className="px-3 py-1.5 font-medium">Selling Price</th>
                  <th className="hidden px-3 py-1.5 font-medium sm:table-cell">MRP</th>
                  <th className="px-3 py-1.5 font-medium">Stock</th>
                  <th className="px-3.5 py-1.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                {filteredProducts.map((item) => {
                  const discount =
                    item.mrp > item.price
                      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
                      : 0;
                  return (
                    <tr
                      key={item._id}
                      className="transition hover:bg-orange-50/40 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-3.5 py-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              item.images?.[0] ||
                              "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"
                            }
                            alt={item.title}
                            loading="lazy"
                            className="h-9 w-9 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div className="min-w-0">
                            <p className="line-clamp-1 max-w-[180px] font-semibold leading-4 text-slate-900 dark:text-white sm:max-w-[260px]">
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
                          {item.category}
                        </span>
                        {item.subCategory && (
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {item.subCategory}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 font-bold tabular-nums text-slate-900 dark:text-white">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                        {discount > 0 && (
                          <span className="ml-1.5 rounded bg-emerald-50 px-1 py-px text-[10px] font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                            {discount}% OFF
                          </span>
                        )}
                      </td>
                      <td className="hidden whitespace-nowrap px-3 py-2 tabular-nums text-slate-400 line-through sm:table-cell">
                        ₹{Number(item.mrp || item.price).toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`whitespace-nowrap rounded-full px-2 py-px text-[10.5px] font-semibold tabular-nums ${
                            (item.stock ?? 0) <= 10
                              ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300"
                              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
                          }`}
                        >
                          {item.stock ?? 0} in stock
                        </span>
                      </td>
                      <td className="px-3.5 py-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/products/edit/${item._id}`}
                            prefetch={false}
                            className="inline-flex h-6 items-center gap-1 rounded-md bg-white px-2 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:text-orange-600 hover:ring-orange-400 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:text-orange-400 dark:hover:ring-orange-500/50"
                          >
                            <Edit3 className="h-3 w-3" /> Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id, item.title)}
                            disabled={deletingId === item._id}
                            className="inline-flex h-6 items-center gap-1 rounded-md bg-rose-50 px-2 text-[11px] font-semibold text-rose-600 ring-1 ring-inset ring-rose-100 transition hover:bg-rose-600 hover:text-white disabled:opacity-50 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-600 dark:hover:text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                            {deletingId === item._id ? "..." : "Delete"}
                          </button>
                        </div>
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