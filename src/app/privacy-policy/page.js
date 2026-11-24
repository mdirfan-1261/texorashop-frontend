"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-3">
            <ShieldCheck size={13} /> Data Protection
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">
            How TexoraShop protects and handles your personal data.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5 text-xs text-gray-600 leading-relaxed">
          <div>
            <h2 className="text-sm font-black text-gray-900 mb-1.5">1. Information We Collect</h2>
            <p>
              We collect your name, mobile number, delivery address, and UPI/payment reference solely to fulfill your orders, process deliveries, and provide customer support.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 mb-1.5">2. Security & Encryption</h2>
            <p>
              All transactions and customer records are secured using industry-standard encryption. We never sell or share your personal phone number or address with third-party marketers.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 mb-1.5">3. Communication & OTPs</h2>
            <p>
              Your mobile number is used strictly for account authentication via OTP and real-time order/return status updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}