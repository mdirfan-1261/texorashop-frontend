"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-[#111827] text-white rounded-3xl p-6 sm:p-10 shadow-xl mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 mb-3">
            <Briefcase size={13} /> Join Our Team
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Careers at TexoraShop</h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">
            Build the future of Indian value & social commerce with us.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-2xs">
          <h2 className="text-base font-black text-gray-900">
            We are always looking for passionate talent!
          </h2>
          <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
            Whether you specialize in full-stack engineering, supply chain operations, or digital marketing, reach out to our team via our support desk.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition"
          >
            <span>Contact Us</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}