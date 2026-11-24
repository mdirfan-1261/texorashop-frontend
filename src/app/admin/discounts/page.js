"use client";

import React, { useState, useEffect } from "react";
import { Percent, Plus, Trash2, Tag, Copy, Check, RefreshCw, CheckCircle2 } from "lucide-react";

export default function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const getAdminToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) return token;
      const saved = localStorage.getItem("texora_admin");
      return saved ? JSON.parse(saved).token || "" : "";
    } catch {
      return "";
    }
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/coupons");
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.coupons || [];
        setCoupons(list);
        localStorage.setItem("texora_coupons", JSON.stringify(list));
      }
    } catch (e) {
      const cached = localStorage.getItem("texora_coupons");
      if (cached) setCoupons(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // 1. ADD NEW COUPON
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!code.trim() || !discount.trim()) {
      showToast("Please enter Code and Benefit");
      return;
    }

    const token = getAdminToken();
    try {
      const res = await fetch("http://localhost:5000/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discount: discount.trim(),
          minOrder: Number(minOrder) || 0,
        }),
      });

      const data = await res.json();

      if (res.ok && (data._id || data.coupon)) {
        const created = data.coupon || data;
        const updated = [created, ...coupons];
        setCoupons(updated);
        localStorage.setItem("texora_coupons", JSON.stringify(updated));
        setCode("");
        setDiscount("");
        setMinOrder("");
        showToast(`Coupon "${created.code}" saved to MongoDB!`);
      } else {
        showToast(data.message || "Failed to create coupon");
      }
    } catch (err) {
      showToast("Network error. Make sure backend is running.");
    }
  };

  // 2. TOGGLE ACTIVE / PAUSED
  const handleToggle = async (couponItem) => {
    const token = getAdminToken();
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${couponItem._id}/toggle`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const updatedCoupon = await res.json();
        const next = coupons.map((c) =>
          c._id === couponItem._id
            ? { ...c, active: updatedCoupon.active ?? !c.active, isActive: updatedCoupon.active ?? !c.active }
            : c
        );
        setCoupons(next);
        localStorage.setItem("texora_coupons", JSON.stringify(next));
        const isNowActive = updatedCoupon.active ?? updatedCoupon.isActive;
        showToast(`Coupon ${couponItem.code} is now ${isNowActive ? "Active" : "Paused"}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. DELETE COUPON
  const handleDelete = async (couponItem) => {
    if (!window.confirm(`Delete coupon "${couponItem.code}"?`)) return;

    const token = getAdminToken();
    try {
      const res = await fetch(`http://localhost:5000/api/coupons/${couponItem._id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const next = coupons.filter((c) => c._id !== couponItem._id);
        setCoupons(next);
        localStorage.setItem("texora_coupons", JSON.stringify(next));
        showToast(`Coupon "${couponItem.code}" deleted!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {toast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <Percent className="h-3 w-3" /> MongoDB Live Promotions
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Discounts & Coupon Codes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coupons created here are saved in MongoDB and verified server-side during checkout.
          </p>
        </div>

        <button
          onClick={fetchCoupons}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
          <span>Sync DB</span>
        </button>
      </div>

      {/* Create Form */}
      <form onSubmit={handleAddCoupon} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
          Create New Database Promo Code
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Code (e.g. CHHATH50)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Benefit (e.g. 50% Off or ₹100 Off)"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Min Order Value (₹)"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2.5 text-xs font-black transition shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Coupon</span>
          </button>
        </div>
      </form>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map((c, idx) => {
          const isItemActive = c.active ?? c.isActive ?? true;
          return (
            <div
              key={c._id || idx}
              className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 transition ${
                isItemActive ? "border-slate-200" : "border-slate-200 opacity-60 bg-slate-50/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-mono text-sm font-black text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-lg">
                    <Tag size={13} /> {c.code}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(c.code);
                      setCopied(c.code);
                      setTimeout(() => setCopied(null), 1500);
                    }}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    title="Copy code"
                  >
                    {copied === c.code ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                  </button>
                </div>

                <p className="text-base font-black text-slate-900 mt-3">
                  {c.discount || (c.discountValue ? `₹${c.discountValue} Flat Off` : "Discount")}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Minimum cart value: <strong>₹{c.minOrder ?? c.minOrderValue ?? 0}</strong>
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleToggle(c)}
                  className={`text-xs font-bold px-3 py-1 rounded-lg border cursor-pointer transition ${
                    isItemActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                      : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  {isItemActive ? "● Active" : "Paused"}
                </button>
                <button
                  onClick={() => handleDelete(c)}
                  className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition cursor-pointer"
                  title="Delete coupon"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}