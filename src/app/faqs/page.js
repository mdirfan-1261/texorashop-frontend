"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, ChevronUp, Search, PhoneCall } from "lucide-react";

export default function FaqsPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [search, setSearch] = useState("");

  const faqs = [
    { q: "How do I place an order on TexoraShop?", a: "Browse through our collection, select your size, and click 'Add to Cart' or 'Buy Now'. Enter your delivery address and choose Cash on Delivery or online payment." },
    { q: "How can I track my order status?", a: "Go to 'Track My Order' from the top menu or account section, or visit /track-order. Enter your Order ID to see real-time delivery milestones." },
    { q: "What is the return policy?", a: "We provide a 7-day free return & replacement policy for clothing, footwear, and accessories with 100% free doorstep pickup." },
    { q: "How are refunds paid for Cash on Delivery (COD)?", a: "When requesting a return, provide your UPI ID (GPay / PhonePe / Paytm). The refund will be credited directly to your bank account within 24 hours of pickup." },
    { q: "Can I cancel my order before delivery?", a: "Yes, you can cancel your order directly from the 'My Orders' section anytime before it is shipped." },
    { q: "Are all products 100% genuine and brand new?", a: "Yes, TexoraShop only works with verified sellers and certified manufacturers with strict quality checks." }
  ];

  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8 text-center sm:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-3">
            <HelpCircle size={13} /> Help & Knowledge Base
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">Quick answers to common questions about orders, shipping, and returns.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-3">
          {filtered.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`border rounded-2xl transition overflow-hidden ${isOpen ? "border-orange-300 bg-orange-50/20" : "border-gray-200"}`}>
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
    </div>
  );
}
