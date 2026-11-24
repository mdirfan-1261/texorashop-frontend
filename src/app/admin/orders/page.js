"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  IndianRupee, 
  Search, 
  RefreshCw, 
  Phone, 
  MapPin, 
  Eye, 
  ChevronDown, 
  X, 
  Printer, 
  User, 
  Loader2, 
  PackageX,
  Tag,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import AdminWhatsAppAlertModal from "@/components/admin/orders/AdminWhatsAppAlertModal";

/* ── UI-only style tokens (light + dark) ── */
const card =
  "rounded-xl bg-white ring-1 ring-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-[#1e293b] dark:ring-slate-800";

// ==========================================
// 1. SUB-COMPONENT: Admin KPI Stats
// ==========================================
function AdminOrderStats({ orders = [] }) {
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
    { label: "Total Orders", value: totalOrders, icon: Package, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { label: "Pending Action", value: pendingCount, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
    { label: "In Transit / Shipped", value: shippedCount, icon: Truck, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Delivered", value: deliveredCount, icon: CheckCircle, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10" },
  ];

  return (
    <div className={`${card} mb-3 overflow-hidden`}>
      <div className="grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800 lg:grid-cols-5 [&>*]:border-slate-100 dark:[&>*]:border-slate-800 max-lg:[&>*:nth-child(n+3)]:border-t max-lg:[&>*:last-child]:col-span-2">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="flex min-w-0 items-center justify-between gap-2 px-3 py-2.5 sm:px-3.5">
              <div className="min-w-0">
                <p className="truncate text-[10.5px] font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="mt-0.5 truncate text-lg font-extrabold leading-6 tabular-nums text-slate-900 dark:text-white">
                  {s.value}
                </p>
              </div>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${s.bg} ${s.color}`}>
                <Icon size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 2. SUB-COMPONENT: Admin Filters
// ==========================================
function AdminOrderFilters({ searchQuery, setSearchQuery, activeFilter, setActiveFilter, onRefresh, loading }) {
  const filterTabs = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending ⏳" },
    { id: "confirmed", label: "Confirmed 📋" },
    { id: "shipped", label: "Shipped 🚚" },
    { id: "delivered", label: "Delivered ✅" },
    { id: "cancelled", label: "Cancelled ❌" },
  ];

  return (
    <div className={`${card} mb-3 space-y-2 p-2.5`}>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, phone, coupon code, or order ID..."
            aria-label="Search orders"
            className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-orange-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-[#0f172a] dark:text-white dark:placeholder-slate-500 dark:focus:ring-orange-500/20"
          />
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-200 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-orange-500" : ""} />
          <span>Refresh Orders</span>
        </button>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto rounded-lg bg-slate-100 p-0.5 [scrollbar-width:none] dark:bg-slate-800/70 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`whitespace-nowrap rounded-md px-3 py-1 text-[11.5px] font-semibold transition-all ${
                isActive
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                  : "text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
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

// ==========================================
// 3. SUB-COMPONENT: Admin Order Row
// ==========================================
function AdminOrderRow({ order, onUpdateStatus, onViewDetails, onOpenWhatsApp }) {
  const [updating, setUpdating] = useState(false);

  const orderStatus = order.status || order.orderStatus || "Pending";
  const items = order.items || order.orderItems || [];
  const totalPrice = Number(order.totalPrice ?? order.totalAmount ?? 0);

  // Calculate Items Subtotal & Coupon Discount (works for both new & existing orders!)
  const itemsSubtotal =
    Number(order.subtotal) ||
    items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty || i.quantity) || 1), 0);
  const discountAmount = Number(order.couponDiscount) || Math.max(0, itemsSubtotal - totalPrice);
  const couponCode = order.couponCode || (discountAmount > 0 ? "COUPON APPLIED" : "");

  const customerName = order.customerName || order.shippingAddress?.name || "Customer";
  const phone = order.phone || order.shippingAddress?.phone || "N/A";
  const city = order.city || order.shippingAddress?.city || "N/A";
  const address = order.address || order.shippingAddress?.street || "N/A";
  const pincode = order.pincode || order.shippingAddress?.pincode || "N/A";

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered")) return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30";
    if (s.includes("shipped") || s.includes("out")) return "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/30";
    if (s.includes("confirmed")) return "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:ring-purple-500/30";
    if (s.includes("cancel")) return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/30";
    return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/30";
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
        year: "numeric",
      })
    : "Recent";

  return (
    <tr className="border-b border-slate-100 text-xs transition-colors hover:bg-slate-50 dark:border-slate-800/80 dark:hover:bg-slate-800/40">
      <td className="px-3.5 py-2.5 align-top">
        <span className="font-mono font-semibold text-orange-600 dark:text-orange-400">
          #{order._id?.slice(-8).toUpperCase() || "ORD"}
        </span>
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">{formattedDate}</p>
        <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
          {order.paymentMethod || "COD"}
        </span>
      </td>

      <td className="px-3 py-2.5 align-top">
        <p className="text-[13px] font-semibold leading-4 text-slate-900 dark:text-white">{customerName}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Phone size={11} className="text-orange-500 dark:text-orange-400" />
          +91 {phone}
        </p>
        <p className="mt-0.5 flex max-w-[260px] items-start gap-1 text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400">
          <MapPin size={11} className="mt-0.5 shrink-0 text-slate-400 dark:text-slate-500" />
          <span>{address}, {city} - {pincode}</span>
        </p>
      </td>

      {/* Items: hidden on small screens to keep the row compact */}
      <td className="hidden px-3 py-2.5 align-top md:table-cell">
        <div className="flex items-center gap-1.5">
          {items.slice(0, 2).map((item, idx) => (
            <div
              key={idx}
              className="relative h-11 w-9 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
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
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
              +{items.length - 2}
            </span>
          )}
        </div>
        <p className="mt-1 max-w-[150px] truncate text-[11px] text-slate-500 dark:text-slate-400">{items[0]?.name || "Item"}</p>
      </td>

      {/* Amount & Applied Coupon Badge */}
      <td className="px-3 py-2.5 align-top">
        <p className="whitespace-nowrap text-[13px] font-bold tabular-nums text-slate-900 dark:text-white">
          ₹{totalPrice.toLocaleString("en-IN")}
        </p>
        {discountAmount > 0 && (
          <div className="mt-0.5 space-y-0.5">
            <p className="text-[10px] tabular-nums text-slate-400 line-through">
              MRP: ₹{itemsSubtotal.toLocaleString("en-IN")}
            </p>
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-emerald-50 px-1.5 py-px font-mono text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/30">
              <Tag size={10} />
              <span>{couponCode} (-₹{discountAmount})</span>
            </span>
          </div>
        )}
      </td>

      <td className="px-3 py-2.5 align-top">
        <div className="relative inline-block">
          <select
            value={orderStatus}
            disabled={updating}
            onChange={(e) => handleStatusChange(e.target.value)}
            aria-label="Update order status"
            className={`cursor-pointer appearance-none rounded-lg py-1 pl-2.5 pr-6 text-[11.5px] font-semibold ring-1 ring-inset transition-all focus:outline-none focus-visible:ring-2 disabled:opacity-60 ${getStatusColor(
              orderStatus
            )}`}
          >
            <option value="Pending">Pending ⏳</option>
            <option value="Confirmed">Confirmed 📋</option>
            <option value="Shipped">Shipped 🚚</option>
            <option value="Out for Delivery">Out for Delivery 🛵</option>
            <option value="Delivered">Delivered ✅</option>
            <option value="Cancelled">Cancelled ❌</option>
          </select>
          {updating ? (
            <Loader2 size={12} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 animate-spin opacity-70" />
          ) : (
            <ChevronDown size={12} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 opacity-60" />
          )}
        </div>
      </td>

      <td className="px-3.5 py-2.5 text-right align-top">
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => onOpenWhatsApp?.(order)}
            title="Send WhatsApp / SMS Alert"
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-emerald-50 px-2 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20"
          >
            <MessageSquare size={12} className="fill-current text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button
            onClick={() => onViewDetails(order)}
            className="inline-flex h-7 items-center gap-1 rounded-lg bg-slate-100 px-2.5 text-[11.5px] font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
          >
            <Eye size={12} />
            <span>Details</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ==========================================
// 4. SUB-COMPONENT: Detail / Slip Modal
// ==========================================
function AdminOrderDetailModal({ order, onClose, onOpenWhatsApp }) {
  if (!order) return null;

  const items = order.items || order.orderItems || [];
  const totalPrice = Number(order.totalPrice ?? order.totalAmount ?? 0);

  const itemsSubtotal =
    Number(order.subtotal) ||
    items.reduce((sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty || i.quantity) || 1), 0);
  const discountAmount = Number(order.couponDiscount) || Math.max(0, itemsSubtotal - totalPrice);
  const couponCode = order.couponCode || (discountAmount > 0 ? "FESTIVE PROMO" : "");

  const customerName = order.customerName || order.shippingAddress?.name || "Customer";
  const phone = order.phone || order.shippingAddress?.phone || "N/A";
  const city = order.city || order.shippingAddress?.city || "N/A";
  const address = order.address || order.shippingAddress?.street || "N/A";
  const pincode = order.pincode || order.shippingAddress?.pincode || "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm dark:bg-black/70 sm:items-center sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white text-slate-700 shadow-2xl ring-1 ring-slate-200 dark:bg-[#1e293b] dark:text-slate-200 dark:ring-slate-700 sm:rounded-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">ORDER SLIP</span>
            <h3 className="font-mono text-sm font-bold leading-4 text-slate-900 dark:text-white">
              #{order._id?.slice(-8).toUpperCase() || "ORD-XXXX"}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWhatsApp?.(order);
              }}
              className="flex h-7 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[11.5px] font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
            >
              <MessageSquare size={12} className="fill-current" /> <span>WhatsApp Alert</span>
            </button>
            <Link
              href={`/invoice/${order._id}`}
              target="_blank"
              className="flex h-7 items-center gap-1 rounded-lg bg-orange-50 px-2.5 text-[11.5px] font-semibold text-orange-700 ring-1 ring-orange-200 transition-colors hover:bg-orange-100 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/20"
            >
              <Printer size={13} /> <span>GST Invoice</span>
            </Link>
            <button
              onClick={() => window.print()}
              className="flex h-7 items-center gap-1 rounded-lg bg-white px-2.5 text-[11.5px] font-semibold text-slate-700 ring-1 ring-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700"
            >
              <Printer size={13} /> <span className="hidden sm:inline">Print Slip</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-3.5 overflow-y-auto p-4 text-xs">
          <div className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 dark:bg-slate-900/50 dark:ring-slate-800 sm:grid-cols-2">
            <div>
              <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <User size={11} className="text-orange-500 dark:text-orange-400" /> Customer Information
              </p>
              <p className="text-[13px] font-semibold text-slate-900 dark:text-white">{customerName}</p>
              <p className="mt-0.5 flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <Phone size={11} className="text-slate-400" /> +91 {phone}
              </p>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <MapPin size={11} className="text-orange-500 dark:text-orange-400" /> Shipping Address
              </p>
              <p className="text-slate-700 dark:text-slate-200">{address}</p>
              <p className="mt-0.5 font-semibold text-slate-600 dark:text-slate-300">
                {city} - <span className="font-bold text-slate-900 dark:text-white">{pincode}</span>
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Package size={11} className="text-orange-500 dark:text-orange-400" /> Ordered Items ({items.length})
            </p>
            <div className="space-y-1.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-2.5 ring-1 ring-slate-100 dark:bg-slate-900/40 dark:ring-slate-800">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                      <Image
                        src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 font-semibold text-slate-900 dark:text-white">{item.name}</p>
                      <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                        Qty: <span className="font-bold text-slate-900 dark:text-white">{item.qty || item.quantity || 1}</span>
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 font-mono text-[13px] font-bold tabular-nums text-slate-900 dark:text-white">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Financial & Coupon Breakdown */}
          <div className="space-y-2 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 dark:bg-slate-900/60 dark:ring-slate-800">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Items Subtotal</span>
              <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">₹{itemsSubtotal.toLocaleString("en-IN")}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-1.5 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Tag size={13} />
                  <span>Coupon Offer Applied ({couponCode})</span>
                </div>
                <span className="font-mono font-bold tabular-nums">- ₹{discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Payment Mode</span>
              <span className="font-semibold text-slate-900 dark:text-white">{order.paymentMethod || "Cash on Delivery"}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Delivery Fee</span>
              <span className="font-semibold uppercase text-emerald-600 dark:text-emerald-400">Free</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-200 pt-2 dark:border-slate-800">
              <span className="text-[13px] font-bold text-slate-900 dark:text-white">Final Payable Amount</span>
              <span className="font-mono text-lg font-extrabold tabular-nums text-orange-600 dark:text-orange-400">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. MAIN ADMIN ORDERS PAGE
// ==========================================
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [whatsAppOrder, setWhatsAppOrder] = useState(null);
  const [statusAlertToast, setStatusAlertToast] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const savedAdmin = localStorage.getItem("texora_admin");
      let token = "";
      if (savedAdmin) {
        try {
          token = JSON.parse(savedAdmin).token || "";
        } catch (e) {}
      }

      const res = await fetch("http://localhost:5000/api/orders", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const savedAdmin = localStorage.getItem("texora_admin");
      let token = "";
      if (savedAdmin) {
        try {
          token = JSON.parse(savedAdmin).token || "";
        } catch (e) {}
      }

      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, ...(updated || {}), status: newStatus } : o))
        );

        const target = orders.find((o) => o._id === orderId) || updated;
        const custName = target?.customerName || "Customer";
        const phone = target?.phone || "";

        // Trigger visual toast with 1-click WhatsApp alert action
        setStatusAlertToast({
          order: target ? { ...target, status: newStatus } : null,
          newStatus,
          message: `Delivery status changed to "${newStatus}"! Automated WhatsApp & SMS alert created for ${custName} (+91 ${phone}).`,
        });
        setTimeout(() => setStatusAlertToast(null), 7000);
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const status = (order.status || "Pending").toLowerCase();
    if (activeFilter !== "all" && !status.includes(activeFilter)) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = order._id?.toLowerCase().includes(q);
      const matchName = order.customerName?.toLowerCase().includes(q);
      const matchPhone = order.phone?.includes(q);
      const matchCity = order.city?.toLowerCase().includes(q);
      const matchCoupon = order.couponCode?.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchCity && !matchCoupon) return false;
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-7xl p-3 text-slate-800 dark:text-slate-100 sm:p-4">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
            FULFILLMENT & LOGISTICS
          </span>
          <h1 className="mt-0.5 text-lg font-extrabold leading-6 tracking-tight text-slate-900 dark:text-white sm:text-xl">
            Orders & Delivery Management
          </h1>
        </div>
        <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{filteredOrders.length}</span> of{" "}
          <span className="tabular-nums">{orders.length}</span> orders
        </span>
      </div>

      <AdminOrderStats orders={orders} />

      <AdminOrderFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onRefresh={fetchOrders}
        loading={loading}
      />

      <div className={`${card} overflow-hidden`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <Loader2 size={26} className="mb-2 animate-spin text-orange-500" />
            <p className="text-xs font-semibold">Loading customer orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-14 text-center text-slate-400">
            <PackageX size={34} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-[13px] font-semibold text-slate-800 dark:text-white">No matching orders found</p>
            <p className="mt-0.5 text-xs">Try clearing your search or switching status filter tabs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10.5px] font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
                  <th className="px-3.5 py-1.5 font-medium">Order ID & Date</th>
                  <th className="px-3 py-1.5 font-medium">Customer & Address</th>
                  <th className="hidden px-3 py-1.5 font-medium md:table-cell">Ordered Items</th>
                  <th className="px-3 py-1.5 font-medium">Amount & Coupon</th>
                  <th className="px-3 py-1.5 font-medium">Delivery Status</th>
                  <th className="px-3.5 py-1.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <AdminOrderRow
                    key={order._id}
                    order={order}
                    onUpdateStatus={handleUpdateStatus}
                    onViewDetails={(ord) => setSelectedOrder(ord)}
                    onOpenWhatsApp={(ord) => setWhatsAppOrder(ord)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AdminOrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOpenWhatsApp={(ord) => setWhatsAppOrder(ord)}
      />

      {/* WhatsApp & SMS Alert Modal */}
      <AdminWhatsAppAlertModal
        order={whatsAppOrder}
        isOpen={Boolean(whatsAppOrder)}
        onClose={() => setWhatsAppOrder(null)}
      />

      {/* Floating Status Notification Toast */}
      {statusAlertToast && (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-md items-center justify-between gap-3 rounded-2xl border border-emerald-300 bg-white p-3.5 shadow-2xl dark:border-emerald-700 dark:bg-slate-900 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white">
              <MessageSquare size={16} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Automated Alert Generated
              </p>
              <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2">
                {statusAlertToast.message}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setWhatsAppOrder(statusAlertToast.order);
              setStatusAlertToast(null);
            }}
            className="shrink-0 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-black text-white hover:bg-emerald-700 shadow-xs"
          >
            Open WhatsApp
          </button>
        </div>
      )}
    </div>
  );
}