"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Truck,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight,
  Package as PackageIcon,
} from "lucide-react";

/* ── UI-only style tokens ── */
const card =
  "rounded-xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-slate-900 dark:ring-slate-800";

export default function AdminDashboardPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [syncing, setSyncing] = useState(false);

  // Sync Data function with useCallback (Fixes useEffect dependency warning)
  const fetchDashboardData = useCallback(async () => {
    setSyncing(true);
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("texora_admin") : null;
      const token = saved ? JSON.parse(saved).token : "";

      const [pRes, oRes] = await Promise.all([
        fetch("http://localhost:5000/api/products", { cache: "no-store" }),
        fetch("http://localhost:5000/api/orders", {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (pRes.ok) setProducts(await pRes.json());
      if (oRes.ok) setOrders(await oRes.json());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setTimeout(() => setSyncing(false), 300);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // 1. Live Revenue & Order Metrics
  const totalRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + Number(o.totalPrice || 0), 0);
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === "Pending" || o.status === "Confirmed"
    ).length;
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter((o) => o.status === "Delivered").length;
  }, [orders]);

  // 2. Dynamic Category Distribution
  const categoryStats = useMemo(() => {
    const counts = {
      Fashion: 0,
      Mobiles: 0,
      Electronics: 0,
      Footwear: 0,
      Bags: 0,
      Beauty: 0,
      Kids: 0,
      Grocery: 0,
    };

    products.forEach((p) => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });

    const total = products.length || 1;
    return {
      counts,
      percentages: {
        fashion: Math.round((counts.Fashion / total) * 100),
        tech: Math.round(((counts.Mobiles + counts.Electronics) / total) * 100),
        lifestyle: Math.round(
          ((counts.Footwear +
            counts.Bags +
            counts.Beauty +
            counts.Kids +
            counts.Grocery) /
            total) *
            100
        ),
      },
    };
  }, [products]);

  // 3. Dynamic Month-by-Month Revenue Chart (Last 6 Months from actual orders)
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString("en-IN", { month: "short" });
      const year = d.getFullYear();
      const monthIdx = d.getMonth();

      const monthRevenue = orders
        .filter((o) => {
          if (!o.createdAt || o.status === "Cancelled") return false;
          const orderDate = new Date(o.createdAt);
          return (
            orderDate.getMonth() === monthIdx && orderDate.getFullYear() === year
          );
        })
        .reduce((s, o) => s + Number(o.totalPrice || 0), 0);

      months.push({ label: monthName, revenue: monthRevenue });
    }

    const maxRev = Math.max(...months.map((m) => m.revenue), 10000);

    return months.map((m, idx) => {
      const x = 30 + idx * 105;
      const y = 150 - Math.round((m.revenue / maxRev) * 110);
      return { ...m, x, y };
    });
  }, [orders]);

  // Generate smooth SVG curve path from dynamic points
  const chartPath = useMemo(() => {
    if (monthlyData.length < 2) return "";
    let d = `M ${monthlyData[0].x} ${monthlyData[0].y}`;
    for (let i = 1; i < monthlyData.length; i++) {
      const prev = monthlyData[i - 1];
      const curr = monthlyData[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  }, [monthlyData]);

  const chartAreaPath = useMemo(() => {
    if (!chartPath || monthlyData.length < 2) return "";
    const first = monthlyData[0];
    const last = monthlyData[monthlyData.length - 1];
    return `${chartPath} L ${last.x} 170 L ${first.x} 170 Z`;
  }, [chartPath, monthlyData]);

  // Monthly Target Calculations
  const MONTHLY_TARGET = 500000;
  const targetPercent = Math.min(
    100,
    Math.round((totalRevenue / MONTHLY_TARGET) * 100)
  );

  /* ── UI-only: KPI definitions (values come from the memoised metrics above) ── */
  const kpis = [
    {
      label: "Total Realized Sales",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      tag: "Live",
      tagCls: "text-emerald-600 dark:text-emerald-400",
      tagIcon: true,
      foot: "Real-Time",
      footCls: "text-emerald-600 dark:text-emerald-400",
      icon: IndianRupee,
      iconCls: "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    },
    {
      label: "Customer Orders",
      value: orders.length,
      tag: `${orders.length} Total`,
      tagCls: "text-blue-600 dark:text-blue-400",
      tagIcon: true,
      foot: `${pendingOrders} Pending`,
      footCls: "text-orange-600 dark:text-orange-400",
      icon: Truck,
      iconCls: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      label: "Live Products Catalog",
      value: products.length,
      tag: "8 Stores",
      tagCls: "text-amber-600 dark:text-amber-400",
      tagIcon: false,
      foot: "All Categories",
      footCls: "text-slate-700 dark:text-slate-300",
      icon: ShoppingBag,
      iconCls: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    },
    {
      label: "Delivered Orders",
      value: deliveredOrders,
      tag: `${deliveredOrders} Done`,
      tagCls: "text-emerald-600 dark:text-emerald-400",
      tagIcon: false,
      foot:
        orders.length > 0
          ? `${Math.round((deliveredOrders / orders.length) * 100)}% Fulfillment`
          : "0%",
      footCls: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle2,
      iconCls: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
  ];

  // UI-only: SVG ring math for the monthly goal (uses existing targetPercent)
  const RING_R = 42;
  const RING_C = 2 * Math.PI * RING_R;

  return (
    <div className="space-y-3 p-3 text-slate-800 dark:text-slate-100 sm:p-4">
      {/* 1. Welcome Banner + Live Sync */}
      <div className="relative flex flex-wrap items-center justify-between gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-orange-50 via-amber-50/50 to-white px-3.5 py-3 ring-1 ring-orange-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:from-orange-500/10 dark:via-amber-500/5 dark:to-slate-900 dark:ring-orange-500/20 sm:px-4">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
            <TrendingUp className="h-3 w-3" /> Live Overview
          </p>
          <h1 className="mt-0.5 text-lg font-extrabold leading-6 tracking-tight text-slate-900 dark:text-white sm:text-xl">
            Welcome to <span className="text-orange-600 dark:text-orange-400">TexoraShop Console</span>
          </h1>
          <p className="mt-0.5 hidden text-[11.5px] text-slate-500 dark:text-slate-400 sm:block">
            Live overview of products, customer orders, revenue, inventory and delivery progression.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[11.5px] font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${syncing ? "animate-spin text-orange-500" : ""}`}
            />
            <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync Live Data"}</span>
            <span className="sm:hidden">{syncing ? "…" : "Sync"}</span>
          </button>

          <Link
            href="/admin/products/new"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-orange-500 px-3 text-[11.5px] font-bold text-white shadow-sm shadow-orange-500/25 transition hover:bg-orange-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Add Product
          </Link>
        </div>
      </div>

      {/* 2. Four Live KPI Cards → one compact strip */}
      <div className={`${card} overflow-hidden`}>
        <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 lg:grid-cols-4 [&>*]:border-slate-100 dark:[&>*]:border-slate-800 max-lg:[&>*:nth-child(n+3)]:border-t">
          {kpis.map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="min-w-0 px-3 py-2.5 sm:px-3.5">
                <div className="flex items-center justify-between gap-1">
                  <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${k.iconCls}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`flex items-center gap-0.5 truncate text-[10.5px] font-bold ${k.tagCls}`}>
                    {k.tagIcon && <ArrowUpRight className="h-3 w-3 shrink-0" />} {k.tag}
                  </span>
                </div>
                <p className="mt-1.5 truncate text-lg font-extrabold leading-6 tabular-nums text-slate-900 dark:text-white sm:text-xl">
                  {k.value}
                </p>
                <div className="flex items-center justify-between gap-1 text-[10.5px] text-slate-500 dark:text-slate-400">
                  <span className="truncate">{k.label}</span>
                  <span className={`shrink-0 font-bold ${k.footCls}`}>{k.foot}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Revenue Analytics Graph + Catalog Mix */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Left: Dynamic 6-Month Line Graph */}
        <div className={`${card} px-3.5 py-3 lg:col-span-2`}>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Live Analytics
              </p>
              <h2 className="text-[13px] font-bold leading-4 text-slate-900 dark:text-white">
                Revenue Trend (Last 6 Months)
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10.5px] font-semibold text-orange-600 ring-1 ring-inset ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30">
              Dynamic Live Data
            </span>
          </div>

          {/* scrolls horizontally on very small screens so labels stay readable */}
          <div className="mt-2 overflow-x-auto [scrollbar-width:thin]">
            <svg viewBox="0 0 600 190" className="h-36 w-full min-w-[440px] overflow-visible sm:h-40">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[35, 75, 115, 155].map((y) => (
                <line
                  key={y}
                  x1="20"
                  y1={y}
                  x2="580"
                  y2={y}
                  strokeWidth="1.5"
                  className="stroke-slate-100 dark:stroke-slate-800"
                />
              ))}

              {/* Shaded Area */}
              {chartAreaPath && <path d={chartAreaPath} fill="url(#revGrad)" />}

              {/* Curve Line */}
              {chartPath && (
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              )}

              {/* Data Points */}
              {monthlyData.map((pt) => (
                <g key={pt.label}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4.5"
                    stroke="#f97316"
                    strokeWidth="3"
                    className="fill-white dark:fill-slate-900"
                  />
                  <text
                    x={pt.x}
                    y="182"
                    textAnchor="middle"
                    className="fill-slate-400 text-[12px] font-semibold"
                  >
                    {pt.label}
                  </text>
                  {pt.revenue > 0 && (
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      className="fill-slate-700 text-[11px] font-bold dark:fill-slate-200"
                    >
                      ₹{pt.revenue > 1000 ? `${(pt.revenue / 1000).toFixed(0)}k` : pt.revenue}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Right: Dynamic Category Donut Mix */}
        <div className={`${card} px-3.5 py-3`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Inventory Mix
              </p>
              <h2 className="text-[13px] font-bold leading-4 text-slate-900 dark:text-white">Category Share</h2>
            </div>
            <Link
              href="/admin/products"
              className="text-[11px] font-semibold text-orange-600 hover:underline dark:text-orange-400"
            >
              Manage
            </Link>
          </div>

          <div className="mt-2 flex items-center gap-4 lg:flex-col lg:items-stretch lg:gap-2">
            <div className="relative mx-auto flex h-28 w-28 shrink-0 items-center justify-center lg:my-1">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  strokeWidth="4"
                  className="stroke-slate-100 dark:stroke-slate-800"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="4"
                  strokeDasharray={`${categoryStats.percentages.fashion} 100`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  strokeWidth="4"
                  className="stroke-slate-900 dark:stroke-slate-200"
                  strokeDasharray={`${categoryStats.percentages.tech} 100`}
                  strokeDashoffset={-1 * categoryStats.percentages.fashion}
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray={`${categoryStats.percentages.lifestyle} 100`}
                  strokeDashoffset={-1 * (categoryStats.percentages.fashion + categoryStats.percentages.tech)}
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-xl font-extrabold leading-5 tabular-nums text-slate-900 dark:text-white">{products.length}</p>
                <p className="text-[9.5px] font-semibold uppercase text-slate-400">Items</p>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5 text-[11.5px]">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" /> Fashion
                </span>
                <span className="text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                  {categoryStats.counts.Fashion} items ({categoryStats.percentages.fashion}%)
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-slate-900 dark:bg-slate-200" /> Mobiles & Tech
                </span>
                <span className="text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                  {categoryStats.counts.Mobiles + categoryStats.counts.Electronics} items (
                  {categoryStats.percentages.tech}%)
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" /> Other Categories
                </span>
                <span className="text-right font-semibold tabular-nums text-slate-900 dark:text-white">
                  {products.length -
                    (categoryStats.counts.Fashion +
                      categoryStats.counts.Mobiles +
                      categoryStats.counts.Electronics)}{" "}
                  items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Store Funnel + Dynamic Target Card */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Dynamic Funnel */}
        <div className={`${card} px-3.5 py-3 lg:col-span-2`}>
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">Store Order Flow</h2>
            <span className="rounded-md bg-orange-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              Live Pipeline
            </span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Active Products", val: products.length, sub: "In 8 stores", bg: "bg-orange-100 dark:bg-orange-500/20", h: "h-14" },
              { label: "Total Orders", val: orders.length, sub: "Customer bookings", bg: "bg-orange-200 dark:bg-orange-500/35", h: "h-12" },
              { label: "Processing", val: pendingOrders, sub: "Pending / Confirmed", bg: "bg-orange-400 dark:bg-orange-500/60", h: "h-10" },
              { label: "Completed", val: deliveredOrders, sub: "Delivered", bg: "bg-emerald-500", h: "h-8" },
            ].map((c) => (
              <div key={c.label} className="flex flex-col justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
                <div>
                  <p className="text-[10.5px] font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
                  <p className="mt-0.5 text-lg font-extrabold leading-5 tabular-nums text-slate-900 dark:text-white">{c.val}</p>
                  <span className="text-[10px] font-medium text-slate-400">{c.sub}</span>
                </div>
                <div className="mt-2 flex items-end">
                  <div className={`w-full rounded-md ${c.h} ${c.bg}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Target Card */}
        <div className={`${card} flex flex-col justify-between px-3.5 py-3`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">Monthly Sales Goal</h2>
              <p className="text-[11px] text-slate-400">Target of ₹5,00,000</p>
            </div>
            <p className="text-right text-[11px] font-bold text-slate-800 dark:text-slate-200">
              {targetPercent >= 80 ? "Superb Progress! 🎉" : "Store is Live & Selling!"}
            </p>
          </div>

          <div className="my-2 flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r={RING_R} fill="none" strokeWidth="9" className="stroke-orange-100 dark:stroke-slate-800" />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_R}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${(targetPercent / 100) * RING_C} ${RING_C}`}
                  className="transition-all duration-700 motion-reduce:transition-none"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-xl font-extrabold leading-5 tabular-nums text-slate-900 dark:text-white">{targetPercent}%</p>
                  <p className="text-[9.5px] font-semibold text-emerald-600 dark:text-emerald-400">Real-Time</p>
                </div>
              </div>
            </div>

            <div className="grid min-w-0 flex-1 grid-cols-1 gap-1.5 text-xs">
              <div className="rounded-lg bg-orange-50/70 px-2.5 py-1.5 dark:bg-orange-500/10">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Goal</p>
                <p className="truncate font-bold tabular-nums text-slate-900 dark:text-white">₹5,00,000</p>
              </div>
              <div className="rounded-lg bg-orange-50/70 px-2.5 py-1.5 dark:bg-orange-500/10">
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Achieved</p>
                <p className="truncate font-bold tabular-nums text-orange-600 dark:text-orange-400">
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Live Recent Orders Table + Recent Added Products */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className={`${card} overflow-hidden lg:col-span-2`}>
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5 dark:border-slate-800">
            <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">Recent Customer Orders</h2>
            <Link
              href="/admin/orders"
              className="rounded-md bg-orange-500 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              Manage Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11.5px]">
              <thead className="bg-slate-50 text-[10.5px] font-medium text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-3.5 py-1.5 font-medium">Order ID</th>
                  <th className="px-3 py-1.5 font-medium">Customer</th>
                  <th className="hidden px-3 py-1.5 font-medium sm:table-cell">Product Title</th>
                  <th className="px-3 py-1.5 text-right font-medium">Total Amount</th>
                  <th className="px-3.5 py-1.5 font-medium">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                      No orders placed yet. Place an order from the Checkout page!
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 6).map((o, idx) => {
                    const statusColor =
                      o.status === "Delivered"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30"
                        : o.status === "Shipped"
                        ? "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/30"
                        : o.status === "Cancelled"
                        ? "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30"
                        : "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30";

                    return (
                      <tr key={o._id || o.id || idx} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="whitespace-nowrap px-3.5 py-2 font-mono font-semibold text-orange-600 dark:text-orange-400">
                          #{String(o._id || o.id || "000000").slice(-6).toUpperCase()}
                        </td>
                        <td className="max-w-[120px] truncate px-3 py-2 font-semibold text-slate-800 dark:text-slate-200 sm:max-w-none">
                          {o.customerName}
                        </td>
                        <td className="hidden max-w-50 truncate px-3 py-2 text-slate-600 dark:text-slate-400 sm:table-cell">
                          {o.items?.[0]?.title || o.items?.[0]?.name || "Package Items"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-right font-bold tabular-nums text-slate-900 dark:text-white">
                          ₹{Number(o.totalPrice || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-3.5 py-2">
                          <span
                            className={`inline-flex whitespace-nowrap rounded px-1.5 py-px text-[10.5px] font-semibold ring-1 ring-inset ${statusColor}`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Added Products Feed */}
        <div className={`${card} px-3.5 py-3`}>
          <h2 className="text-[13px] font-bold text-slate-900 dark:text-white">Recent Catalog Activity</h2>
          <div className="mt-2.5 space-y-2.5 text-xs">
            {products.length === 0 ? (
              <p className="py-6 text-center text-slate-400 dark:text-slate-500">No products added yet.</p>
            ) : (
              products.slice(0, 5).map((p, idx) => (
                <div key={p._id || p.id || idx} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
                    <PackageIcon className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800 dark:text-slate-200">
                      {p.title || p.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {p.category} • ₹{p.price} ({p.stock} units in stock)
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}