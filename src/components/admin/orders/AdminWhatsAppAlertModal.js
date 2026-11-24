"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  ExternalLink,
  Check,
  Copy,
  Clock,
  Sparkles,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

const EVENT_PRESETS = [
  { id: "ORDER_PLACED", label: "Order Placed", icon: "🛍️" },
  { id: "STATUS_CONFIRMED", label: "Confirmed / Packing", icon: "📋" },
  { id: "STATUS_SHIPPED", label: "Shipped / In Transit", icon: "🚚" },
  { id: "STATUS_OUT_FOR_DELIVERY", label: "Out for Delivery", icon: "🛵" },
  { id: "STATUS_DELIVERED", label: "Delivered", icon: "🎉" },
  { id: "STATUS_CANCELLED", label: "Cancelled", icon: "❌" },
  { id: "RETURN_APPROVED", label: "Return Approved", icon: "✅" },
  { id: "REFUND_PROCESSED", label: "Refund Done", icon: "💰" },
];

export default function AdminWhatsAppAlertModal({ order, isOpen, onClose, onNotificationSent }) {
  if (!isOpen || !order) return null;

  const initialEvent = (() => {
    const s = (order.status || "").toLowerCase();
    if (s.includes("shipped")) return "STATUS_SHIPPED";
    if (s.includes("out")) return "STATUS_OUT_FOR_DELIVERY";
    if (s.includes("delivered")) return "STATUS_DELIVERED";
    if (s.includes("cancelled")) return "STATUS_CANCELLED";
    if (s.includes("confirmed")) return "STATUS_CONFIRMED";
    return "ORDER_PLACED";
  })();

  const [eventType, setEventType] = useState(initialEvent);
  const [message, setMessage] = useState("");
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch Message Preview
  const loadPreview = async (selectedEvent = eventType) => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/notifications/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          eventType: selectedEvent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setMessage(data.message);
          setWhatsappUrl(data.whatsappLink);
          setPhone(data.phone);
        }
      }
    } catch (err) {
      console.error("Failed to load preview:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Order's Notification History
  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/order/${order._id}`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.notifications || []);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadPreview(initialEvent);
    loadHistory();
  }, [order._id]);

  const handleSelectEvent = (newEvt) => {
    setEventType(newEvt);
    loadPreview(newEvt);
  };

  // 1-Click WhatsApp Open
  const handleOpenWhatsApp = () => {
    if (!phone) {
      alert("No valid phone number found for this customer.");
      return;
    }
    // Encode current message state if edited
    const encoded = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?phone=91${phone}&text=${encoded}`;
    window.open(url, "_blank", "noopener,noreferrer");

    // Also trigger log in backend
    handleDispatchAutomated(true);
  };

  // Automated Dispatch via Backend API (Fast2SMS / 2Factor + Database Log)
  const handleDispatchAutomated = async (silent = false) => {
    setSending(true);
    try {
      const res = await fetch("http://localhost:5000/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          eventType,
          customNote: message,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (!silent) {
          setToast("WhatsApp & SMS alert logged and dispatched successfully!");
          setTimeout(() => setToast(""), 4000);
        }
        loadHistory();
        if (onNotificationSent) onNotificationSent(data);
      }
    } catch (err) {
      if (!silent) alert("Failed to dispatch alert: " + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleCopy = () => {
    if (!message) return;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const customerName = order.customerName || order.shippingAddress?.name || "Customer";
  const orderNumber = `TXO-${order._id?.slice(-8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-4 animate-in fade-in">
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-emerald-50/70 px-4 py-3 dark:border-slate-800 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  AUTOMATED ORDER ALERTS
                </span>
                <span className="rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  WhatsApp + SMS
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Send Notification for #{orderNumber}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Toast Alert */}
          {toast && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {/* Customer & Order Summary Pill */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 dark:bg-slate-800/50 dark:ring-slate-800 text-xs">
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Customer</p>
              <p className="font-bold text-slate-800 dark:text-white truncate">{customerName}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Phone</p>
              <p className="font-mono font-bold text-slate-800 dark:text-white truncate">
                +91 {phone || order.phone || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Order Amount</p>
              <p className="font-mono font-bold text-orange-600 dark:text-orange-400">
                ₹{Number(order.totalPrice || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400">Current Status</p>
              <span className="inline-block font-bold text-emerald-600 dark:text-emerald-400">
                {order.status || "Pending"}
              </span>
            </div>
          </div>

          {/* Quick Event Presets */}
          <div>
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Select Notification Template:
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EVENT_PRESETS.map((p) => {
                const isActive = eventType === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectEvent(p.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editable Live Message Preview */}
          <div>
            <div className="flex items-center justify-between pb-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Message Preview (Editable):
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>
            </div>

            <div className="relative">
              {loading ? (
                <div className="flex h-44 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40">
                  <Loader2 size={20} className="animate-spin text-emerald-600" />
                </div>
              ) : (
                <textarea
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 font-mono text-xs leading-relaxed text-slate-800 shadow-inner focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
                  placeholder="Notification text will appear here..."
                />
              )}
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              💡 Tip: Contains direct tracking link and GST Invoice download URL automatically.
            </p>
          </div>

          {/* Previous Notifications Sent for this Order */}
          {history.length > 0 && (
            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recent Alerts Sent ({history.length}):
                </p>
                <button
                  type="button"
                  onClick={loadHistory}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Refresh history"
                >
                  <RefreshCw size={11} className={loadingHistory ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {history.map((h, i) => (
                  <div
                    key={h._id || i}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] ring-1 ring-slate-100 dark:bg-slate-800/40 dark:ring-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {h.eventType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        SMS: {h.smsStatus || "Sent"}
                      </span>
                      <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[9px] text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                        WhatsApp: Ready
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* Background Automated Dispatch Button */}
            <button
              type="button"
              disabled={sending || loading}
              onClick={() => handleDispatchAutomated(false)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {sending ? <Loader2 size={13} className="animate-spin text-emerald-600" /> : <Send size={13} />}
              <span>{sending ? "Sending..." : "Dispatch SMS & Log"}</span>
            </button>

            {/* 1-Click WhatsApp Direct Open Button */}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-60"
            >
              <MessageSquare size={14} className="fill-current" />
              <span>Open in WhatsApp</span>
              <ExternalLink size={12} className="opacity-80" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
