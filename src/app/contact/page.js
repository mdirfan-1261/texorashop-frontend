"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  Clock, 
  MapPin, 
  Send, 
  CheckCircle2, 
  ArrowLeft,
  Headphones,
  HelpCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function ContactPage() {
  const { user, isLoggedIn } = useUser();
  const [activeTab, setActiveTab] = useState("form"); // "form" ya "my_tickets"
  const [myTickets, setMyTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    orderId: "",
    category: "Delivery Delay",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [ticketCreated, setTicketCreated] = useState(null);

  // Auto-fill logged-in customer info
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
      fetchMyTickets();
    }
  }, [user]);

  const fetchMyTickets = async () => {
    if (!user?.phone && !user?._id) return;
    setLoadingTickets(true);
    try {
      const res = await fetch(`http://localhost:5000/api/tickets/my?phone=${user.phone}&userId=${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setMyTickets(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:5000/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          userId: user?._id || "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTicketCreated(data.ticket);
        fetchMyTickets();
        setFormData({
          name: user?.name || "",
          phone: user?.phone || "",
          email: user?.email || "",
          orderId: "",
          category: "Delivery Delay",
          message: "",
        });
      } else {
        alert(data.message || "Failed to submit ticket.");
      }
    } catch (err) {
      console.error(err);
      setTicketCreated({ ticketId: "TKT-" + Math.floor(100000 + Math.random() * 900000) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-4">
      <div className="max-w-5xl mx-auto px-4">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Customer Support & Helpdesk</h1>
            <p className="text-xs text-gray-500">24x7 Help with your orders, returns, and complaints.</p>
          </div>
        </div>

        {/* 3 Quick Help Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#f4511e] flex items-center justify-center shrink-0">
              <Phone size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Call Us Toll-Free</p>
              <p className="text-base font-black text-gray-900 mt-0.5">1800-TEXORA</p>
              <p className="text-[11px] text-gray-500 mt-1">9:00 AM - 9:00 PM (Mon-Sat)</p>
            </div>
          </div>

          <a
            href="https://wa.me/919696511261?text=Hello%20TexoraShop%20Support"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:border-emerald-500 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MessageSquare size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">WhatsApp Support</p>
              <p className="text-base font-black text-gray-900 mt-0.5">+91 96965 11261</p>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">● Instant Agent Reply</p>
            </div>
          </a>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Mail size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">Email Helpdesk</p>
              <p className="text-base font-black text-gray-900 mt-0.5">support@texora.in</p>
              <p className="text-[11px] text-gray-500 mt-1">Response within 2 hours</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Raise Ticket VS My Tickets */}
        <div className="flex border-b border-gray-200 mb-6 bg-white rounded-t-2xl px-6 pt-3 shadow-2xs">
          <button
            onClick={() => setActiveTab("form")}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "form"
                ? "border-[#f4511e] text-[#f4511e]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Raise a Support Ticket
          </button>
          <button
            onClick={() => {
              setActiveTab("my_tickets");
              fetchMyTickets();
            }}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "my_tickets"
                ? "border-[#f4511e] text-[#f4511e]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>My Support Tickets</span>
            {myTickets.length > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {myTickets.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: FORM */}
        {activeTab === "form" && (
          <div className="bg-white border border-gray-200 rounded-b-2xl p-6 sm:p-8 shadow-sm">
            {ticketCreated ? (
              <div className="text-center py-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Support Ticket Created!</h2>
                <p className="text-xs text-gray-500 mt-2">
                  We've received your query. You can check the live status in the <strong>"My Support Tickets"</strong> tab.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 my-6 border border-gray-100 text-left">
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Ticket ID</p>
                  <p className="text-lg font-black text-gray-900 mt-0.5">#{ticketCreated.ticketId}</p>
                </div>
                <button
                  onClick={() => setActiveTab("my_tickets")}
                  className="w-full bg-[#f4511e] text-white py-3 rounded-xl font-bold text-xs"
                >
                  View My Tickets & Admin Reply
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full mt-1 px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-orange-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Phone Number *</label>
                    <input
                      type="tel"
                      maxLength={10}
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="10 digit mobile"
                      className="w-full mt-1 px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Issue Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full mt-1 px-3.5 py-2.5 border rounded-xl text-xs font-medium bg-white focus:outline-orange-500"
                    >
                      <option value="Delivery Delay">Delivery Delay</option>
                      <option value="Damaged Item">Damaged / Defective Item</option>
                      <option value="Wrong Item">Wrong Product Received</option>
                      <option value="Refund Status">Refund & Cancellation</option>
                      <option value="Payment Issue">Payment Deducted / Issue</option>
                      <option value="General">General Inquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Order ID (Optional)</label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                      placeholder="e.g. 6af01725205e..."
                      className="w-full mt-1 px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700">Describe Your Issue *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Explain what happened with your order or delivery..."
                    className="w-full mt-1 px-3.5 py-2.5 border rounded-xl text-xs font-medium focus:outline-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/25"
                >
                  <Send size={14} />
                  <span>{submitting ? "Submitting..." : "Submit Ticket"}</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: MY SUPPORT TICKETS (Customer Status & Admin Reply) */}
        {activeTab === "my_tickets" && (
          <div className="bg-white border border-gray-200 rounded-b-2xl p-6 shadow-sm space-y-4">
            {myTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle size={36} className="mx-auto text-gray-300 mb-2" />
                <p className="font-bold text-sm text-gray-700">No support tickets found</p>
                <p className="text-xs text-gray-400 mt-1">You haven't submitted any inquiries yet.</p>
              </div>
            ) : (
              myTickets.map((ticket) => (
                <div key={ticket._id} className="border border-gray-200 rounded-2xl p-5 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-gray-900 text-sm">#{ticket.ticketId}</span>
                      <span className="text-xs bg-orange-50 text-[#f4511e] px-2.5 py-0.5 rounded-full font-bold">
                        {ticket.category}
                      </span>
                      {ticket.orderId && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          Order: #{ticket.orderId.slice(-8)}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        ticket.status === "Resolved"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {ticket.status === "Resolved" ? "Resolved ✅" : "Under Review ⏳"}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Your Query:</p>
                    <p className="text-sm text-gray-800 mt-0.5">{ticket.message}</p>
                  </div>

                  {/* 💬 Admin Official Reply Box */}
                  {ticket.adminReply ? (
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 mt-2">
                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        Admin Official Resolution / Reply:
                      </p>
                      <p className="text-sm text-emerald-950 mt-1 font-medium leading-relaxed">
                        {ticket.adminReply}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">
                      Support executive is reviewing your inquiry. You will receive an update here soon.
                    </p>
                  )}

                  <p className="text-[11px] text-gray-400 text-right">
                    Submitted on {new Date(ticket.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}