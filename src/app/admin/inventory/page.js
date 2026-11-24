"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Boxes,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  Save,
  Package,
  Layers,
  ArrowUpRight,
  Filter,
} from "lucide-react";

/* ── UI-only style tokens (light + dark) ── */
const card =
  "rounded-xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-slate-900 dark:ring-slate-800";
const stepBtn =
  "grid h-6 w-6 place-items-center rounded-md bg-white text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState("all"); // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [savingId, setSavingId] = useState(null);

  // Local draft stock values so user can edit in inputs
  const [stockDrafts, setStockDrafts] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAdminToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) return token;
      const saved = localStorage.getItem("texora_admin");
      return saved ? JSON.parse(saved).token || "" : "";
    } catch {
      return "";
    }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/products", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.products || [];
        setProducts(list);

        // Populate initial stock drafts
        const drafts = {};
        list.forEach((p) => {
          drafts[p._id] = p.stock !== undefined ? p.stock : 25;
        });
        setStockDrafts(drafts);
      }
    } catch (e) {
      showToast("Failed to load inventory from server", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Update Draft
  const handleDraftChange = (id, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setStockDrafts((prev) => ({ ...prev, [id]: num }));
  };

  const handleAdjustDraft = (id, delta) => {
    setStockDrafts((prev) => {
      const curr = prev[id] !== undefined ? prev[id] : 0;
      const next = Math.max(0, curr + delta);
      return { ...prev, [id]: next };
    });
  };

  // Save stock to MongoDB
  const handleSaveStock = async (product) => {
    const id = product._id;
    const newStock = stockDrafts[id] !== undefined ? stockDrafts[id] : product.stock;
    setSavingId(id);

    try {
      const token = getAdminToken();
      const res = await fetch(`http://localhost:5000/api/products/${id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, stock: newStock } : p))
        );
        showToast(`Stock for "${product.title}" updated to ${newStock}!`);
      } else {
        showToast("Error updating stock. Please try again.", "error");
      }
    } catch (err) {
      showToast("Network error. Backend unreachable.", "error");
    } finally {
      setSavingId(null);
    }
  };

  // Quick preset: Mark Out of Stock (0)
  const handleSetZero = async (product) => {
    setStockDrafts((prev) => ({ ...prev, [product._id]: 0 }));
    const id = product._id;
    setSavingId(id);
    try {
      const token = getAdminToken();
      const res = await fetch(`http://localhost:5000/api/products/${id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stock: 0 }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, stock: 0 } : p))
        );
        showToast(`"${product.title}" is now marked OUT OF STOCK!`, "info");
      }
    } catch (e) {
      showToast("Failed to mark out of stock", "error");
    } finally {
      setSavingId(null);
    }
  };

  // Quick preset: Restock 50 units
  const handleRestock50 = async (product) => {
    const nextStock = (product.stock || 0) + 50;
    setStockDrafts((prev) => ({ ...prev, [product._id]: nextStock }));
    const id = product._id;
    setSavingId(id);
    try {
      const token = getAdminToken();
      const res = await fetch(`http://localhost:5000/api/products/${id}/stock`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ stock: nextStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, stock: nextStock } : p))
        );
        showToast(`Restocked +50 units for "${product.title}"!`);
      }
    } catch (e) {
      showToast("Failed to restock", "error");
    } finally {
      setSavingId(null);
    }
  };

  // KPI Calculations
  const stats = useMemo(() => {
    let total = products.length;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach((p) => {
      const s = Number(p.stock !== undefined ? p.stock : 25);
      if (s <= 0) outOfStock++;
      else if (s <= 5) lowStock++;
      else inStock++;
    });

    return { total, inStock, lowStock, outOfStock };
  }, [products]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const stock = Number(p.stock !== undefined ? p.stock : 25);

      // Search match
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q);

      // Category match
      const matchCat =
        categoryFilter === "all" ||
        p.category?.toLowerCase() === categoryFilter.toLowerCase();

      // Tab match
      let matchTab = true;
      if (filterTab === "in_stock") matchTab = stock > 5;
      else if (filterTab === "low_stock") matchTab = stock > 0 && stock <= 5;
      else if (filterTab === "out_of_stock") matchTab = stock <= 0;

      return matchSearch && matchCat && matchTab;
    });
  }, [products, search, filterTab, categoryFilter]);

  /* ── UI-only KPI definitions (values come from `stats` above) ── */
  const kpis = [
    { label: "Total SKUs", value: stats.total, sub: "Catalog Products", icon: Package, v: "text-slate-900 dark:text-white", i: "text-slate-400 dark:text-slate-500" },
    { label: "In Stock", value: stats.inStock, sub: "> 5 units ready", icon: CheckCircle2, v: "text-emerald-700 dark:text-emerald-400", i: "text-emerald-500 dark:text-emerald-400" },
    { label: "Low Stock", value: stats.lowStock, sub: "1 - 5 units remaining", icon: AlertTriangle, v: "text-amber-700 dark:text-amber-400", i: "text-amber-500 dark:text-amber-400" },
    { label: "Out of Stock", value: stats.outOfStock, sub: "0 units (Critical)", icon: XCircle, v: "text-rose-700 dark:text-rose-400", i: "text-rose-500 dark:text-rose-400" },
  ];

  return (
    <div className="space-y-3 p-3 text-slate-800 dark:text-slate-100 sm:p-4">
      {/* Toast Alert */}
      {toast && (
        <div
          role="status"
          className={`fixed right-3 top-16 z-50 flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-lg px-3 py-2 text-[11.5px] font-semibold text-white shadow-xl transition-all sm:right-5 ${
            toast.type === "error"
              ? "bg-rose-600"
              : toast.type === "info"
              ? "bg-slate-900 ring-1 ring-white/10"
              : "bg-emerald-600"
          }`}
        >
          {toast.type === "error" ? (
            <XCircle size={15} className="shrink-0" />
          ) : (
            <CheckCircle2 size={15} className="shrink-0" />
          )}
          <span className="truncate">{toast.msg}</span>
        </div>
      )}

      {/* Top Header */}
      <div className={`${card} flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-3 sm:px-4`}>
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-600 ring-1 ring-inset ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30">
            <Boxes className="h-3 w-3" /> Live Inventory & Stock Ledger
          </span>
          <h1 className="mt-1 text-lg font-extrabold leading-6 tracking-tight text-slate-900 dark:text-white sm:text-xl">
            Inventory & Stock Management
          </h1>
          <p className="mt-0.5 hidden text-[11.5px] text-slate-500 dark:text-slate-400 sm:block">
            Stock decreases automatically upon customer order. Out-of-stock items are disabled on the storefront.
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-white px-3 text-[11.5px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
        >
          <RefreshCw
            size={13}
            className={loading ? "animate-spin text-orange-500" : ""}
          />
          <span>Sync DB</span>
        </button>
      </div>

      {/* 4 Metric KPI Strip */}
      <div className={`${card} overflow-hidden`}>
        <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 lg:grid-cols-4 [&>*]:border-slate-100 dark:[&>*]:border-slate-800 max-lg:[&>*:nth-child(n+3)]:border-t">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="min-w-0 px-3 py-2.5 sm:px-3.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{k.label}</span>
                  <Icon size={14} className={`shrink-0 ${k.i}`} />
                </div>
                <p className={`mt-0.5 text-lg font-extrabold leading-6 tabular-nums ${k.v}`}>{k.value}</p>
                <p className="truncate text-[10.5px] text-slate-400 dark:text-slate-500">{k.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className={`${card} flex flex-col items-stretch justify-between gap-2 p-2.5 lg:flex-row lg:items-center`}>
        {/* Filter Tabs */}
        <div className="flex items-center gap-0.5 overflow-x-auto rounded-lg bg-slate-100 p-0.5 [scrollbar-width:none] dark:bg-slate-800/70">
          {[
            { id: "all", label: "All Items", count: stats.total },
            { id: "in_stock", label: "In Stock", count: stats.inStock },
            { id: "low_stock", label: "Low Stock", count: stats.lowStock },
            { id: "out_of_stock", label: "Out of Stock", count: stats.outOfStock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id)}
              className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1 text-[11.5px] font-semibold transition ${
                filterTab === tab.id
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold tabular-nums ${
                  filterTab === tab.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 lg:w-60 lg:flex-none">
            <Search
              size={13}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search product or brand..."
              aria-label="Search products"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs font-medium text-slate-900 transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
            />
          </div>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by category"
              className="h-8 shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-700 focus:border-orange-400 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10.5px] font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="px-3.5 py-1.5 font-medium">Product</th>
                <th className="hidden px-3 py-1.5 font-medium md:table-cell">Category</th>
                <th className="px-3 py-1.5 text-right font-medium">Price</th>
                <th className="px-3 py-1.5 font-medium">Live Status</th>
                <th className="px-3 py-1.5 text-center font-medium">Adjust Stock</th>
                <th className="px-3.5 py-1.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <RefreshCw className="mx-auto mb-1.5 h-5 w-5 animate-spin text-orange-500" />
                    <span>Loading products from database...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Package className="mx-auto mb-1.5 h-7 w-7 text-slate-300 dark:text-slate-600" />
                    <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">No products match this filter.</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">Try clearing your search query or tab filter.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const currentStock = p.stock !== undefined ? p.stock : 25;
                  const draft =
                    stockDrafts[p._id] !== undefined
                      ? stockDrafts[p._id]
                      : currentStock;
                  const isModified = draft !== currentStock;

                  let statusBadge = null;
                  if (currentStock <= 0) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-rose-50 px-1.5 py-px text-[10.5px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30">
                        <XCircle size={11} /> Out of Stock (0)
                      </span>
                    );
                  } else if (currentStock <= 5) {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-amber-50 px-1.5 py-px text-[10.5px] font-semibold text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
                        <AlertTriangle size={11} /> Only {currentStock} left!
                      </span>
                    );
                  } else {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-emerald-50 px-1.5 py-px text-[10.5px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30">
                        <CheckCircle2 size={11} /> In Stock ({currentStock})
                      </span>
                    );
                  }

                  const img =
                    (Array.isArray(p.images) && p.images[0]) ||
                    p.image ||
                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200";

                  return (
                    <tr
                      key={p._id}
                      className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      {/* Product Thumbnail & Title */}
                      <td className="px-3.5 py-2">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                            <img
                              src={img}
                              alt={p.title || p.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/products/${p.slug || p._id}`}
                              target="_blank"
                              className="flex max-w-[190px] items-center gap-1 font-semibold leading-4 text-slate-900 transition hover:text-orange-600 dark:text-white dark:hover:text-orange-400 sm:max-w-[260px]"
                            >
                              <span className="truncate">{p.title || p.name}</span>
                              <ArrowUpRight size={11} className="shrink-0 text-slate-400" />
                            </Link>
                            <p className="max-w-[190px] truncate font-mono text-[10px] text-slate-400 sm:max-w-[260px]">
                              ID: {p._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="hidden px-3 py-2 md:table-cell">
                        <span className="rounded-full bg-slate-100 px-2 py-px text-[10.5px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                          {p.category || "General"}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="whitespace-nowrap px-3 py-2 text-right font-bold tabular-nums text-slate-900 dark:text-white">
                        ₹{Number(p.price || 0).toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2">{statusBadge}</td>

                      {/* Adjust Stock Counter & Direct Input */}
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAdjustDraft(p._id, -1)}
                            className={stepBtn}
                            title="Decrement 1"
                            aria-label="Decrease stock by 1"
                          >
                            <Minus size={11} />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={draft}
                            aria-label={`Stock for ${p.title || p.name}`}
                            onChange={(e) =>
                              handleDraftChange(p._id, e.target.value)
                            }
                            className={`h-6 w-12 rounded-md border text-center text-xs font-bold tabular-nums transition ${
                              isModified
                                ? "border-orange-400 bg-orange-50 text-orange-700 ring-2 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30"
                                : "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            } focus:outline-none focus:ring-2 focus:ring-orange-300`}
                          />

                          <button
                            type="button"
                            onClick={() => handleAdjustDraft(p._id, 1)}
                            className={stepBtn}
                            title="Increment 1"
                            aria-label="Increase stock by 1"
                          >
                            <Plus size={11} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAdjustDraft(p._id, 10)}
                            className="h-6 rounded-md bg-slate-100 px-1.5 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700"
                            title="Add 10 units"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Save Button */}
                          <button
                            type="button"
                            disabled={savingId === p._id}
                            onClick={() => handleSaveStock(p)}
                            className={`inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg px-2.5 text-[11.5px] font-semibold text-white shadow-xs transition disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900 ${
                              isModified
                                ? "animate-pulse bg-orange-500 hover:bg-orange-600 motion-reduce:animate-none"
                                : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                            }`}
                          >
                            {savingId === p._id ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : (
                              <Save size={12} />
                            )}
                            <span>Save</span>
                          </button>

                          {/* Quick Out of Stock Preset */}
                          {currentStock > 0 && (
                            <button
                              type="button"
                              onClick={() => handleSetZero(p)}
                              className="h-7 rounded-lg px-2 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 dark:text-rose-300 dark:ring-rose-500/30 dark:hover:bg-rose-500/10"
                              title="Mark 0 Out of Stock immediately"
                            >
                              0 Out
                            </button>
                          )}

                          {/* Quick Restock 50 */}
                          {currentStock <= 5 && (
                            <button
                              type="button"
                              onClick={() => handleRestock50(p)}
                              className="h-7 whitespace-nowrap rounded-lg px-2 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-50 dark:text-emerald-300 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/10"
                              title="Add +50 units immediately"
                            >
                              +50 Stock
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}