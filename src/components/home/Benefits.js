"use client";

import { useState, useEffect } from "react";
import { Truck, CircleDollarSign, RotateCcw, ShieldCheck } from "lucide-react";

export default function Benefits() {
  const [settings, setSettings] = useState({
    deliveryFee: 40,
    freeDeliveryMinOrder: 499,
    isFreeDeliveryActive: true,
    badge1Label: "Free Delivery",
    badge1Sub: "On orders above ₹499",
    badge2Label: "Cash on Delivery",
    badge2Sub: "Pay at doorstep",
    badge3Label: "7 Days Return",
    badge3Sub: "Instant refund",
    badge4Label: "100% Lowest Price",
    badge4Sub: "Direct from sellers",
  });

  useEffect(() => {
    function readLocal() {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) {
          setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
        }
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

  // Dynamic Return Badge Calculation
  const returnDays =
    Number(settings.returnWindowDays) ||
    (settings.badge3Label ? Number(settings.badge3Label.match(/\d+/)?.[0]) : 7) ||
    7;
  const returnLabel =
    settings.badge3Label && !settings.badge3Label.includes("Days Return")
      ? settings.badge3Label
      : `${returnDays} Days Return`;

  // Compute dynamic badge 1 for delivery
  let b1Label = settings.badge1Label || "Free Delivery";
  let b1Sub = settings.badge1Sub;
  if (!b1Sub) {
    if (settings.isFreeDeliveryActive && settings.freeDeliveryMinOrder > 0) {
      b1Sub = `On orders above ₹${settings.freeDeliveryMinOrder}`;
    } else if (settings.isFreeDeliveryActive) {
      b1Sub = "On all orders";
    } else {
      b1Label = `Standard Delivery ₹${settings.deliveryFee}`;
      b1Sub = "Fast doorstep delivery";
    }
  }

  const TRUST_POINTS = [
    {
      icon: Truck,
      label: b1Label,
      sub: b1Sub,
    },
    {
      icon: CircleDollarSign,
      label: settings.badge2Label || "Cash on Delivery",
      sub: settings.badge2Sub || "Pay at doorstep",
    },
    {
      icon: RotateCcw,
      label: returnLabel,
      sub: settings.badge3Sub || "Instant refund",
    },
    {
      icon: ShieldCheck,
      label: settings.badge4Label || "100% Lowest Price",
      sub: settings.badge4Sub || "Direct from sellers",
    },
  ];

  return (
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      {TRUST_POINTS.map((b) => {
        const Icon = b.icon;
        return (
          <div
            key={b.label}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-2xs hover:border-slate-300 transition"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-slate-800">{b.label}</p>
              <p className="truncate text-[10px] text-slate-400 font-medium">{b.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
