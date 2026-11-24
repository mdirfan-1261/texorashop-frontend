"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState({
    storeName: "TexoraShop",
    supportPhone: "919876543210",
    supportEmail: "support@texorashop.in",
    merchantUpi: "texorashop@icici",
    returnWindowDays: "7",
    freeShippingEnabled: true,
    codEnabled: true,
  });
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("texora_store_settings");
      if (saved) setConfig(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem("texora_store_settings", JSON.stringify(config));
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {savedToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-bold">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>Store settings saved successfully!</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
          <Settings className="h-3 w-3" /> Global Configuration
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
          Store Preferences & Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure your store contact details, WhatsApp helpdesk number, and return rules.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="text-xs font-bold text-slate-700">24x7 Support WhatsApp Number</label>
            <input
              type="text"
              value={config.supportPhone}
              onChange={(e) => setConfig({ ...config, supportPhone: e.target.value })}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Official Support Email</label>
            <input
              type="email"
              value={config.supportEmail}
              onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700">Merchant Corporate UPI ID</label>
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
              onChange={(e) => setConfig({ ...config, returnWindowDays: e.target.value })}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-xs font-black transition shadow-sm"
          >
            <Save size={15} />
            <span>Save Store Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}