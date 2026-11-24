
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  RotateCcw,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock3,
  Truck,
  Phone,
  MapPin,
  X,
  CreditCard,
  MessageSquare,
  Copy,
  Check,
  PackageOpen,
  ArrowUpRight,
  Wallet,
  PackageCheck,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

const API = "http://localhost:5000/api/orders";

const STATUS = {
  "Return Requested": "amber",
  "Return Approved": "blue",
  "Pickup Completed": "violet",
  "Refund Processed": "emerald",
  Rejected: "rose",
};

const statusStyles = {
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

const tabs = [
  { id: "all", label: "All Returns" },
  { id: "Return Requested", label: "Pending" },
  { id: "Return Approved", label: "Pickup Scheduled" },
  { id: "Pickup Completed", label: "Received" },
  { id: "Refund Processed", label: "Refunded" },
  { id: "Rejected", label: "Rejected" },
];

const money = (value) =>
  `₹${(Number(value) || 0).toLocaleString("en-IN")}`;

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReturns = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API}/returns/all`);

      if (!res.ok) throw new Error("Unable to fetch returns");

      const data = await res.json();
      setReturns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load return requests", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async (
    orderId,
    status,
    refundTxn = "",
    notes = ""
  ) => {
    setProcessing(true);

    try {
      const res = await fetch(`${API}/${orderId}/return-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          refundTransactionId: refundTxn,
          adminNotes: notes,
        }),
      });

      if (!res.ok) throw new Error("Status update failed");

      setReturns((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? {
                ...order,
                returnRequest: {
                  ...order.returnRequest,
                  status,
                  refundTransactionId:
                    refundTxn ||
                    order.returnRequest?.refundTransactionId,
                  adminNotes:
                    notes || order.returnRequest?.adminNotes,
                },
              }
            : order
        )
      );

      showToast(`Return updated: ${status}`);

      setRefundModalOrder(null);
      setUtrNumber("");
      setAdminNoteInput("");
    } catch (error) {
      console.error(error);
      showToast(error.message || "Something went wrong", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyUpi = async (upi) => {
    if (!upi) return;

    try {
      await navigator.clipboard.writeText(upi);
      setCopiedUpi(upi);
      setTimeout(() => setCopiedUpi(null), 1800);
      showToast("UPI ID copied");
    } catch {
      showToast("Unable to copy UPI ID", "error");
    }
  };

  const handleSendWhatsApp = (order) => {
    const phone = String(order.phone || "").replace(/\D/g, "");

    if (!phone) {
      showToast("Customer phone number unavailable", "error");
      return;
    }

    const ret = order.returnRequest || {};

    const message = encodeURIComponent(
      `Hello ${order.customerName || "Customer"},\n\nUpdate regarding your TexoraShop return.\n\nOrder: #${order._id.slice(-8).toUpperCase()}\nStatus: ${ret.status || "In Review"}\n${ret.refundTransactionId ? `UTR: ${ret.refundTransactionId}\n` : ""}\nThank you for shopping with TexoraShop!`
    );

    window.open(
      `https://wa.me/${phone.startsWith("91") ? phone : `91${phone}`}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const getCount = (status) =>
    returns.filter((r) => r.returnRequest?.status === status).length;

  const totalRefundAmount = returns
    .filter((r) => r.returnRequest?.status === "Refund Processed")
    .reduce((sum, r) => sum + (Number(r.totalPrice) || 0), 0);

  const metrics = [
    {
      label: "Total Returns",
      value: returns.length,
      icon: RotateCcw,
      color: "slate",
    },
    {
      label: "Pending Review",
      value: getCount("Return Requested"),
      icon: Clock3,
      color: "amber",
    },
    {
      label: "Pickup Scheduled",
      value: getCount("Return Approved"),
      icon: Truck,
      color: "blue",
    },
    {
      label: "Received at Hub",
      value: getCount("Pickup Completed"),
      icon: PackageCheck,
      color: "violet",
    },
    {
      label: "Refunded Amount",
      value: money(totalRefundAmount),
      icon: Wallet,
      color: "emerald",
    },
  ];

  const metricColors = {
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  const filteredReturns = returns.filter((order) => {
    const ret = order.returnRequest || {};

    if (activeTab !== "all" && ret.status !== activeTab) {
      return false;
    }

    const q = searchQuery.toLowerCase().trim();

    if (!q) return true;

    return [
      order._id,
      order.customerName,
      order.phone,
      ret.upiId,
      ret.reason,
    ].some((value) => String(value || "").toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen space-y-5 bg-[#f8fafc] pb-8 text-slate-800">

      {/* Toast */}
      {toast && (
        <div className="fixed right-5 top-5 z-[100] flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">
          {toast.type === "error" ? (
            <AlertCircle size={17} className="text-rose-500" />
          ) : (
            <CheckCircle2 size={17} className="text-emerald-500" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)}>
            <X size={15} className="text-slate-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold text-slate-400">
            <span>Admin</span>
            <span>/</span>
            <span>Orders</span>
            <span>/</span>
            <span className="text-orange-600">Returns</span>
          </div>

          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Returns Management
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Manage returns, pickups and customer refunds.
          </p>
        </div>

        <button
          onClick={fetchReturns}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-orange-300 hover:text-orange-600 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {metric.label}
                </p>

                <div className={`rounded-lg p-2 ${metricColors[metric.color]}`}>
                  <Icon size={15} />
                </div>
              </div>

              <p className="mt-2 text-xl font-extrabold tracking-tight text-slate-900">
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Return Requests
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-400">
              View and manage customer return applications
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search orders, customer, UPI..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium outline-none transition focus:border-orange-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-slate-100 px-4 pt-3 scrollbar-none">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;

            const count =
              tab.id === "all"
                ? returns.length
                : getCount(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-[11px] font-bold transition ${
                  active
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}

                <span
                  className={`rounded-md px-1.5 py-0.5 text-[9px] ${
                    active
                      ? "bg-orange-50 text-orange-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results */}
        <div className="space-y-3 p-4">

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <PackageOpen size={23} className="text-slate-400" />
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-800">
                No return requests found
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or selected status.
              </p>
            </div>
          ) : (
            filteredReturns.map((order) => {
              const ret = order.returnRequest || {};
              const items = order.items || [];
              const refunded = ret.status === "Refund Processed";
              const tone = STATUS[ret.status] || "amber";

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                >

                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-extrabold text-slate-900">
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>

                      <span className="h-3 w-px bg-slate-200" />

                      <span className="text-[10px] text-slate-500">
                        {ret.requestedAt
                          ? new Date(ret.requestedAt).toLocaleDateString("en-IN")
                          : "Recently requested"}
                      </span>
                    </div>

                    <span
                      className={`rounded-md border px-2.5 py-1 text-[10px] font-bold ${statusStyles[tone]}`}
                    >
                      {ret.status || "Return Requested"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr_0.9fr]">

                    {/* Customer */}
                    <div>
                      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Customer
                      </p>

                      <p className="text-xs font-bold text-slate-900">
                        {order.customerName || "Customer"}
                      </p>

                      <a
                        href={`tel:${order.phone || ""}`}
                        className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-orange-600"
                      >
                        <Phone size={12} />
                        {order.phone || "Phone unavailable"}
                      </a>

                      <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-500">
                        <MapPin size={12} className="mt-0.5 shrink-0" />
                        {[
                          order.address,
                          order.city,
                          order.pincode,
                        ].filter(Boolean).join(", ") || "Address unavailable"}
                      </p>
                    </div>

                    {/* Return Reason */}
                    <div>
                      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        Return Reason
                      </p>

                      <span className="inline-block rounded-md bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                        {ret.reason || "Not specified"}
                      </span>

                      {ret.comments && (
                        <p className="mt-2 rounded-lg bg-slate-50 p-2 text-[11px] leading-relaxed text-slate-600">
                          {ret.comments}
                        </p>
                      )}
                    </div>

                    {/* Refund Details */}
                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Refund Details
                        </p>

                        <IndianRupee size={14} className="text-orange-500" />
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="max-w-[180px] truncate font-mono text-[11px] font-bold text-slate-800">
                          {ret.upiId || "Original Payment Mode"}
                        </span>

                        {ret.upiId && (
                          <button
                            onClick={() => handleCopyUpi(ret.upiId)}
                            title="Copy UPI"
                            className="rounded p-1 text-slate-400 hover:bg-white hover:text-orange-600"
                          >
                            {copiedUpi === ret.upiId ? (
                              <Check size={13} />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                        <span className="text-[10px] text-slate-500">
                          Amount
                        </span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {money(order.totalPrice)}
                        </span>
                      </div>

                      {ret.refundTransactionId && (
                        <p className="mt-2 truncate rounded-md bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold text-emerald-700">
                          UTR: {ret.refundTransactionId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Products */}
                  <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3">
                    <span className="mr-1 text-[10px] font-bold text-slate-400">
                      ITEMS
                    </span>

                    {items.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-1.5"
                      >
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white">
                          <Image
                            src={
                              item.image ||
                              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
                            }
                            alt={item.name || "Product"}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </div>

                        <div className="max-w-[120px]">
                          <p className="truncate text-[10px] font-bold text-slate-800">
                            {item.name || "Product"}
                          </p>
                          <p className="text-[9px] text-slate-500">
                            Qty: {item.qty || 1} · {money(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-4 py-3">

                    <div className="flex flex-wrap items-center gap-2">

                      {ret.status === "Return Requested" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(order._id, "Return Approved")
                          }
                          disabled={processing}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Truck size={13} />
                          Approve Pickup
                        </button>
                      )}

                      {ret.status === "Return Approved" && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(order._id, "Pickup Completed")
                          }
                          disabled={processing}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-violet-700 disabled:opacity-50"
                        >
                          <PackageCheck size={13} />
                          Mark Received
                        </button>
                      )}

                      {!refunded && ret.status !== "Rejected" && (
                        <button
                          onClick={() => {
                            setRefundModalOrder(order);
                            setUtrNumber("");
                            setAdminNoteInput("");
                          }}
                          disabled={processing}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        >
                          <CreditCard size={13} />
                          Process Refund
                        </button>
                      )}

                      {ret.status !== "Rejected" && !refunded && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(
                              order._id,
                              "Rejected",
                              "",
                              "Item did not pass inspection"
                            )
                          }
                          disabled={processing}
                          className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-[10px] font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(order)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[10px] font-bold text-emerald-700 transition hover:bg-emerald-50"
                    >
                      <MessageSquare size={13} />
                      WhatsApp
                      <ArrowUpRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Count */}
        {!loading && filteredReturns.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-3 text-[10px] font-medium text-slate-400">
            Showing {filteredReturns.length} of {returns.length} return requests
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModalOrder && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[3px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !processing) {
              setRefundModalOrder(null);
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <Wallet size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Process Refund
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Order #{refundModalOrder._id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>

              <button
                disabled={processing}
                onClick={() => setRefundModalOrder(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-4 p-5">

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Total Refund Amount
                </p>

                <p className="mt-1 text-2xl font-black text-emerald-700">
                  {money(refundModalOrder.totalPrice)}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold text-slate-400">
                  Customer UPI ID
                </p>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="break-all font-mono text-xs font-bold text-slate-800">
                    {refundModalOrder.returnRequest?.upiId || "Not specified"}
                  </span>

                  {refundModalOrder.returnRequest?.upiId && (
                    <button
                      onClick={() =>
                        handleCopyUpi(refundModalOrder.returnRequest.upiId)
                      }
                      className="shrink-0 text-[10px] font-bold text-orange-600 hover:underline"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-700">
                  Bank UTR / Transaction Reference ID
                  <span className="ml-1 text-rose-500">*</span>
                </label>

                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter actual bank transaction UTR"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <p className="mt-1 text-[10px] text-slate-400">
                  Enter the reference ID received after completing the refund.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-slate-700">
                  Internal Admin Notes
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  rows={2}
                  value={adminNoteInput}
                  onChange={(e) => setAdminNoteInput(e.target.value)}
                  placeholder="Add internal refund notes..."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  disabled={processing}
                  onClick={() => setRefundModalOrder(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  disabled={processing || !utrNumber.trim()}
                  onClick={() =>
                    handleUpdateStatus(
                      refundModalOrder._id,
                      "Refund Processed",
                      utrNumber.trim(),
                      adminNoteInput.trim()
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processing ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  {processing ? "Processing..." : "Confirm Refund"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
