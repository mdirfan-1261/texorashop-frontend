"use client";

import React from "react";
import Link from "next/link";
import { XCircle, ArrowRight, CheckCircle2, Clock } from "lucide-react";

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-3">
            <XCircle size={13} /> Zero Penalty Cancellation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Order Cancellation Policy</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">
            Cancel your unshipped orders anytime in 1-Click with 100% instant refund.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6 text-xs text-gray-600 leading-relaxed">
          <div>
            <h2 className="text-sm sm:text-base font-black text-gray-900 mb-2">
              1. When can I cancel an order?
            </h2>
            <p>
              You can cancel your order directly from your <strong>My Orders</strong> page at any time while the order is in <em>"Pending"</em> or <em>"Confirmed"</em> status. Once the parcel has been shipped and handed over to our courier partner, it cannot be cancelled in-transit, but you can always apply for a <strong>7-Day Free Return</strong> after delivery.
            </p>
          </div>

          <div>
            <h2 className="text-sm sm:text-base font-black text-gray-900 mb-2">
              2. How are refunds processed upon cancellation?
            </h2>
            <p>
              For all prepaid orders (UPI, Debit/Credit Cards, NetBanking), a <strong>100% full refund</strong> is initiated automatically the moment you cancel. UPI refunds reflect within 2 to 24 hours, while card payments take 3 to 5 business days depending on your bank.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm"
            >
              <span>Go to My Orders</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}