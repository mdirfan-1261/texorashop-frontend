"use client";

import React from "react";
import Link from "next/link";
import { Truck, Clock, ShieldCheck, MapPin, ArrowRight, Package, Sparkles, CheckCircle2 } from "lucide-react";

export default function ShippingInfoPage() {
  const deliveryTiers = [
    {
      title: "Standard Free Delivery",
      time: "2 - 4 Business Days",
      cost: "FREE",
      desc: "Available across 19,000+ pin codes in India on all orders.",
    },
    {
      title: "Express Metro Shipping",
      time: "24 - 48 Hours",
      cost: "FREE (Festive Offer)",
      desc: "Fast-track delivery for major cities: Delhi NCR, Mumbai, Bengaluru, Kolkata, Chennai, Hyderabad.",
    },
    {
      title: "Cash on Delivery (COD)",
      time: "Standard Timelines",
      cost: "Zero COD Surcharge",
      desc: "Pay in cash or via UPI QR to the delivery agent at the time of delivery.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-3">
              <Truck size={13} /> Fast & Reliable Logistics
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Shipping & Delivery Information
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-gray-300 leading-relaxed">
              We partner with India's top logistics providers including Delhivery, BlueDart, Ecom Express, and Shadowfax to ensure fast doorstep delivery.
            </p>
          </div>
        </div>

        {/* Delivery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {deliveryTiers.map((tier, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-2xs">
              <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {tier.cost}
              </span>
              <h3 className="font-bold text-sm text-gray-900 mt-2.5">{tier.title}</h3>
              <p className="text-xs font-black text-orange-600 mt-1 flex items-center gap-1">
                <Clock size={12} /> {tier.time}
              </p>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">{tier.desc}</p>
            </div>
          ))}
        </div>

        {/* Tracking info */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs mb-8">
          <h2 className="text-base sm:text-lg font-black text-gray-900 mb-3">
            Real-Time Live Order Tracking
          </h2>
          <p className="text-xs text-gray-600 leading-relaxed mb-4">
            Once your order is confirmed, you will receive an SMS and WhatsApp update with your tracking ID. You can also view live delivery milestones directly from your account.
          </p>
          <Link
            href="/track-order"
            className="inline-flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
          >
            <span>Track an Existing Order</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
