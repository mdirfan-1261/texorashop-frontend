"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  RotateCcw,
  Search,
  RefreshCw,
  CheckCircle2,
  Truck,
  Phone,
  MapPin,
  X,
  CreditCard,
  MessageSquare,
  Copy,
  Check,
  PackageOpen,
} from "lucide-react";

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [refundModalOrder, setRefundModalOrder] = useState(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [processing, setProcessing] = useState(false);

  const [toast, setToast] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/orders/returns/all");
      if (res.ok) {
        const data = await res.json();
        setReturns(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setReturns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (orderId, status, refundTxn = "", notes = "") => {
    setProcessing(true);
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/return-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          refundTransactionId: refundTxn,
          adminNotes: notes,
        }),
      });

      if (res.ok) {
        setReturns((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? {
                  ...o,
                  returnRequest: {
                    ...o.returnRequest,
                    status,
                    refundTransactionId: refundTxn || o.returnRequest?.refundTransactionId,
                    adminNotes: notes || o.returnRequest?.adminNotes,
                  },
                }
              : o
          )
        );
        showToast(`Return status updated to: ${status}`);
        if (refundModalOrder?._id === orderId) {
          setRefundModalOrder(null);
          setUtrNumber("");
          setAdminNoteInput("");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyUpi = (upi) => {
    if (!upi) return;
    navigator.clipboard.writeText(upi);
    setCopiedUpi(upi);
    setTimeout(() => setCopiedUpi(null), 2000);
  };

  const handleSendWhatsApp = (order) => {
    const cust = order.customerName || "Customer";
    const status = order.returnRequest?.status || "In Review";
    const upi = order.returnRequest?.upiId || "N/A";
    const utr = order.returnRequest?.refundTransactionId ? `\nUTR Ref: ${order.returnRequest.refundTransactionId}` : "";
    const msg = encodeURIComponent(
      `Hello ${cust}, updates regarding your TexoraShop Return for Order #${order._id.slice(-8).toUpperCase()}:\n\nStatus: ${status}${utr}\nUPI: ${upi}\n\nThank you for shopping with TexoraShop!`
    );
    window.open(`https://wa.me/91${order.phone}?text=${msg}`, "_blank");
  };

  const totalCount = returns.length;
  const requestedCount = returns.filter((r) => r.returnRequest?.status === "Return Requested").length;
  const pickupCount = returns.filter((r) => r.returnRequest?.status === "Return Approved").length;
  const hubCount = returns.filter((r) => r.returnRequest?.status === "Pickup Completed").length;
  const refundCount = returns.filter((r) => r.returnRequest?.status === "Refund Processed").length;
  const totalRefundAmount = returns
    .filter((r) => r.returnRequest?.status === "Refund Processed")
    .reduce((sum, r) => sum + (Number(r.totalPrice) || 0), 0);

  const filteredReturns = returns.filter((item) => {
    const ret = item.returnRequest || {};
    if (activeTab !== "all" && ret.status !== activeTab) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        item._id?.toLowerCase().includes(q) ||
        item.customerName?.toLowerCase().includes(q) ||
        item.phone?.includes(q) ||
        ret.upiId?.toLowerCase().includes(q) ||
        ret.reason?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <p className="text-xs font-bold">{toast}</p>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <RotateCcw className="h-3 w-3" /> Texora Logistics & Finance
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Returns, Pickups & Refund Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer return requests, schedule doorstep pickups, and process UPI refunds.
          </p>
        </div>

        <button
          onClick={fetchReturns}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-orange-600 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
          <span>Refresh Desk</span>
        </button>
      </div>

      {/* KPI Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Returns</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{requestedCount}</p>
        </div>
        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">Pickup Scheduled</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{pickupCount}</p>
        </div>
        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-purple-600">Received at Hub</p>
          <p className="text-2xl font-black text-purple-600 mt-1">{hubCount}</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">Refunds Processed</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            ₹{totalRefundAmount.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Search & Status Filter Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer name, Phone, or UPI ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Requests", count: totalCount },
            { id: "Return Requested", label: "Needs Action ⏳", count: requestedCount },
            { id: "Return Approved", label: "Pickup Scheduled 🚚", count: pickupCount },
            { id: "Pickup Completed", label: "Received in Hub 📦", count: hubCount },
            { id: "Refund Processed", label: "Refund Done 💰", count: refundCount },
            { id: "Rejected", label: "Rejected ❌", count: returns.filter((r) => r.returnRequest?.status === "Rejected").length },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Returns List Cards */}
      {filteredReturns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <PackageOpen className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800">No return requests found</h3>
          <p className="mt-1 text-xs text-slate-500">
            Customer return and refund requests will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((order) => {
            const ret = order.returnRequest || {};
            const items = order.items || [];
            const isRefunded = ret.status === "Refund Processed";

            return (
              <div
                key={order._id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-slate-900">
                      ORDER #{order._id?.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      Requested on: {ret.requestedAt ? new Date(ret.requestedAt).toLocaleDateString("en-IN") : "Recent"}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${
                      ret.status === "Refund Processed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : ret.status === "Return Approved"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : ret.status === "Pickup Completed"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : ret.status === "Rejected"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    ● {ret.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400">Customer Details</p>
                    <p className="font-bold text-slate-900">{order.customerName}</p>
                    <p className="text-slate-600 flex items-center gap-1">
                      <Phone size={12} className="text-orange-500" /> +91 {order.phone}
                    </p>
                    <p className="text-slate-500 flex items-start gap-1">
                      <MapPin size={12} className="text-slate-400 mt-0.5 shrink-0" />
                      <span>{order.address}, {order.city} - {order.pincode}</span>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-slate-400">Return Reason & Issue</p>
                    <div className="inline-block bg-orange-50 border border-orange-200 text-orange-800 font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                      {ret.reason}
                    </div>
                    {ret.comments && (
                      <p className="text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                        "{ret.comments}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400">Refund Destination</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-slate-900">{ret.upiId || "Cash / Original Mode"}</span>
                      {ret.upiId && (
                        <button
                          onClick={() => handleCopyUpi(ret.upiId)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500 transition"
                          title="Copy UPI ID"
                        >
                          {copiedUpi === ret.upiId ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between items-baseline pt-1 border-t border-slate-200">
                      <span className="text-slate-500 font-medium">Refund Amount:</span>
                      <span className="text-sm font-black text-orange-600">₹{order.totalPrice}</span>
                    </div>
                    {ret.refundTransactionId && (
                      <p className="text-[10px] font-mono text-emerald-700 bg-emerald-50 p-1 rounded font-bold">
                        UTR: {ret.refundTransactionId}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 overflow-x-auto pt-2 border-t border-slate-100">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-2 rounded-xl shrink-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200">
                        <Image
                          src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="text-[11px]">
                        <p className="font-bold text-slate-900 max-w-[140px] truncate">{item.name}</p>
                        <p className="text-slate-500">Qty: {item.qty} • ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    {ret.status === "Return Requested" && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, "Return Approved")}
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        <Truck size={13} />
                        <span>Approve Pickup</span>
                      </button>
                    )}

                    {ret.status === "Return Approved" && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, "Pickup Completed")}
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark Received at Hub</span>
                      </button>
                    )}

                    {!isRefunded && (
                      <button
                        onClick={() => setRefundModalOrder(order)}
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs"
                      >
                        <CreditCard size={13} />
                        <span>Process Refund (Enter UTR)</span>
                      </button>
                    )}

                    {ret.status !== "Rejected" && !isRefunded && (
                      <button
                        onClick={() => handleUpdateStatus(order._id, "Rejected", "", "Item did not pass inspection")}
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                      >
                        <X size={13} />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleSendWhatsApp(order)}
                    className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ml-auto"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp Customer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {refundModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-600">Direct UPI Refund</p>
                <h3 className="text-base font-black text-slate-900">
                  Process ₹{refundModalOrder.totalPrice} Refund
                </h3>
              </div>
              <button
                onClick={() => setRefundModalOrder(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <p className="text-slate-500">Customer UPI Address:</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-900">
                  {refundModalOrder.returnRequest?.upiId || "Not specified"}
                </span>
                {refundModalOrder.returnRequest?.upiId && (
                  <button
                    onClick={() => handleCopyUpi(refundModalOrder.returnRequest.upiId)}
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Copy UPI
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Bank UTR / Transaction Reference ID:</label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 431289054123 (from GPay / PhonePe / NetBanking)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Admin Internal Notes (Optional):</label>
              <input
                type="text"
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="e.g. Refund sent via Corporate UPI"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRefundModalOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(
                    refundModalOrder._id,
                    "Refund Processed",
                    utrNumber || "MANUAL-PROCESSED",
                    adminNoteInput
                  )
                }
                disabled={processing}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                {processing ? "Saving..." : "Confirm & Mark Refunded"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}