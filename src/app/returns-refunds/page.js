"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Truck,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Clock,
  PhoneCall,
  PackageCheck,
  AlertCircle,
  Sparkles
} from "lucide-react";

export default function ReturnsRefundsPage() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How do I return or replace an item on TexoraShop?",
      a: "Go to your 'My Orders' section, find the delivered order, and click on 'Return / Replace'. Select your reason, enter your UPI ID for instant refund, and submit. Our courier executive will visit your address for free doorstep pickup."
    },
    {
      q: "Do I have to pay any delivery charges for returning an item?",
      a: "No! TexoraShop provides 100% FREE doorstep pickup for all valid return requests. You do not need to pay anything to the delivery partner."
    },
    {
      q: "How will I receive my refund for Cash on Delivery (COD) orders?",
      a: "When submitting a return request, you can enter your UPI ID (GPay, PhonePe, Paytm, BHIM) or bank account details. As soon as the item is picked up and verified, the full refund amount is transferred directly to your UPI/bank within 24 hours."
    },
    {
      q: "What is the return window for clothing and footwear?",
      a: "All clothing, apparel, footwear, and accessories carry a 7-day hassle-free return and replacement policy from the day of delivery, provided tags and packaging are intact."
    },
    {
      q: "What if I received a damaged, defective, or incorrect product?",
      a: "If you received a defective or wrong item, you can immediately choose 'Defective / Damaged product' or 'Wrong item delivered' in the return form. We prioritize rapid replacement or 100% refund."
    },
    {
      q: "How long does it take for the refund to reflect in my bank account?",
      a: "UPI refunds are processed within 2 to 24 hours after doorstep pickup. For credit/debit card payments, bank clearing typically takes 3 to 5 business days."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Request Return in 1-Click",
      desc: "Open 'My Orders', select your delivered item, and tap 'Return / Replace' with your reason and refund UPI ID.",
      icon: RotateCcw,
    },
    {
      step: "02",
      title: "Free Doorstep Pickup",
      desc: "Our verified logistics partner visits your doorstep within 24-48 hours to collect the item. Zero charges.",
      icon: Truck,
    },
    {
      step: "03",
      title: "Quality Verification",
      desc: "Item tags and basic condition are checked quickly at the pickup point or warehouse hub.",
      icon: PackageCheck,
    },
    {
      step: "04",
      title: "Instant 100% Refund",
      desc: "Full money credited directly to your UPI ID or source account with UTR transaction confirmation.",
      icon: CreditCard,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* 1. Hero Header */}
        <div className="bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#111827] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-4">
              <Sparkles size={13} /> 7-Day Hassle-Free Policy
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Returns & Refunds Center
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-gray-300 leading-relaxed">
              Shop with 100% peace of mind on TexoraShop. We offer free doorstep pickups, no-questions-asked size exchanges, and instant UPI refunds.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/orders"
                className="inline-flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-lg shadow-orange-500/25"
              >
                <span>Go to My Orders to Return</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition backdrop-blur-xs"
              >
                <span>Track Return Status</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Key Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs hover:border-orange-200 transition">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
              <RotateCcw size={20} />
            </div>
            <h3 className="font-bold text-sm text-gray-900">7-Day Easy Return</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Return or exchange fashion, footwear, and accessories within 7 days of delivery.
            </p>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs hover:border-orange-200 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Truck size={20} />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Free Doorstep Pickup</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Zero return shipping fee. Our courier agent collects the parcel directly from your home.
            </p>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs hover:border-orange-200 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <CreditCard size={20} />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Instant UPI Refund</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Get full refund amount credited to GPay, PhonePe, Paytm, or bank account within 24 hours.
            </p>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs hover:border-orange-200 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-sm text-gray-900">100% Genuine Assured</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Damaged, defective, or wrong items are replaced immediately with prioritized support.
            </p>
          </div>
        </div>

        {/* 3. 4-Step Return Process */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs mb-10">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              Simple 4-Step Process
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
              How Does Return & Refund Work?
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Follow these simple steps from the comfort of your home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {steps.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="relative flex flex-col items-start bg-gray-50/70 border border-gray-100 rounded-2xl p-5">
                  <div className="flex items-center justify-between w-full mb-3">
                    <span className="font-mono text-xs font-black text-orange-600 bg-orange-100/60 px-2 py-0.5 rounded-md">
                      STEP {st.step}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-700">
                      <Icon size={16} />
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">{st.title}</h4>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Category-Wise Policy Table */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs mb-10">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4">
            Category-Wise Return Window & Conditions
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Return Window</th>
                  <th className="py-3 px-4">Resolution Type</th>
                  <th className="py-3 px-4">Condition to be met</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-900">Men & Women Fashion</td>
                  <td className="py-3.5 px-4 text-orange-600 font-bold">7 Days</td>
                  <td className="py-3.5 px-4">Refund or Size Exchange</td>
                  <td className="py-3.5 px-4">Unused, unwashed with original brand tags attached</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-900">Footwear & Shoes</td>
                  <td className="py-3.5 px-4 text-orange-600 font-bold">7 Days</td>
                  <td className="py-3.5 px-4">Refund or Size Exchange</td>
                  <td className="py-3.5 px-4">Original shoe box intact, clean soles, tags on</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-900">Mobiles & Electronics</td>
                  <td className="py-3.5 px-4 text-orange-600 font-bold">7 Days</td>
                  <td className="py-3.5 px-4">Replacement or Refund</td>
                  <td className="py-3.5 px-4">In original packaging with all accessories & IMEI check</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-900">Bags & Luggage</td>
                  <td className="py-3.5 px-4 text-orange-600 font-bold">7 Days</td>
                  <td className="py-3.5 px-4">Refund or Replacement</td>
                  <td className="py-3.5 px-4">All zippers and tags intact without scratches</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-bold text-gray-900">Beauty & Personal Care</td>
                  <td className="py-3.5 px-4 text-gray-600 font-bold">3 Days</td>
                  <td className="py-3.5 px-4">Replacement only</td>
                  <td className="py-3.5 px-4">Only if received damaged or expired; seal must be unopened</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Frequently Asked Questions Accordion */}
        <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-2xs mb-10">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle size={20} className="text-[#f4511e]" />
            <h2 className="text-lg sm:text-xl font-black text-gray-900">
              Frequently Asked Questions on Returns
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl transition overflow-hidden ${
                    isOpen ? "border-orange-300 bg-orange-50/20" : "border-gray-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-gray-900"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={16} className="text-orange-600 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-orange-100 pt-2.5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. Help & Support Banner */}
        <div className="bg-white border border-orange-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-black text-gray-900 text-base sm:text-lg">Still have questions about your return?</h3>
            <p className="text-xs text-gray-500">
              Our 24x7 customer support team is always here to resolve any issues.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm shadow-orange-500/20"
            >
              <PhoneCall size={14} />
              <span>Contact Support Desk</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
