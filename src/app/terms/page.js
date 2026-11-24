"use client";

import React from "react";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-3">
            <FileText size={13} /> User Agreement
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Terms & Conditions</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">
            Terms of use for shopping on TexoraShop.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5 text-xs text-gray-600 leading-relaxed">
          <div>
            <h2 className="text-sm font-black text-gray-900 mb-1.5">1. Account & Order Accuracy</h2>
            <p>
              By placing an order on TexoraShop, you confirm that your shipping address, pin code, and mobile number are accurate for smooth courier delivery.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 mb-1.5">2. Pricing & Availability</h2>
            <p>
              All prices listed are inclusive of applicable taxes. In the rare event an item goes out of stock, a full refund is processed immediately.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 mb-1.5">3. Fair Return Policy Usage</h2>
            <p>
              Returned items must be unused with original brand tags and packaging intact at the time of doorstep pickup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}