"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  Truck,
  Sparkles,
  ShieldCheck,
  Store,
  RefreshCw,
  Info,
  DollarSign,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    storeName: "TexoraShop",
    supportPhone: "919876543210",
    supportEmail: "support@texorashop.in",
    merchantUpi: "texorashop@icici",
    returnWindowDays: 7,

    // 🚚 Delivery Fee Configuration
    deliveryFee: 40,
    freeDeliveryMinOrder: 499,
    isFreeDeliveryActive: true,

    // 🏷️ Mini Deal Banners
    deal1Tag: "Budget Store",
    deal1Title: "Everything Under ₹199",
    deal1Sub: "Flip-flops, T-shirts, covers & jewellery",
    deal1Href: "/special-offers",

    deal2Tag: "Trending Picks",
    deal2Title: "Flat 70% Clearance Drop",
    deal2Sub: "High-rated customer favorites in stock",
    deal2Href: "/best-sellers",

    // 🛡️ 4 Trust Badges
    badge1Label: "Free Delivery",
    badge1Sub: "On orders above ₹499",
    badge2Label: "Cash on Delivery",
    badge2Sub: "Pay at doorstep",
    badge3Label: "7 Days Return",
    badge3Sub: "Instant refund",
    badge4Label: "100% Lowest Price",
    badge4Sub: "Direct from sellers",
  });

  const [activeTab, setActiveTab] = useState("delivery"); // 'delivery' | 'banners' | 'badges' | 'general'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  // Load from API or LocalStorage
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/settings", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data._id) {
          setConfig(data);
          localStorage.setItem("texora_store_settings", JSON.stringify(data));
          return;
        }
      }
    } catch (e) {}

    try {
      const saved = localStorage.getItem("texora_store_settings");
      if (saved) setConfig(JSON.parse(saved));
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Auto synchronize returnWindowDays and badge3Label so the days count never diverges
    const days = Number(config.returnWindowDays) || 7;
    const synchronizedConfig = {
      ...config,
      returnWindowDays: days,
      badge3Label: `${days} Days Return`,
    };

    try {
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(synchronizedConfig),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) setConfig(data.settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.setItem("texora_store_settings", JSON.stringify(synchronizedConfig));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("texora_settings_updated"));
      }
      setSaving(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl text-xs font-bold border border-slate-700 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>Settings saved & updated across the live store!</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <Settings className="h-3 w-3" /> Live Store Customizer
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Store Preferences & Dynamic Controls
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize delivery fees, free shipping rules, home promotional banners, and trust badges without changing code.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
          <span>Sync DB</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs">
        {[
          { id: "delivery", label: "🚚 Delivery & Shipping", icon: Truck },
          { id: "banners", label: "🏷️ Mini Deal Banners", icon: Sparkles },
          { id: "badges", label: "🛡️ Trust Badges", icon: ShieldCheck },
          { id: "general", label: "⚙️ General & Contact", icon: Store },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-orange-500 text-white shadow-sm shadow-orange-500/25"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: DELIVERY & SHIPPING */}
        {activeTab === "delivery" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Truck size={16} className="text-orange-500" />
                <span>Shipping & Delivery Charges</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure standard shipping fee and minimum cart value for free shipping.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                  Standard Delivery Fee (₹)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-2">
                  Amount charged when order is below free delivery threshold.
                </p>
                <input
                  type="number"
                  min="0"
                  value={config.deliveryFee}
                  onChange={(e) =>
                    setConfig({ ...config, deliveryFee: Number(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-900 focus:border-orange-500 focus:outline-none"
                  placeholder="e.g. 40"
                />
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <label className="text-xs font-black text-slate-800 uppercase tracking-wide block">
                  Free Delivery Min. Cart Value (₹)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-2">
                  Orders equal or above this amount will get FREE delivery (Set 0 for free on all).
                </p>
                <input
                  type="number"
                  min="0"
                  value={config.freeDeliveryMinOrder}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      freeDeliveryMinOrder: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-900 focus:border-orange-500 focus:outline-none"
                  placeholder="e.g. 499"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-orange-200 bg-orange-50/30">
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Enable Free Delivery Promotion
                </span>
                <span className="text-[11px] text-slate-500">
                  {config.freeDeliveryMinOrder > 0
                    ? `Customers get FREE delivery when their cart subtotal is ₹${config.freeDeliveryMinOrder} or more.`
                    : "FREE delivery is applied on all orders without any minimum limit."}
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.isFreeDeliveryActive}
                onChange={(e) =>
                  setConfig({ ...config, isFreeDeliveryActive: e.target.checked })
                }
                className="h-5 w-5 accent-orange-500 cursor-pointer"
              />
            </div>

            {/* Live Checkout Preview */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
              <span className="font-extrabold uppercase text-slate-400 text-[10px] tracking-wider block mb-2">
                Live Customer Checkout Preview:
              </span>
              <div className="space-y-1 font-semibold text-slate-700">
                <p>
                  • If customer cart is <strong>₹350</strong> (Under ₹{config.freeDeliveryMinOrder}):{" "}
                  <span className="text-rose-600 font-bold">Delivery Fee = ₹{config.deliveryFee}</span>
                </p>
                <p>
                  • If customer cart is <strong>₹600</strong> (Above ₹{config.freeDeliveryMinOrder}):{" "}
                  <span className="text-emerald-600 font-bold">Delivery Fee = FREE</span> (Save ₹{config.deliveryFee})
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MINI DEAL BANNERS */}
        {activeTab === "banners" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" />
                <span>Home Page Mini Deal Banners</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize the 2 quick-deal cards displayed directly beneath the main carousel.
              </p>
            </div>

            {/* Deal Banner 1 */}
            <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/20 space-y-3">
              <span className="text-xs font-black uppercase text-orange-700 tracking-wider">
                Deal Card #1 (Budget Store)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Top Pill Tag</label>
                  <input
                    type="text"
                    value={config.deal1Tag}
                    onChange={(e) => setConfig({ ...config, deal1Tag: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Target Page Link</label>
                  <input
                    type="text"
                    value={config.deal1Href}
                    onChange={(e) => setConfig({ ...config, deal1Href: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700">Main Headline</label>
                  <input
                    type="text"
                    value={config.deal1Title}
                    onChange={(e) => setConfig({ ...config, deal1Title: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700">Sub-description</label>
                  <input
                    type="text"
                    value={config.deal1Sub}
                    onChange={(e) => setConfig({ ...config, deal1Sub: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Deal Banner 2 */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 space-y-3">
              <span className="text-xs font-black uppercase text-purple-700 tracking-wider">
                Deal Card #2 (Trending Picks)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Top Pill Tag</label>
                  <input
                    type="text"
                    value={config.deal2Tag}
                    onChange={(e) => setConfig({ ...config, deal2Tag: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Target Page Link</label>
                  <input
                    type="text"
                    value={config.deal2Href}
                    onChange={(e) => setConfig({ ...config, deal2Href: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700">Main Headline</label>
                  <input
                    type="text"
                    value={config.deal2Title}
                    onChange={(e) => setConfig({ ...config, deal2Title: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-bold text-slate-700">Sub-description</label>
                  <input
                    type="text"
                    value={config.deal2Sub}
                    onChange={(e) => setConfig({ ...config, deal2Sub: e.target.value })}
                    className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRUST BADGES */}
        {activeTab === "badges" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} className="text-orange-500" />
                <span>4 Trust & Assurance Badges</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize titles and subtitles of the 4 badges shown on the homepage.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[10px] font-black uppercase text-orange-600 block mb-1">
                  Badge 1 (Delivery)
                </span>
                <input
                  type="text"
                  value={config.badge1Label}
                  onChange={(e) => setConfig({ ...config, badge1Label: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={config.badge1Sub}
                  onChange={(e) => setConfig({ ...config, badge1Sub: e.target.value })}
                  className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-600"
                  placeholder="Subtitle"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[10px] font-black uppercase text-orange-600 block mb-1">
                  Badge 2 (Payment Mode)
                </span>
                <input
                  type="text"
                  value={config.badge2Label}
                  onChange={(e) => setConfig({ ...config, badge2Label: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={config.badge2Sub}
                  onChange={(e) => setConfig({ ...config, badge2Sub: e.target.value })}
                  className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-600"
                  placeholder="Subtitle"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[10px] font-black uppercase text-orange-600 block mb-1">
                  Badge 3 (Returns)
                </span>
                <input
                  type="text"
                  value={config.badge3Label}
                  onChange={(e) => {
                    const val = e.target.value;
                    const num = val.match(/\d+/)?.[0];
                    setConfig({
                      ...config,
                      badge3Label: val,
                      ...(num ? { returnWindowDays: Number(num) } : {}),
                    });
                  }}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={config.badge3Sub}
                  onChange={(e) => setConfig({ ...config, badge3Sub: e.target.value })}
                  className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-600"
                  placeholder="Subtitle"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="text-[10px] font-black uppercase text-orange-600 block mb-1">
                  Badge 4 (Pricing Assurance)
                </span>
                <input
                  type="text"
                  value={config.badge4Label}
                  onChange={(e) => setConfig({ ...config, badge4Label: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold"
                  placeholder="Label"
                />
                <input
                  type="text"
                  value={config.badge4Sub}
                  onChange={(e) => setConfig({ ...config, badge4Sub: e.target.value })}
                  className="mt-1.5 w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-600"
                  placeholder="Subtitle"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GENERAL & CONTACT */}
        {activeTab === "general" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Store size={16} className="text-orange-500" />
                <span>Store Profile & Helpdesk</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your store contact details, WhatsApp helpdesk number, and return window.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700">Store Brand Name</label>
                <input
                  type="text"
                  value={config.storeName}
                  onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">24x7 WhatsApp Helpdesk Number</label>
                <input
                  type="text"
                  value={config.supportPhone}
                  onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Support Email</label>
                <input
                  type="email"
                  value={config.supportEmail}
                  onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Merchant UPI ID (for QR codes)</label>
                <input
                  type="text"
                  value={config.merchantUpi}
                  onChange={(e) => setConfig({ ...config, merchantUpi: e.target.value })}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Return Policy Window (Days)</label>
                <input
                  type="number"
                  value={config.returnWindowDays}
                  onChange={(e) => {
                    const days = Number(e.target.value) || 7;
                    setConfig({
                      ...config,
                      returnWindowDays: days,
                      badge3Label: `${days} Days Return`,
                    });
                  }}
                  className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-7 py-3 rounded-xl text-xs font-black transition shadow-md shadow-orange-500/25 cursor-pointer disabled:bg-slate-400"
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
