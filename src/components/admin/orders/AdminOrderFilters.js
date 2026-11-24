"use client";

import React from "react";
import { Search, RefreshCw } from "lucide-react";

export default function AdminOrderFilters({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  onRefresh,
  loading,
}) {
  const filterTabs = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending ⏳" },
    { id: "confirmed", label: "Confirmed 📋" },
    { id: "shipped", label: "Shipped 🚚" },
    { id: "delivered", label: "Delivered ✅" },
    { id: "cancelled", label: "Cancelled ❌" },
  ];

  return (
    <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-4 shadow-sm mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, phone, city, or order ID..."
            className="w-full pl-9 pr-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors border border-slate-700 shrink-0"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-400" : ""} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}