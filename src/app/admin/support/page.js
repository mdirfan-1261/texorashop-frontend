"use client";

import React, { useState, useEffect } from "react";
import { 
  Headphones, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Phone, 
  Loader2, 
  PackageX,
  MessageSquare,
  CheckCircle2,
  X,
  Calendar as CalendarIcon,
  Send,
  Eye,
  Filter,
  ArrowRight,
  TrendingUp,
  FileText
} from "lucide-react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // Default to "all" so tickets are always visible!
  const [selectedDate, setSelectedDate] = useState(""); // YYYY-MM-DD
  const [dateQuickFilter, setDateQuickFilter] = useState("all");

  // Modal & Toast States
  const [activeTicketModal, setActiveTicketModal] = useState(null);
  const [replyInput, setReplyInput] = useState("");
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Quick Date Filter Handlers
  const handleQuickDate = (type) => {
    setDateQuickFilter(type);
    const today = new Date();
    if (type === "today") {
      setSelectedDate(today.toISOString().split("T")[0]);
    } else if (type === "yesterday") {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      setSelectedDate(y.toISOString().split("T")[0]);
    } else {
      setSelectedDate("");
    }
  };

  const handleResolveTicket = async (status) => {
    if (!activeTicketModal) return;
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/${activeTicketModal._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status,
          adminReply: replyInput || activeTicketModal.adminReply,
          resolvedBy: "Admin",
        }),
      });

      if (res.ok) {
        const now = new Date().toISOString();
        setTickets((prev) =>
          prev.map((t) =>
            t._id === activeTicketModal._id
              ? { ...t, status, adminReply: replyInput || t.adminReply, resolvedAt: now }
              : t
          )
        );
        showToast(`Ticket #${activeTicketModal.ticketId} marked as ${status}!`);
        setActiveTicketModal(null);
        setReplyInput("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendWhatsApp = (ticket, customMsg) => {
    const textToSend = customMsg || ticket.adminReply || "Your inquiry has been resolved.";
    const message = encodeURIComponent(
      `Hello ${ticket.name}, your TexoraShop Support Ticket #${ticket.ticketId} (${ticket.category}) status is now RESOLVED.\n\nResolution: ${textToSend}\n\nThank you for shopping with TexoraShop!`
    );
    window.open(`https://wa.me/91${ticket.phone}?text=${message}`, "_blank");
  };

  // Filter Logic
  const filteredTickets = tickets.filter((t) => {
    if (activeTab === "pending" && t.status === "Resolved") return false;
    if (activeTab === "resolved" && t.status !== "Resolved") return false;

    if (selectedDate) {
      const ticketDate = new Date(t.createdAt).toISOString().split("T")[0];
      const resolvedDate = t.resolvedAt ? new Date(t.resolvedAt).toISOString().split("T")[0] : null;
      if (activeTab === "resolved" && resolvedDate) {
        if (resolvedDate !== selectedDate) return false;
      } else {
        if (ticketDate !== selectedDate) return false;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        t.ticketId?.toLowerCase().includes(q) ||
        t.name?.toLowerCase().includes(q) ||
        t.phone?.includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.orderId?.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const pendingCount = tickets.filter((t) => t.status !== "Resolved").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <div className="space-y-6">
      {/* 🚀 Floating Smooth Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <p className="text-xs font-bold">{toast}</p>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              <Headphones className="h-3 w-3" /> 24x7 Helpdesk
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Customer Support & Ticket Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review customer complaints, filter by real calendar dates, and resolve tickets instantly.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-orange-600 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 2. Calendar & Date Filtering Strip (High Contrast Light Theme) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Quick Date Chips + Interactive Calendar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mr-1">
              <CalendarIcon size={14} className="text-orange-500" /> Filter by Date:
            </span>

            {[
              { id: "all", label: "All Dates" },
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
            ].map((chip) => {
              const isSelected = dateQuickFilter === chip.id && !selectedDate;
              return (
                <button
                  key={chip.id}
                  onClick={() => handleQuickDate(chip.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {chip.label}
                </button>
              );
            })}

            {/* Interactive Calendar Picker */}
            <div className="relative inline-flex items-center gap-1.5 bg-slate-50 border border-slate-300 hover:border-orange-500 px-3 py-1.5 rounded-xl transition">
              <CalendarIcon size={13} className="text-slate-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setDateQuickFilter("custom");
                }}
                className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer focus:outline-none"
              />
            </div>

            {selectedDate && (
              <button
                onClick={() => handleQuickDate("all")}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition"
              >
                Clear Date ✕
              </button>
            )}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full lg:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, ticket ID..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* 3. Strict 3-Tab Segregation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-6 pt-3 shadow-2xs gap-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 px-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "all"
              ? "border-orange-500 text-orange-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>📋 All Inquiries</span>
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-black">
            {tickets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-3 px-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "pending"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>⏳ Needs Action / Pending</span>
          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black">
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("resolved")}
          className={`pb-3 px-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "resolved"
              ? "border-emerald-500 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>✅ Resolved Archive</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black">
            {resolvedCount}
          </span>
        </button>
      </div>

      {/* 4. High-Density White Table View */}
      <div className="bg-white border border-slate-200 rounded-b-2xl overflow-hidden shadow-2xs">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="animate-spin text-orange-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">Loading support records...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="py-16 text-center text-slate-500 px-4">
            <PackageX size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-black text-base text-slate-800">No tickets found in this view</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {activeTab === "pending" && resolvedCount > 0
                ? `Great job! You have 0 pending tickets. Check the Resolved Archive to view all ${resolvedCount} resolved tickets.`
                : selectedDate
                ? `No support requests found for ${selectedDate}.`
                : "Try resetting your search query or switching tabs."}
            </p>
            {activeTab === "pending" && resolvedCount > 0 && (
              <button
                onClick={() => setActiveTab("resolved")}
                className="mt-4 inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                <span>View Resolved Archive ({resolvedCount})</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Ticket & Created Date</th>
                  <th className="p-4">Customer Info</th>
                  <th className="p-4">Category & Order</th>
                  <th className="p-4 max-w-xs">Customer Message</th>
                  {activeTab === "resolved" && <th className="p-4">Resolution & Date</th>}
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => {
                  const createdDate = new Date(t.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  const resolvedDate = t.resolvedAt
                    ? new Date(t.resolvedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Resolved";

                  const isResolved = t.status === "Resolved";

                  return (
                    <tr key={t._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ticket ID & Created Date */}
                      <td className="p-4 font-mono">
                        <span className="font-bold text-slate-900 text-xs block">#{t.ticketId}</span>
                        <span className="text-[10px] text-slate-400">{createdDate}</span>
                      </td>

                      {/* Customer Info */}
                      <td className="p-4">
                        <span className="font-bold text-slate-900 block">{t.name}</span>
                        <a
                          href={`tel:${t.phone}`}
                          className="text-[11px] text-orange-600 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                        >
                          <Phone size={10} /> +91 {t.phone}
                        </a>
                      </td>

                      {/* Category & Order ID */}
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          {t.category}
                        </span>
                        {t.orderId ? (
                          <span className="block text-[10px] text-slate-500 mt-1 font-mono font-semibold">
                            Ord: #{t.orderId.slice(-8)}
                          </span>
                        ) : (
                          <span className="block text-[10px] text-slate-400 mt-1">General</span>
                        )}
                      </td>

                      {/* Customer Inquiry */}
                      <td className="p-4 max-w-xs">
                        <p className="line-clamp-2 text-slate-700 text-xs leading-relaxed" title={t.message}>
                          {t.message}
                        </p>
                      </td>

                      {/* Resolved Timestamp & Solution */}
                      {activeTab === "resolved" && (
                        <td className="p-4 max-w-xs">
                          <span className="text-[10px] font-bold text-emerald-700 block">
                            ✅ {resolvedDate}
                          </span>
                          <p className="text-[11px] text-slate-600 italic line-clamp-1 mt-0.5">
                            "{t.adminReply || "Issue resolved directly"}"
                          </p>
                        </td>
                      )}

                      {/* Status Badge */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            isResolved
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                          {isResolved ? "Resolved" : "Pending Action"}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setActiveTicketModal(t);
                            setReplyInput(t.adminReply || "");
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs ${
                            isResolved
                              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                              : "bg-[#f4511e] hover:bg-[#d84315] text-white"
                          }`}
                        >
                          <MessageSquare size={13} />
                          <span>{isResolved ? "View Reply" : "Resolve 💬"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 💬 Crisp Modal: Action & Resolution Center (Light Theme) */}
      {activeTicketModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
                  TICKET RESOLUTION
                </span>
                <h3 className="font-mono font-black text-slate-900 text-base">
                  #{activeTicketModal.ticketId}
                </h3>
              </div>
              <button
                onClick={() => setActiveTicketModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Customer Header Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-black text-slate-900 text-sm">{activeTicketModal.name}</p>
                  <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                    <Phone size={12} className="text-orange-500" /> +91 {activeTicketModal.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                    {activeTicketModal.category}
                  </span>
                  {activeTicketModal.orderId && (
                    <p className="text-[10px] text-slate-500 mt-1 font-mono font-semibold">
                      Ord: #{activeTicketModal.orderId.slice(-8)}
                    </p>
                  )}
                </div>
              </div>

              {/* Customer Full Message */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Customer Complaint:
                </label>
                <p className="text-xs text-slate-800 mt-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  {activeTicketModal.message}
                </p>
              </div>

              {/* Quick Reply Presets */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Reply Templates:
                </label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    "Parcel dispatched via express courier. Delivery expected today.",
                    "Full refund has been processed to your bank account / UPI.",
                    "Replacement product has been booked. Tracking ID TX78942.",
                    "Issue has been verified with delivery partner and rectified.",
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setReplyInput(preset)}
                      className="text-[10px] bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition text-left font-medium"
                    >
                      + {preset.slice(0, 36)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply Textarea */}
              <div>
                <label className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
                  Official Solution / Reply (Customer can see this):
                </label>
                <textarea
                  rows={3}
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  placeholder="Type your resolution message for the customer..."
                  className="w-full mt-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => handleResolveTicket("Resolved")}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={15} />
                  <span>{updating ? "Saving..." : "Save & Move to Resolved Archive ✅"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(activeTicketModal, replyInput)}
                  className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={14} />
                  <span>Send Notification on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}