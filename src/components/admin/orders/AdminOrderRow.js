"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Phone, MapPin, Eye, ChevronDown } from "lucide-react";

export default function AdminOrderRow({ order, onUpdateStatus, onViewDetails }) {
  const [updating, setUpdating] = useState(false);

  const orderStatus = order.status || order.orderStatus || "Pending";
  const items = order.items || order.orderItems || [];
  const totalPrice = Number(order.totalPrice ?? order.totalAmount ?? 0);

  const customerName = order.customerName || order.shippingAddress?.name || "Customer";
  const phone = order.phone || order.shippingAddress?.phone || "N/A";
  const city = order.city || order.shippingAddress?.city || "N/A";
  const address = order.address || order.shippingAddress?.street || "N/A";
  const pincode = order.pincode || order.shippingAddress?.pincode || "N/A";

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered")) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    if (s.includes("shipped") || s.includes("out")) return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    if (s.includes("confirmed")) return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    if (s.includes("cancel")) return "bg-red-500/10 text-red-400 border-red-500/30";
    return "bg-amber-500/10 text-amber-400 border-amber-500/30"; // Pending / Placed
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await onUpdateStatus(order._id, newStatus);
    setUpdating(false);
  };

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recent";

  return (
    <tr className="border-b border-slate-800/80 hover:bg-slate-800/30 transition-colors text-xs text-slate-300">
      {/* 1. Order ID & Date */}
      <td className="p-4 align-top">
        <p className="font-mono font-bold text-white text-xs">
          #{order._id?.slice(-8).toUpperCase() || "ORD-XXXX"}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{formattedDate}</p>
        <span className="inline-block mt-1 text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-semibold border border-slate-700">
          {order.paymentMethod || "COD"}
        </span>
      </td>

      {/* 2. Customer & Delivery Address */}
      <td className="p-4 align-top max-w-xs">
        <p className="font-bold text-white text-sm">{customerName}</p>
        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
          <Phone size={12} className="text-orange-400" />
          +91 {phone}
        </p>
        <p className="text-[11px] text-slate-400 flex items-start gap-1 mt-1 line-clamp-2">
          <MapPin size={12} className="text-slate-500 shrink-0 mt-0.5" />
          <span>{address}, {city} - {pincode}</span>
        </p>
      </td>

      {/* 3. Items Summary */}
      <td className="p-4 align-top">
        <div className="flex items-center gap-2">
          {items.slice(0, 2).map((item, idx) => (
            <div
              key={idx}
              className="relative w-10 h-12 rounded bg-slate-800 overflow-hidden border border-slate-700 shrink-0"
              title={item.name}
            >
              <Image
                src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"}
                alt={item.name || "Product"}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
          ))}
          {items.length > 2 && (
            <span className="text-[10px] bg-slate-800 text-slate-300 font-bold px-1.5 py-1 rounded border border-slate-700">
              +{items.length - 2} more
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
          {items[0]?.name || "Item"}
        </p>
      </td>

      {/* 4. Total Amount */}
      <td className="p-4 align-top font-bold text-white text-sm">
        ₹{totalPrice.toLocaleString("en-IN")}
      </td>

      {/* 5. 1-Click Status Dropdown */}
      <td className="p-4 align-top">
        <div className="relative inline-block">
          <select
            value={orderStatus}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`appearance-none text-xs font-bold py-1.5 pl-3 pr-7 rounded-lg border cursor-pointer focus:outline-none transition-all ${getStatusColor(
              orderStatus
            )} bg-[#0f172a]`}
          >
            <option value="Pending">Pending ⏳</option>
            <option value="Confirmed">Confirmed 📋</option>
            <option value="Shipped">Shipped 🚚</option>
            <option value="Out for Delivery">Out for Delivery 🛵</option>
            <option value="Delivered">Delivered ✅</option>
            <option value="Cancelled">Cancelled ❌</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60"
          />
        </div>
      </td>

      {/* 6. View Details Button */}
      <td className="p-4 align-top text-right">
        <button
          onClick={() => onViewDetails(order)}
          className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors border border-slate-700"
        >
          <Eye size={13} />
          <span>Details</span>
        </button>
      </td>
    </tr>
  );
}