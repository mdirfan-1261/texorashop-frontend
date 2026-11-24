"use client";

import React from "react";
import { Package, Clock, Truck, CheckCircle, IndianRupee } from "lucide-react";

export default function AdminOrderStats({ orders = [] }) {
  const totalOrders = orders.length;
  
  const pendingCount = orders.filter((o) => {
    const s = (o.status || o.orderStatus || "").toLowerCase();
    return s.includes("pending") || s.includes("placed");
  }).length;

  const shippedCount = orders.filter((o) => {
    const s = (o.status || o.orderStatus || "").toLowerCase();
    return s.includes("shipped") || s.includes("out");
  }).length;

  const deliveredCount = orders.filter((o) => {
    const s = (o.status || o.orderStatus || "").toLowerCase();
    return s.includes("delivered");
  }).length;

  const totalRevenue = orders.reduce((sum, o) => {
    const price = Number(o.totalPrice ?? o.totalAmount ?? 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Pending Action",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "In Transit / Shipped",
      value: shippedCount,
      icon: Truck,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      label: "Delivered",
      value: deliveredCount,
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        return (
          <div
            key={idx}
            className={`bg-[#1e293b] border ${s.border} rounded-xl p-4 shadow-sm flex items-center justify-between`}
          >
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {s.label}
              </p>
              <p className="text-xl font-black text-white mt-1">{s.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
}