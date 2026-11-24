"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ShieldCheck, Truck, Users, ArrowRight } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "100% Quality Checked",
    text: "Every product undergoes multi-stage quality verification before dispatch.",
  },
  {
    icon: Truck,
    title: "Pan-India Free Delivery",
    text: "Serving 19,000+ pin codes across India with fast doorstep delivery.",
  },
  {
    icon: Users,
    title: "Customer First",
    text: "7-Day hassle-free returns and instant UPI refunds on all eligible orders.",
  },
];

// Quick-glance numbers taken from the claims above (no new figures)
const HIGHLIGHTS = [
  { value: "100%", label: "Quality checked" },
  { value: "19,000+", label: "Pin codes served" },
  { value: "7-Day", label: "Easy returns" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50/60 pb-16 pt-3 dark:bg-slate-950 sm:pt-5">
      <div className="mx-auto max-w-4xl px-3 sm:px-4">
        {/* Hero */}
        <section className="relative mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#151f33] to-[#1c2540] p-4 text-white shadow-lg ring-1 ring-white/5 sm:mb-4 sm:rounded-3xl sm:p-8">
          {/* soft orange glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl"
          />

          <div className="relative">
            <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-orange-300 sm:text-[11px]">
              <Sparkles size={12} /> Our Story
            </span>

            <h1 className="text-xl font-extrabold tracking-tight sm:text-4xl">About TexoraShop</h1>

            <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-gray-300 sm:mt-3 sm:text-sm">
              TexoraShop is India's fastest-growing value e-commerce marketplace bringing quality fashion,
              electronics, footwear, and lifestyle essentials directly from verified manufacturers to your doorstep.
            </p>

            {/* Highlights */}
            <dl className="mt-4 grid grid-cols-3 divide-x divide-white/10 rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 backdrop-blur-sm sm:mt-6">
              {HIGHLIGHTS.map((h) => (
                <div key={h.label} className="flex flex-col-reverse px-2 py-2.5 text-center sm:px-4 sm:py-3.5">
                  <dt className="text-[10px] font-medium text-gray-400 sm:text-xs">{h.label}</dt>
                  <dd className="text-base font-extrabold tabular-nums tracking-tight text-amber-300 sm:text-2xl">
                    {h.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Features */}
        <section aria-label="Why TexoraShop" className="mb-3 grid grid-cols-1 gap-2.5 sm:mb-4 sm:grid-cols-3 sm:gap-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group flex items-start gap-3 rounded-xl bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-gray-200/80 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-orange-200 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-orange-500/40 sm:block sm:p-4"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-500 ring-1 ring-inset ring-orange-100 transition group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/10 dark:ring-orange-500/20 sm:mb-2.5">
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <h3 className="text-[13px] font-bold leading-5 text-gray-900 dark:text-white sm:text-sm">{title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50/60 to-white p-4 ring-1 ring-orange-100 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:from-orange-500/10 dark:via-amber-500/5 dark:to-slate-900 dark:ring-orange-500/20 sm:flex-row sm:items-center sm:rounded-3xl sm:p-6">
          <div>
            <h3 className="text-[15px] font-extrabold text-gray-900 dark:text-white sm:text-base">
              Ready to start shopping?
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">
              Explore thousands of products at factory-direct prices.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f4511e] px-5 text-xs font-bold text-white shadow-sm shadow-orange-500/25 transition hover:bg-[#d84315] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4511e] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 sm:w-auto"
          >
            <span>Explore Catalog</span>
            <ArrowRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}