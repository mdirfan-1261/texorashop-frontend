"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Tag, CheckCircle2, X } from "lucide-react";

const DEFAULT_COUPONS = [
  { code: "TEXORA50", discount: "₹50 Flat Off", minOrder: 499, active: true },
  { code: "FESTIVE20", discount: "20% Instant Discount", minOrder: 999, active: true },
  { code: "FREESHIP", discount: "100% Free Express Delivery", minOrder: 199, active: true },
];

export default function PriceDetailsSidebar({
  totalItems,
  subtotal,
  onPlaceOrder,
  placingOrder,
  appliedCoupon,
  setAppliedCoupon,
  couponDiscount = 0,
  deliveryFee = 0,
  standardFee = 40,
  freeThreshold = 499,
  isFreeDelivery = true,
  returnDays = 7,
}) {
  const [availableCoupons, setAvailableCoupons] = useState(DEFAULT_COUPONS);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [liveReturnDays, setLiveReturnDays] = useState(() => {
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
    return returnDays || 7;
  });

  useEffect(() => {
    function syncDays() {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) {
          const s = JSON.parse(saved);
          const days =
            s.returnWindowDays ||
            (s.badge3Label ? Number(s.badge3Label.match(/\d+/)?.[0]) : 7) ||
            7;
          setLiveReturnDays(days);
        }
      } catch (e) {}
    }
    syncDays();
    window.addEventListener("texora_settings_updated", syncDays);
    window.addEventListener("storage", syncDays);
    return () => {
      window.removeEventListener("texora_settings_updated", syncDays);
      window.removeEventListener("storage", syncDays);
    };
  }, []);

  useEffect(() => {
    if (returnDays) setLiveReturnDays(returnDays);
  }, [returnDays]);

    useEffect(() => {
    async function loadLiveCoupons() {
      try {
        const res = await fetch("http://localhost:5000/api/coupons");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setAvailableCoupons(data.filter((c) => c.active));
            localStorage.setItem("texora_coupons", JSON.stringify(data));
            return;
          }
        }
      } catch {}

      try {
        const saved = localStorage.getItem("texora_coupons");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setAvailableCoupons(parsed.filter((c) => c.active));
          }
        }
      } catch {}
    }
    loadLiveCoupons();
  }, []);

  const mrpTotal = Math.round(subtotal * 1.6);
  const mrpDiscount = mrpTotal - subtotal;
  const actualDeliveryCharge = isFreeDelivery ? 0 : Number(deliveryFee || 0);
  const finalPayable = Math.max(0, subtotal - couponDiscount + actualDeliveryCharge);
  const totalSavings = mrpDiscount + couponDiscount;

  const handleApplyCoupon = (couponObj) => {
    setPromoError("");
    if (subtotal < (Number(couponObj.minOrder) || 0)) {
      setPromoError(`Add items worth ₹${couponObj.minOrder} to use "${couponObj.code}"`);
      return;
    }
    if (setAppliedCoupon) {
      setAppliedCoupon(couponObj);
    }
    setPromoInput(couponObj.code);
  };

  const handleManualApply = (e) => {
    e.preventDefault();
    setPromoError("");
    const q = promoInput.trim().toUpperCase();
    if (!q) return;

    const found = availableCoupons.find((c) => c.code.toUpperCase() === q);
    if (!found) {
      setPromoError("Invalid or expired coupon code");
      return;
    }
    handleApplyCoupon(found);
  };

  const handleRemoveCoupon = () => {
    if (setAppliedCoupon) setAppliedCoupon(null);
    setPromoInput("");
    setPromoError("");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm sticky top-24 space-y-4">
      {/* 1. Coupons & Festive Offers Section */}
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-600 mb-2.5">
          <Tag size={14} />
          <span>Apply Coupon / Festive Offer</span>
        </div>

        {/* Manual Input */}
        {!appliedCoupon ? (
          <form onSubmit={handleManualApply} className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Enter promo code..."
              className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono font-bold uppercase text-gray-900 focus:border-[#f4511e] focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-gray-900 hover:bg-gray-800 px-3.5 py-2 text-xs font-bold text-white transition"
            >
              Apply
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-mono text-xs font-black text-emerald-900">
                  {appliedCoupon.code} Applied!
                </p>
                <p className="text-[10px] font-bold text-emerald-700">
                  {appliedCoupon.discount} (-₹{couponDiscount})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-md"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {promoError && (
          <p className="mt-1.5 text-[11px] font-bold text-rose-600">{promoError}</p>
        )}

        {/* Live Available Coupons from Admin */}
        {availableCoupons.length > 0 && !appliedCoupon && (
          <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
            <p className="text-[10px] font-bold uppercase text-gray-400">
              Available Store Coupons:
            </p>
            {availableCoupons.map((c, idx) => {
              const isEligible = subtotal >= (Number(c.minOrder) || 0);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-dashed border-orange-200 bg-orange-50/40 p-2.5 text-xs"
                >
                  <div>
                    <span className="font-mono font-black text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded text-[11px]">
                      {c.code}
                    </span>
                    <p className="font-bold text-gray-800 mt-1 text-[11px]">{c.discount}</p>
                    <p className="text-[10px] text-gray-500">
                      Min order: ₹{c.minOrder}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon(c)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-black transition ${
                      isEligible
                        ? "bg-[#f4511e] text-white hover:bg-[#d84315]"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    Apply
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Price Details Breakdown */}
      <div>
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-gray-500 pb-3 border-b border-gray-100">
          Price Details ({totalItems} {totalItems === 1 ? "Item" : "Items"})
        </h3>

        <div className="space-y-3 py-4 text-sm border-b border-gray-100">
          <div className="flex justify-between text-gray-700">
            <span>Total MRP</span>
            <span className="font-medium">₹{mrpTotal}</span>
          </div>

          <div className="flex justify-between text-emerald-600">
            <span>Discount on MRP</span>
            <span className="font-medium">- ₹{mrpDiscount}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold">
              <span>Coupon ({appliedCoupon?.code})</span>
              <span>- ₹{couponDiscount}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-700">
            <span>Delivery Fee</span>
            {isFreeDelivery ? (
              <div className="flex items-center gap-1.5">
                {standardFee > 0 && (
                  <span className="line-through text-xs text-gray-400">₹{standardFee}</span>
                )}
                <span className="text-emerald-600 font-bold text-xs uppercase">Free</span>
              </div>
            ) : (
              <span className="font-bold text-xs text-gray-900">₹{actualDeliveryCharge}</span>
            )}
          </div>

          {!isFreeDelivery && freeThreshold > 0 && subtotal < freeThreshold && (
            <p className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
              ⚡ Add items worth ₹{freeThreshold - subtotal} more for FREE Delivery!
            </p>
          )}
        </div>

        <div className="flex justify-between items-baseline py-4 border-b border-gray-100">
          <span className="font-black text-gray-900 text-base">Total Payable</span>
          <span className="font-black text-gray-900 text-xl">₹{finalPayable}</span>
        </div>

        {/* Shopsy Green Savings Strip */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 my-4 text-center">
          <p className="text-xs font-bold text-emerald-700">
            🎉 You will save ₹{totalSavings} on this order
          </p>
        </div>

        {/* Place Order Button */}
        <button
          onClick={onPlaceOrder}
          disabled={placingOrder || totalItems === 0}
          className="w-full bg-[#f4511e] hover:bg-[#d84315] text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-md shadow-orange-500/25 disabled:bg-gray-300 disabled:shadow-none"
        >
          {placingOrder ? "Placing Order..." : `Place Order (₹${finalPayable})`}
        </button>

        {/* Trust Seal */}
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-gray-500">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>100% Safe Payments & Easy {liveReturnDays || returnDays || 7}-Day Returns</span>
        </div>
      </div>
    </div>
  );
}