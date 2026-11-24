"use client";

import React, { useState, useEffect } from "react";
import { Percent, Plus, Trash2, CheckCircle2, Tag, Copy, Check } from "lucide-react";

const DEFAULT_COUPONS = [
  { code: "TEXORA50", discount: "₹50 Flat Off", minOrder: 499, active: true },
  { code: "FESTIVE20", discount: "20% Instant Discount", minOrder: 999, active: true },
  { code: "FREESHIP", discount: "100% Free Express Delivery", minOrder: 199, active: true },
];

export default function AdminDiscountsPage() {
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("texora_coupons");
      if (saved) setCoupons(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const saveCoupons = (updated) => {
    setCoupons(updated);
    localStorage.setItem("texora_coupons", JSON.stringify(updated));
  };

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!code.trim() || !discount.trim()) return;
    const next = [
      {
        code: code.toUpperCase().trim(),
        discount: discount.trim(),
        minOrder: Number(minOrder) || 0,
        active: true,
      },
      ...coupons,
    ];
    saveCoupons(next);
    setCode("");
    setDiscount("");
    setMinOrder("");
  };

  const toggleCoupon = (idx) => {
    const next = coupons.map((c, i) => (i === idx ? { ...c, active: !c.active } : c));
    saveCoupons(next);
  };

  const deleteCoupon = (idx) => {
    const next = coupons.filter((_, i) => i !== idx);
    saveCoupons(next);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
          <Percent className="h-3 w-3" /> Promotions & Campaigns
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          Discounts & Coupon Codes
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Create promotional coupon codes and festive offers for your storefront.
        </p>
      </div>

      {/* Create New Coupon Form */}
      <form onSubmit={handleAddCoupon} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
          Create New Promo Code
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Code (e.g. WELCOME100)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold uppercase text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Benefit (e.g. ₹100 OFF / 15% OFF)"
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
            className="inline-flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-4 py-2.5 text-xs font-black transition shadow-sm"
          >
            <Plus size={15} />
            <span>Add Coupon</span>
          </button>
        </div>
      </form>

      {/* Active Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {coupons.map((c, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4"
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
                  className="text-slate-400 hover:text-slate-700"
                >
                  {copied === c.code ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                </button>
              </div>
              <p className="text-base font-black text-slate-900 mt-3">{c.discount}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Minimum cart value: <strong>₹{c.minOrder}</strong>
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => toggleCoupon(idx)}
                className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                  c.active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {c.active ? "● Active" : "Paused"}
              </button>
              <button
                onClick={() => deleteCoupon(idx)}
                className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}