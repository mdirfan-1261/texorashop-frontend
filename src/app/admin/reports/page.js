"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  Filter,
  DollarSign,
  Package,
} from "lucide-react";

export default function AdminReportsPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Time Range Filter: 'all' | 'today' | 'week' | 'month' | 'custom'
  const [timeRange, setTimeRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        fetch("http://localhost:5000/api/orders", { cache: "no-store" }),
        fetch("http://localhost:5000/api/products", { cache: "no-store" }),
      ]);
      if (ordRes.ok) {
        const o = await ordRes.json();
        setOrders(Array.isArray(o) ? o : o.orders || []);
      }
      if (prodRes.ok) {
        const p = await prodRes.json();
        setProducts(Array.isArray(p) ? p : p.products || []);
      }
    } catch (e) {
      console.error("Reports fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. FILTER ORDERS BY TIME RANGE
  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    const now = new Date();

    if (timeRange === "today") {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return orders.filter((o) => {
        const time = new Date(o.createdAt || o.confirmedAt || Date.now()).getTime();
        return time >= startOfToday;
      });
    }

    if (timeRange === "week") {
      const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => {
        const time = new Date(o.createdAt || o.confirmedAt || Date.now()).getTime();
        return time >= sevenDaysAgo;
      });
    }

    if (timeRange === "month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return orders.filter((o) => {
        const time = new Date(o.createdAt || o.confirmedAt || Date.now()).getTime();
        return time >= startOfMonth;
      });
    }

    if (timeRange === "custom" && (startDate || endDate)) {
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : 0;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : Infinity;
      return orders.filter((o) => {
        const time = new Date(o.createdAt || o.confirmedAt || Date.now()).getTime();
        return time >= start && time <= end;
      });
    }

    return orders; // 'all'
  }, [orders, timeRange, startDate, endDate]);

  // 2. FINANCIAL CALCULATIONS FOR SELECTED PERIOD
  const grossRevenue = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  }, [filteredOrders]);

  const deliveredOrders = useMemo(() => {
    return filteredOrders.filter((o) => (o.status || "").toLowerCase().includes("delivered"));
  }, [filteredOrders]);

  const deliveredRevenue = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  }, [deliveredOrders]);

  const cancelledOrders = useMemo(() => {
    return filteredOrders.filter((o) => (o.status || "").toLowerCase().includes("cancel"));
  }, [filteredOrders]);

  const cancelledRevenue = useMemo(() => {
    return cancelledOrders.reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
  }, [cancelledOrders]);

  const avgOrderValue = useMemo(() => {
    return filteredOrders.length > 0 ? Math.round(grossRevenue / filteredOrders.length) : 0;
  }, [grossRevenue, filteredOrders]);

  // 3. PAYMENT METHOD BREAKDOWN (COD vs Online UPI)
  const paymentStats = useMemo(() => {
    let codTotal = 0;
    let codCount = 0;
    let upiTotal = 0;
    let upiCount = 0;

    filteredOrders.forEach((o) => {
      const val = Number(o.totalPrice) || 0;
      const mode = (o.paymentMethod || "").toLowerCase();
      if (mode.includes("upi") || mode.includes("online") || mode.includes("qr")) {
        upiTotal += val;
        upiCount++;
      } else {
        codTotal += val;
        codCount++;
      }
    });

    return {
      codTotal,
      codCount,
      codPercent: grossRevenue > 0 ? Math.round((codTotal / grossRevenue) * 100) : 0,
      upiTotal,
      upiCount,
      upiPercent: grossRevenue > 0 ? Math.round((upiTotal / grossRevenue) * 100) : 0,
    };
  }, [filteredOrders, grossRevenue]);

  // 4. ORDER STATUS BREAKDOWN
  const statusCounts = useMemo(() => {
    const counts = {
      Pending: 0,
      Confirmed: 0,
      Shipped: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
    };

    filteredOrders.forEach((o) => {
      const s = o.status || "Pending";
      if (counts[s] !== undefined) counts[s]++;
      else if (s.toLowerCase().includes("cancel")) counts.Cancelled++;
      else if (s.toLowerCase().includes("deliver")) counts.Delivered++;
      else if (s.toLowerCase().includes("ship")) counts.Shipped++;
      else counts.Pending++;
    });

    return counts;
  }, [filteredOrders]);

  // 5. TOP PERFORMING PRODUCTS
  const topProducts = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      const items = o.items || [];
      items.forEach((it) => {
        const name = it.name || it.title || "Product";
        const qty = Number(it.qty || it.quantity) || 1;
        const price = Number(it.price) || 0;
        if (!map[name]) {
          map[name] = { name, units: 0, revenue: 0, image: it.image || "" };
        }
        map[name].units += qty;
        map[name].revenue += price * qty;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  // 6. CATEGORY-WISE SALES & INVENTORY STATS
  const categoryStats = useMemo(() => {
    const list = [
      "Fashion",
      "Mobiles",
      "Electronics",
      "Footwear",
      "Bags",
      "Beauty",
      "Kids",
      "Grocery",
    ];

    return list.map((cat) => {
      const catLower = cat.toLowerCase();
      // SKU count
      const skuCount = products.filter(
        (p) => p.category?.toLowerCase() === catLower
      ).length;

      // Revenue in filtered orders
      let catRevenue = 0;
      let catUnits = 0;
      filteredOrders.forEach((o) => {
        (o.items || []).forEach((it) => {
          const itName = (it.name || it.title || "").toLowerCase();
          const itSlug = (it.slug || "").toLowerCase();
          // Match by product category lookup
          const dbProd = products.find(
            (p) =>
              p._id === it.slug ||
              p.slug === itSlug ||
              p.title?.toLowerCase() === itName
          );
          if (dbProd && dbProd.category?.toLowerCase() === catLower) {
            const qty = Number(it.qty || it.quantity) || 1;
            catUnits += qty;
            catRevenue += (Number(it.price) || 0) * qty;
          }
        });
      });

      return {
        category: cat,
        skuCount,
        revenue: catRevenue,
        units: catUnits,
      };
    });
  }, [products, filteredOrders]);

  // 7. EXPORT CSV (Filter-Aware)
  const handleExportCSV = () => {
    const headers = ["OrderID,Customer,Phone,City,Pincode,PaymentMethod,Status,ItemsCount,Amount,Date"];
    const rows = filteredOrders.map((o) =>
      [
        o._id,
        `"${o.customerName || "Customer"}"`,
        o.phone || "",
        `"${o.city || ""}"`,
        o.pincode || "",
        `"${o.paymentMethod || "Cash on Delivery"}"`,
        o.status || "Pending",
        (o.items || []).length,
        o.totalPrice || 0,
        o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "",
      ].join(",")
    );

    const blob = new Blob([[...headers, ...rows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `TexoraShop_Financial_Report_${timeRange}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <BarChart3 className="h-3 w-3" /> Live Business Intelligence
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Revenue & Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics for gross GMV, realized revenue, payment gateways, and category accounting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin text-orange-500" : ""}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Dynamic Time Range Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Time" },
            { id: "today", label: "Today" },
            { id: "week", label: "Last 7 Days" },
            { id: "month", label: "This Month" },
            { id: "custom", label: "Custom Range" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeRange(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                timeRange === tab.id
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {timeRange === "custom" && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none"
            />
            <span className="text-slate-400 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
        )}

        <div className="text-[11px] font-bold text-slate-500">
          Showing data for <strong className="text-slate-900">{filteredOrders.length}</strong> orders
        </div>
      </div>

      {/* 4 Main Dynamic Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Gross GMV */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Gross GMV Booked
            </span>
            <TrendingUp size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">
            ₹{grossRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {filteredOrders.length} total orders
          </p>
        </div>

        {/* Realized Delivered Revenue */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Realized Revenue (Delivered)
            </span>
            <CheckCircle2 size={16} />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">
            ₹{deliveredRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-emerald-600 mt-1">
            {deliveredOrders.length} orders successfully delivered
          </p>
        </div>

        {/* AOV */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Average Order Value (AOV)
            </span>
            <DollarSign size={16} />
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">
            ₹{avgOrderValue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-blue-600 mt-1">Per transaction average</p>
        </div>

        {/* Cancelled Orders */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/30 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">
              Cancelled / RTO
            </span>
            <XCircle size={16} />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2">
            {cancelledOrders.length}
          </p>
          <p className="text-[11px] text-rose-600 mt-1">
            ₹{cancelledRevenue.toLocaleString("en-IN")} lost to cancellations
          </p>
        </div>
      </div>

      {/* Middle Grid: Payment Modes & Order Lifecycle Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Methods Split */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <CreditCard size={15} className="text-orange-500" />
              <span>Payment Mode Distribution</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">COD vs Online UPI</span>
          </div>

          <div className="space-y-4">
            {/* Cash on Delivery */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span>💵 Cash on Delivery (COD)</span>
                  <span className="text-[10px] text-slate-400 font-normal">({paymentStats.codCount} orders)</span>
                </span>
                <span className="text-slate-900 font-black">
                  ₹{paymentStats.codTotal.toLocaleString("en-IN")}{" "}
                  <span className="text-slate-400 text-[10px]">({paymentStats.codPercent}%)</span>
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${paymentStats.codPercent}%` }}
                />
              </div>
            </div>

            {/* Online UPI */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <span>⚡ Online UPI / QR</span>
                  <span className="text-[10px] text-slate-400 font-normal">({paymentStats.upiCount} orders)</span>
                </span>
                <span className="text-slate-900 font-black">
                  ₹{paymentStats.upiTotal.toLocaleString("en-IN")}{" "}
                  <span className="text-slate-400 text-[10px]">({paymentStats.upiPercent}%)</span>
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${paymentStats.upiPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Lifecycle Statuses */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Package size={15} className="text-orange-500" />
              <span>Order Lifecycle Status</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-400">Total: {filteredOrders.length}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-center">
              <span className="text-[10px] font-extrabold uppercase text-amber-700 block">Pending</span>
              <span className="text-lg font-black text-amber-900">{statusCounts.Pending}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-200 text-center">
              <span className="text-[10px] font-extrabold uppercase text-blue-700 block">Confirmed</span>
              <span className="text-lg font-black text-blue-900">{statusCounts.Confirmed}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-200 text-center">
              <span className="text-[10px] font-extrabold uppercase text-indigo-700 block">Shipped</span>
              <span className="text-lg font-black text-indigo-900">{statusCounts.Shipped}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-50/50 border border-cyan-200 text-center">
              <span className="text-[10px] font-extrabold uppercase text-cyan-700 block">Out for Delivery</span>
              <span className="text-lg font-black text-cyan-900">{statusCounts["Out for Delivery"]}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 text-center">
              <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">Delivered</span>
              <span className="text-lg font-black text-emerald-900">{statusCounts.Delivered}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-200 text-center">
              <span className="text-[10px] font-extrabold uppercase text-rose-700 block">Cancelled</span>
              <span className="text-lg font-black text-rose-900">{statusCounts.Cancelled}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Products in Selected Period */}
      {topProducts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
            <ShoppingBag size={15} className="text-orange-500" />
            <span>Top Performing Products (By Revenue in this Period)</span>
          </h3>

          <div className="divide-y divide-slate-100">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-slate-900 truncate">{prod.name}</span>
                </div>
                <div className="flex items-center gap-4 shrink-0 font-bold">
                  <span className="text-slate-500 text-[11px]">{prod.units} units sold</span>
                  <span className="text-slate-900 font-black">₹{prod.revenue.toLocaleString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category-Wise Catalog & Sales Performance */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h2 className="text-base font-black text-slate-900 mb-4">
          Category-Wise Catalog & Sales Performance ({products.length} Active SKUs)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoryStats.map((item) => (
            <div
              key={item.category}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{item.category}</span>
                <span className="text-[11px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                  {item.skuCount} SKUs
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Sales:</span>
                <span className="font-black text-slate-800">
                  {item.revenue > 0 ? `₹${item.revenue.toLocaleString("en-IN")}` : "₹0"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
