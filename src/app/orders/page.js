"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Truck, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Loader2, 
  Search, 
  PackageOpen, 
  ArrowRight, 
  MapPin,
  HelpCircle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  ShieldCheck,
  FileText
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useCart } from "@/context/CartContext";

function OrderFilterTabs({ searchQuery, setSearchQuery, activeFilter, setActiveFilter, counts }) {
  const filterTabs = [
    { id: "all", label: "All Orders", count: counts.all },
    { id: "on_the_way", label: "On the way 🚚", count: counts.onTheWay },
    { id: "delivered", label: "Delivered ✅", count: counts.delivered },
    { id: "returned", label: "Returns / Refunds 🔄", count: counts.returned },
    { id: "cancelled", label: "Cancelled ❌", count: counts.cancelled },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6 space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by product name or Order ID..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#f4511e] focus:bg-white transition-all text-gray-900"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-[#f4511e] text-white shadow-md shadow-orange-500/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmptyOrdersView() {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm my-10">
      <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-[#f4511e] mb-4">
        <PackageOpen size={40} />
      </div>
      <h3 className="text-xl font-black text-gray-900">No Orders Found</h3>
      <p className="text-xs text-gray-500 mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
        Looks like you haven't placed any orders yet. Discover trending fashion and lifestyle deals on TexoraShop!
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-500/25"
      >
        <span>Explore Top Deals</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function OrderCard({ order, onOpenReturn, onOpenCancel, showToast }) {
  const { addToCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  const orderStatus = order.status || "Pending";
  const orderItems = order.items || [];
  const orderTotal = order.totalPrice ?? 0;
  const returnReq = order.returnRequest || {};
  const isDelivered = orderStatus.toLowerCase().includes("delivered");
  const canCancel = ["pending", "confirmed"].includes(orderStatus.toLowerCase());

  const shippingAddress = {
    name: order.customerName || "Customer",
    phone: order.phone || "",
    street: order.address || "",
    city: order.city || "",
    pincode: order.pincode || "",
  };

  const getStatusBadge = (status) => {
    const s = (status || "Pending").toLowerCase();
    if (s.includes("delivered")) {
      return {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        label: "Delivered",
        desc: "Item delivered successfully",
      };
    }
    if (s.includes("shipped") || s.includes("out")) {
      return {
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        label: "Shipped - On the way",
        desc: "Expected delivery in 2-3 days",
      };
    }
    if (s.includes("cancel")) {
      return {
        bg: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-500",
        label: "Cancelled",
        desc: order.cancelReason || "Order has been cancelled",
      };
    }
    return {
      bg: "bg-orange-50 text-orange-700 border-orange-200",
      dot: "bg-orange-500",
      label: "Order Placed",
      desc: "Seller is preparing your order",
    };
  };

  const statusInfo = getStatusBadge(orderStatus);

  const orderDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Recent Order";

  const handleBuyAgain = (item) => {
    addToCart({
      id: item.slug || item.product || item._id,
      title: item.name,
      price: item.price,
      image: item.image,
    });
    showToast(`"${item.name}" added to cart!`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-gray-300 transition-all overflow-hidden mb-4">
      <div className="bg-gray-50/80 px-5 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-bold text-gray-500 uppercase tracking-wider">
            Order <span className="text-gray-900 font-extrabold">#{order._id?.slice(-8) || "ORD-2026"}</span>
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-600 font-medium">Placed on {orderDate}</span>
        </div>

        <div className="flex items-center gap-3 font-semibold">
          <span className="text-gray-600">Total:</span>
          <span className="text-sm font-black text-gray-900">₹{orderTotal}</span>
          <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold">
            {order.paymentMethod || "Cash on Delivery"}
          </span>
        </div>
      </div>

      <div className="p-5">
        {returnReq.isRequested && (
          <div className="mb-4 p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-900">
                  Return Status: <span className="underline">{returnReq.status}</span>
                </p>
                <p className="text-[11px] text-amber-700">
                  Reason: {returnReq.reason} {returnReq.upiId ? `• UPI: ${returnReq.upiId}` : ""}
                </p>
              </div>
            </div>
            {returnReq.refundTransactionId && (
              <span className="bg-emerald-600 text-white font-mono font-bold text-[11px] px-2.5 py-1 rounded-lg">
                UTR: {returnReq.refundTransactionId}
              </span>
            )}
          </div>
        )}

        <div className="space-y-4">
          {orderItems.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                  <Image
                    src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 line-clamp-2">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">Qty: {item.qty || 1}</span>
                  </div>
                  <p className="text-base font-black text-gray-900 mt-2">₹{item.price}</p>
                </div>
              </div>

              <div className="sm:text-right shrink-0">
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusInfo.dot} animate-pulse`} />
                  <span>{statusInfo.label}</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">{statusInfo.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {shippingAddress.street && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
            >
              <MapPin size={14} className="text-[#f4511e]" />
              <span>Delivery Address ({shippingAddress.name}, {shippingAddress.pincode})</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isExpanded && (
              <div className="mt-2.5 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 leading-relaxed border border-gray-100">
                <p className="font-bold text-gray-900">{shippingAddress.name}</p>
                <p>{shippingAddress.street}</p>
                <p>{shippingAddress.city} - <span className="font-bold text-gray-800">{shippingAddress.pincode}</span></p>
                <p className="mt-1 font-semibold text-gray-700">📱 Mobile: +91 {shippingAddress.phone}</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/track-order?id=${order._id}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-[#f4511e] hover:bg-[#d84315] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-500/20"
          >
            <Truck size={14} />
            <span>Track Order</span>
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {canCancel && (
              <button
                onClick={() => onOpenCancel(order)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 border border-rose-200 hover:bg-rose-50 text-rose-600 px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
              >
                <XCircle size={14} />
                <span>Cancel Order</span>
              </button>
            )}

            {isDelivered && !returnReq.isRequested && (
              <button
                onClick={() => onOpenReturn(order)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 border border-amber-300 hover:bg-amber-50 text-amber-800 bg-amber-50/50 px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
              >
                <RotateCcw size={14} />
                <span>Return / Replace</span>
              </button>
            )}

            <Link
              href={`/invoice/${order._id}`}
              target="_blank"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 border border-slate-300 hover:border-slate-800 hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <FileText size={14} className="text-orange-600" />
              <span>Invoice</span>
            </Link>

            <Link
              href="/contact"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 border border-gray-200 hover:bg-gray-50 text-gray-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              <HelpCircle size={14} />
              <span>Need Help?</span>
            </Link>

            {orderItems[0] && (
              <button
                onClick={() => handleBuyAgain(orderItems[0])}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 border border-orange-200 hover:border-orange-500 hover:bg-orange-50 text-[#f4511e] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors"
              >
                <RotateCcw size={14} />
                <span>Buy Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [returnOrder, setReturnOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("Size or Fit issue");
  const [returnComments, setReturnComments] = useState("");
  const [returnUpi, setReturnUpi] = useState("");

  const [cancelOrderModal, setCancelOrderModal] = useState(null);
  const [cancelReason, setCancelReason] = useState("Ordered by mistake");
  const [returnDays, setReturnDays] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) {
          const s = JSON.parse(saved);
          return (
            s.returnWindowDays ||
            (s.badge3Label ? Number(s.badge3Label.match(/\d+/)?.[0]) : 7) ||
            7
          );
        }
      } catch (e) {}
    }
    return 7;
  });

  useEffect(() => {
    function readSettings() {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) {
          const s = JSON.parse(saved);
          const days =
            s.returnWindowDays ||
            (s.badge3Label ? Number(s.badge3Label.match(/\d+/)?.[0]) : 7) ||
            7;
          setReturnDays(days);
        }
      } catch (e) {}
    }

    async function loadSettings() {
      try {
        const res = await fetch("http://localhost:5000/api/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            const days =
              data.returnWindowDays ||
              (data.badge3Label ? Number(data.badge3Label.match(/\d+/)?.[0]) : 7) ||
              7;
            setReturnDays(days);
            localStorage.setItem("texora_store_settings", JSON.stringify(data));
          }
        }
      } catch (e) {}
    }

    readSettings();
    loadSettings();
    window.addEventListener("texora_settings_updated", readSettings);
    window.addEventListener("storage", readSettings);
    return () => {
      window.removeEventListener("texora_settings_updated", readSettings);
      window.removeEventListener("storage", readSettings);
    };
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("texora_token");
      const userPhone = user?.phone;
      const url = userPhone
        ? `http://localhost:5000/api/orders/my?phone=${encodeURIComponent(userPhone)}`
        : `http://localhost:5000/api/orders/my`;

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleSubmitReturn = async () => {
    if (!returnOrder) return;
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${returnOrder._id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: returnReason,
          comments: returnComments,
          upiId: returnUpi,
        }),
      });

      if (res.ok) {
        showToast("Return request submitted! Our courier partner will schedule doorstep pickup.");
        setReturnOrder(null);
        setReturnComments("");
        setReturnUpi("");
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCancel = async () => {
    if (!cancelOrderModal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${cancelOrderModal._id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (res.ok) {
        showToast("Order cancelled successfully.");
        setCancelOrderModal(null);
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const counts = {
    all: orders.length,
    onTheWay: orders.filter((o) => {
      const s = (o.status || "").toLowerCase();
      return s.includes("shipped") || s.includes("out") || s.includes("confirmed") || s.includes("pending");
    }).length,
    delivered: orders.filter((o) => (o.status || "").toLowerCase().includes("delivered")).length,
    returned: orders.filter((o) => o.returnRequest?.isRequested).length,
    cancelled: orders.filter((o) => (o.status || "").toLowerCase().includes("cancel")).length,
  };

  const filteredOrders = orders.filter((order) => {
    const s = (order.status || "").toLowerCase();
    const isReturned = order.returnRequest?.isRequested;

    if (activeFilter === "on_the_way" && !(s.includes("shipped") || s.includes("out") || s.includes("confirmed") || s.includes("pending"))) {
      return false;
    }
    if (activeFilter === "delivered" && !s.includes("delivered")) return false;
    if (activeFilter === "returned" && !isReturned) return false;
    if (activeFilter === "cancelled" && !s.includes("cancel")) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = order._id?.toLowerCase().includes(q);
      const matchItem = order.items?.some((i) => i.name?.toLowerCase().includes(q));
      if (!matchId && !matchItem) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-gray-700">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <p className="text-xs font-bold">{toast}</p>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition shadow-2xs"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">My Orders</h1>
              <p className="text-xs text-gray-500">Track shipments, request returns, and view invoices</p>
            </div>
          </div>
        </div>

        <OrderFilterTabs
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          counts={counts}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 size={36} className="animate-spin text-[#f4511e] mb-3" />
            <p className="text-xs font-bold">Loading your orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <EmptyOrdersView />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onOpenReturn={(ord) => setReturnOrder(ord)}
                onOpenCancel={(ord) => setCancelOrderModal(ord)}
                showToast={showToast}
              />
            ))}
          </div>
        )}
      </div>

      {returnOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <RotateCcw className="text-[#f4511e]" size={20} />
                <h3 className="font-black text-gray-900 text-base">{returnDays}-Day Free Return / Replace</h3>
              </div>
              <button onClick={() => setReturnOrder(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-xs text-emerald-800">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span>Doorstep pickup is 100% free. Once picked up, refund is credited directly to your UPI ID.</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Select Return Reason:</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#f4511e]"
              >
                <option value="Size or Fit issue">Size or Fit issue</option>
                <option value="Defective / Damaged product">Defective / Damaged product</option>
                <option value="Wrong item delivered">Wrong item delivered</option>
                <option value="Quality not as expected">Quality not as expected</option>
                <option value="Different from photo shown">Different from photo shown</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Enter Your UPI ID (for instant refund):</label>
              <input
                type="text"
                value={returnUpi}
                onChange={(e) => setReturnUpi(e.target.value)}
                placeholder="e.g. 9876543210@paytm or name@okhdfcbank"
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-[#f4511e]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Additional Comments (Optional):</label>
              <textarea
                rows={2}
                value={returnComments}
                onChange={(e) => setReturnComments(e.target.value)}
                placeholder="Tell us what went wrong so we can assist better..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#f4511e]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setReturnOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Dismiss
              </button>
              <button
                onClick={handleSubmitReturn}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#f4511e] hover:bg-[#d84315] text-white text-xs font-bold shadow-md shadow-orange-500/20"
              >
                {submitting ? "Submitting..." : "Confirm Return"}
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-base">Cancel Order?</h3>
              <button onClick={() => setCancelOrderModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Are you sure you want to cancel order #{cancelOrderModal._id.slice(-8).toUpperCase()}?
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Cancellation Reason:</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#f4511e]"
              >
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Expected faster delivery">Expected faster delivery</option>
                <option value="Found cheaper elsewhere">Found cheaper elsewhere</option>
                <option value="Wrong delivery address entered">Wrong delivery address entered</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelOrderModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Keep Order
              </button>
              <button
                onClick={handleSubmitCancel}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                {submitting ? "Cancelling..." : "Yes, Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}