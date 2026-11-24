"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  TrendingUp,
  IndianRupee,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function AdminReportsPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordRes, prodRes] = await Promise.all([
        fetch("http://localhost:5000/api/orders"),
        fetch("http://localhost:5000/api/products"),
      ]);
      if (ordRes.ok) {
        const oData = await ordRes.json();
        setOrders(Array.isArray(oData) ? oData : []);
      }
      if (prodRes.ok) {
        const pData = await prodRes.json();
        setProducts(Array.isArray(pData) ? pData : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const grossRevenue = orders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
  const deliveredOrders = orders.filter((o) => (o.status || "").toLowerCase().includes("delivered"));
  const deliveredRevenue = deliveredOrders.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
  const cancelledOrders = orders.filter((o) => (o.status || "").toLowerCase().includes("cancel"));
  const avgOrderValue = orders.length > 0 ? Math.round(grossRevenue / orders.length) : 0;

  const handleExportCSV = () => {
    const headers = ["OrderID,Customer,Phone,City,Status,Amount,Date"];
    const rows = orders.map((o) =>
      [
        o._id,
        `"${o.customerName || ""}"`,
        o.phone || "",
        `"${o.city || ""}"`,
        o.status || "Pending",
        o.totalPrice || 0,
        o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "",
      ].join(",")
    );
    const csv = [...headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TexoraShop_Sales_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <BarChart3 className="h-3 w-3" /> Business Intelligence
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Revenue & Financial Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analyze gross GMV, realized delivered revenue, average order value, and export accounting CSVs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold shadow-xs transition"
          >
            <Download size={14} />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase text-slate-400">Gross GMV Booked</p>
          <p className="text-2xl font-black text-slate-900 mt-1">₹{grossRevenue.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across {orders.length} total orders</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase text-emerald-600">Realized Revenue (Delivered)</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">₹{deliveredRevenue.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-emerald-700 mt-1">{deliveredOrders.length} orders delivered</p>
        </div>
        <div className="bg-white border border-blue-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase text-blue-600">Average Order Value (AOV)</p>
          <p className="text-2xl font-black text-blue-600 mt-1">₹{avgOrderValue.toLocaleString("en-IN")}</p>
          <p className="text-[11px] text-blue-700 mt-1">Per customer checkout</p>
        </div>
        <div className="bg-white border border-rose-200 rounded-2xl p-5 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase text-rose-600">Cancelled Orders</p>
          <p className="text-2xl font-black text-rose-600 mt-1">{cancelledOrders.length}</p>
          <p className="text-[11px] text-rose-700 mt-1">Zero penalty cancellations</p>
        </div>
      </div>

      {/* Category Wise Inventory Distribution */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs">
        <h2 className="text-base font-black text-slate-900 mb-4">
          Category-Wise Catalog Distribution ({products.length} Active SKUs)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Fashion", "Mobiles", "Electronics", "Footwear", "Bags", "Beauty", "Kids", "Grocery"].map((cat) => {
            const count = products.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;
            return (
              <div key={cat} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{cat}</span>
                <span className="text-xs font-black bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full">
                  {count} items
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}