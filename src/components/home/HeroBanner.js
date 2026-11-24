"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";

// 100% Royalty-Free Unsplash Commercial License Curated Images
const SLIDES = [
  {
    id: 1,
    tag: "MEGA SAVINGS DHAMAKA",
    title: "Ethnic & Western Trends",
    offer: "Flat 60% - 80% OFF",
    sub: "Kurtis, Sarees, Dresses & Tops from Top Verified Merchants",
    cta: "Explore Fashion",
    href: "/fashion",
    bgGradient: "from-rose-600 via-orange-600 to-amber-500",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80",
    floatingBadge: "Trending 2026",
    rating: "4.8",
  },
  {
    id: 2,
    tag: "SUPER TECH LAUNCH",
    title: "5G Smartphones & Audio",
    offer: "Starting at ₹1,499*",
    sub: "Fast Chargers, TWS Earbuds, Smartwatches & Mobile Covers",
    cta: "Shop Electronics",
    href: "/mobiles",
    bgGradient: "from-slate-950 via-indigo-950 to-blue-900",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
    floatingBadge: "Latest 5G Launch",
    rating: "4.9",
  },
  {
    id: 3,
    tag: "FOOTWEAR BONANZA",
    title: "Sports Sneakers & Heels",
    offer: "Min. 65% OFF Deals",
    sub: "Casual Sneakers, Running Shoes & Formal Footwear with Free Return",
    cta: "View Footwear",
    href: "/footwear",
    bgGradient: "from-amber-600 via-orange-700 to-red-800",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
    floatingBadge: "Direct Factory Rate",
    rating: "4.7",
  },
  {
    id: 4,
    tag: "BEAUTY & PERSONAL CARE",
    title: "Makeup, Serums & Fragrances",
    offer: "Deals Under ₹199",
    sub: "100% Genuine Sunscreens, Lipsticks, Face Wash & Shampoos",
    cta: "Shop Beauty",
    href: "/beauty",
    bgGradient: "from-purple-900 via-fuchsia-950 to-slate-900",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
    floatingBadge: "100% Organic & Pure",
    rating: "4.8",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [deals, setDeals] = useState({
    deal1Tag: "Budget Store",
    deal1Title: "Everything Under ₹199",
    deal1Sub: "Flip-flops, T-shirts, covers & jewellery",
    deal1Href: "/special-offers",
    deal2Tag: "Trending Picks",
    deal2Title: "Flat 70% Clearance Drop",
    deal2Sub: "High-rated customer favorites in stock",
    deal2Href: "/best-sellers",
  });

  useEffect(() => {
    function readLocal() {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) setDeals((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }

    async function loadDeals() {
      try {
        const res = await fetch("http://localhost:5000/api/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            setDeals((prev) => ({ ...prev, ...data }));
            localStorage.setItem("texora_store_settings", JSON.stringify(data));
            return;
          }
        }
      } catch (e) {}

      readLocal();
    }

    readLocal();
    loadDeals();

    window.addEventListener("texora_settings_updated", readLocal);
    window.addEventListener("storage", readLocal);
    return () => {
      window.removeEventListener("texora_settings_updated", readLocal);
      window.removeEventListener("storage", readLocal);
    };
  }, []);

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % SLIDES.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

  const active = SLIDES[current];

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* progress-bar keyframes (UI only; duration matches the 4.5s auto-slide) */}
      <style>{`@keyframes heroProgress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>

      {/* 1. Main Hero Carousel — text left / image right on every screen size (compact on mobile) */}
      <div
        className={`relative overflow-hidden rounded-xl bg-gradient-to-r sm:rounded-2xl ${active.bgGradient} shadow-[0_8px_24px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/5 transition-colors duration-700 motion-reduce:transition-none`}
      >
        {/* soft light + vignette for depth */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_20%,rgba(255,255,255,0.22),transparent_60%),linear-gradient(to_bottom,rgba(255,255,255,0.06),transparent_40%,rgba(0,0,0,0.18))]"
        />

        <div className="relative grid min-h-[158px] grid-cols-12 items-center sm:min-h-[240px] lg:min-h-[280px]">
          {/* Left Text & CTA */}
          <div
            key={active.id}
            className="z-10 col-span-7 flex flex-col justify-center py-3.5 pl-3.5 pr-1 text-white animate-in fade-in duration-500 sm:py-6 sm:pl-8 md:pl-10"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex max-w-full items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset ring-white/25 backdrop-blur-sm sm:text-[10px]">
                <Flame className="h-3 w-3 shrink-0 text-amber-300" />
                <span className="truncate">{active.tag}</span>
              </span>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-slate-900 sm:text-[10px]">
                <Star className="h-2.5 w-2.5 fill-current" /> {active.rating}
              </span>
            </div>

            <h1 className="mt-1.5 text-[17px] font-extrabold leading-tight tracking-tight sm:mt-2.5 sm:text-3xl lg:text-4xl">
              {active.title}
            </h1>

            <p className="mt-0.5 text-lg font-extrabold leading-tight text-amber-300 drop-shadow-sm sm:mt-1 sm:text-3xl">
              {active.offer}
            </p>

            <p className="mt-1 line-clamp-1 max-w-md text-[11px] font-medium text-white/80 sm:line-clamp-2 sm:text-xs">
              {active.sub}
            </p>

            <div className="mt-2.5 flex items-center gap-3 sm:mt-4">
              <Link
                href={active.href}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-bold text-slate-900 shadow-sm transition hover:bg-amber-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/30 sm:h-10 sm:gap-2 sm:rounded-xl sm:px-5 sm:text-xs"
              >
                <span>{active.cta}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <span className="hidden items-center gap-1 text-[11px] font-semibold text-white/90 md:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-300" /> Free Delivery & COD
              </span>
            </div>
          </div>

          {/* Right Visual Image & Floating Badge */}
          <div className="relative col-span-5 flex items-center justify-center py-3 pr-3 sm:p-5">
            <div className="relative h-[104px] w-[104px] overflow-hidden rounded-xl bg-black/10 shadow-xl ring-2 ring-white/25 sm:h-48 sm:w-48 sm:rounded-2xl md:h-56 md:w-56 lg:h-60 lg:w-60">
              <img
                src={active.image}
                alt={active.title}
                loading={current === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105 motion-reduce:transition-none"
              />

              {/* Floating Badge (hidden on very small screens to keep it compact) */}
              <div className="absolute inset-x-2 bottom-2 hidden rounded-lg bg-black/65 px-2 py-1 text-center ring-1 ring-white/10 backdrop-blur-md sm:block">
                <span className="text-[10px] font-bold tracking-wide text-amber-300">
                  {active.floatingBadge}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows (desktop/tablet; mobile uses dots) */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-2 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-black/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-2 top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-black/60 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex"
          aria-label="Next slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Dots Indicators (taller hit area on touch screens) */}
        <div className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center sm:bottom-2">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className="group flex h-5 items-center px-0.5"
              aria-label={`Slide ${idx + 1}`}
              aria-current={current === idx}
            >
              <span
                className={`block h-1.5 rounded-full transition-all motion-reduce:transition-none ${
                  current === idx ? "w-5 bg-amber-400" : "w-1.5 bg-white/45 group-hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Auto-slide progress line */}
        <div className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-black/10 motion-reduce:hidden">
          <div
            key={current}
            className="h-full origin-left bg-amber-300/90"
            style={{ animation: "heroProgress 4.5s linear forwards" }}
          />
        </div>
      </div>

      {/* 2. Shopsy Style Mini Deal Banners — 2 columns on every screen, compact */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
        {/* Deal 1: Budget Bazaar */}
        <Link
          href={deals.deal1Href || "/special-offers"}
          className="group flex min-w-0 items-center justify-between gap-2 rounded-xl border border-orange-200/80 bg-linear-to-r from-orange-50 via-amber-50 to-white p-2.5 transition hover:border-orange-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:rounded-2xl sm:p-3.5"
        >
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-orange-600 sm:text-[10px]">
              <Zap className="h-3 w-3" /> {deals.deal1Tag || "Budget Store"}
            </span>
            <h3 className="truncate text-[12.5px] font-extrabold leading-tight text-slate-900 transition group-hover:text-orange-600 sm:text-sm">
              {deals.deal1Title || "Everything Under ₹199"}
            </h3>
            <p className="line-clamp-1 text-[10.5px] font-medium text-slate-500 sm:text-[11px]">
              {deals.deal1Sub || "Flip-flops, T-shirts, covers & jewellery"}
            </p>
          </div>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-orange-200 shadow-2xs sm:h-14 sm:w-14 sm:rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80"
              alt="Budget store"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition group-hover:scale-105 motion-reduce:transition-none"
            />
          </div>
        </Link>

        {/* Deal 2: Top Clearance */}
        <Link
          href={deals.deal2Href || "/best-sellers"}
          className="group flex min-w-0 items-center justify-between gap-2 rounded-xl border border-purple-200/80 bg-linear-to-r from-purple-50 via-indigo-50 to-white p-2.5 transition hover:border-purple-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 sm:rounded-2xl sm:p-3.5"
        >
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-purple-600 sm:text-[10px]">
              <Sparkles className="h-3 w-3" /> {deals.deal2Tag || "Trending Picks"}
            </span>
            <h3 className="truncate text-[12.5px] font-extrabold leading-tight text-slate-900 transition group-hover:text-purple-600 sm:text-sm">
              {deals.deal2Title || "Flat 70% Clearance Drop"}
            </h3>
            <p className="line-clamp-1 text-[10.5px] font-medium text-slate-500 sm:text-[11px]">
              {deals.deal2Sub || "High-rated customer favorites in stock"}
            </p>
          </div>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-purple-200 shadow-2xs sm:h-14 sm:w-14 sm:rounded-xl">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80"
              alt="Clearance deals"
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition group-hover:scale-105 motion-reduce:transition-none"
            />
          </div>
        </Link>
      </div>
    </div>
  );
}