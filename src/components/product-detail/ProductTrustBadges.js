"use client";

import { useState, useEffect } from "react";
import { Truck, RotateCcw, ShieldCheck } from "lucide-react";

export default function ProductTrustBadges() {
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      badge1Label: "Free Delivery",
      badge1Sub: "On all orders",
      badge3Label: "7 Days Return",
      badge3Sub: "Hassle-free replacement",
      returnWindowDays: 7,
    };
  });

  useEffect(() => {
    function readLocal() {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {}
    }

    async function loadSettings() {
      try {
        const res = await fetch("http://localhost:5000/api/settings", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            setSettings((prev) => ({ ...prev, ...data }));
            localStorage.setItem("texora_store_settings", JSON.stringify(data));
            return;
          }
        }
      } catch (e) {}

      readLocal();
    }

    readLocal();
    loadSettings();

    window.addEventListener("texora_settings_updated", readLocal);
    window.addEventListener("storage", readLocal);
    return () => {
      window.removeEventListener("texora_settings_updated", readLocal);
      window.removeEventListener("storage", readLocal);
    };
  }, []);

  const returnDays =
    Number(settings.returnWindowDays) ||
    (settings.badge3Label ? Number(settings.badge3Label.match(/\d+/)?.[0]) : 7) ||
    7;

  const returnLabel =
    settings.badge3Label && !settings.badge3Label.includes("Days Return")
      ? settings.badge3Label
      : `${returnDays} Days Return`;

  const returnSub = settings.badge3Sub || "Instant refund";
  const deliveryLabel = settings.badge1Label || "Free Delivery";
  const deliverySub = settings.badge1Sub || "Fast doorstep delivery";

  return (
    <div className="grid grid-cols-3 gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Truck className="h-5 w-5" />
        </div>
        <span className="mt-2 text-[11px] font-black text-slate-800">
          {deliveryLabel}
        </span>
        <span className="text-[10px] text-slate-400 line-clamp-1">{deliverySub}</span>
      </div>

      <div className="flex flex-col items-center text-center border-x border-slate-100 px-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <RotateCcw className="h-5 w-5" />
        </div>
        <span className="mt-2 text-[11px] font-black text-slate-800">
          {returnLabel}
        </span>
        <span className="text-[10px] text-slate-400 line-clamp-1">{returnSub}</span>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <span className="mt-2 text-[11px] font-black text-slate-800">
          100% Genuine
        </span>
        <span className="text-[10px] text-slate-400">Verified by Texora</span>
      </div>
    </div>
  );
}
