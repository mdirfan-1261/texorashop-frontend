"use client";

import { useState, useEffect } from "react";
import { Copy, Check, ChevronDown } from "lucide-react";

export default function ProductHighlights({
  title = "",
  description = "",
  specifications = {},
  category = "Fashion",
}) {
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [returnDays, setReturnDays] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) {
          const s = JSON.parse(saved);
          return (
            s.returnWindowDays ||
            (s.badge3Label ? Number(s.badge3Label.match(/\d+/)?.[0]) : 7) ||
            7
          );
        }
      } catch (e) {}
    }
    return 7;
  });

  useEffect(() => {
    function readLocal() {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) {
          const s = JSON.parse(saved);
          const days =
            s.returnWindowDays ||
            (s.badge3Label ? Number(s.badge3Label.match(/\d+/)?.[0]) : 7) ||
            7;
          setReturnDays(days);
        }
      } catch (e) {}
    }

    async function fetchSettings() {
      try {
        const res = await fetch("http://localhost:5000/api/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            const days =
              data.returnWindowDays ||
              (data.badge3Label ? Number(data.badge3Label.match(/\d+/)?.[0]) : 7) ||
              7;
            setReturnDays(days);
            localStorage.setItem("texora_store_settings", JSON.stringify(data));
          }
        }
      } catch (e) {}
    }

    readLocal();
    fetchSettings();

    window.addEventListener("texora_settings_updated", readLocal);
    window.addEventListener("storage", readLocal);
    return () => {
      window.removeEventListener("texora_settings_updated", readLocal);
      window.removeEventListener("storage", readLocal);
    };
  }, []);

  // Default apparel / retail highlights fallback
  const highlights = {
    Fabric: specifications.fabric || specifications.material || "Cotton Blend / Premium Fabric",
    Color: specifications.color || "As per image / Multicolor",
    "Fit / Shape": specifications.fit || "Regular Fit",
    Length: specifications.length || "Standard Regular",
    Occasion: specifications.occasion || "Casual / Daily Wear",
    "Country of Origin": specifications.country || "India",
    ...specifications,
  };

  const highlightEntries = Object.entries(highlights).filter(
    ([_, val]) => val && String(val).trim() !== ""
  );

  const handleCopyHighlights = async () => {
    const textToCopy = `Product: ${title}\n` +
      highlightEntries.map(([k, v]) => `${k}: ${v}`).join("\n") +
      `\n\nDescription:\n${description || "100% Genuine Quality"}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Clipboard copy failed:", e);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
      {/* 1. Header with Meesho Signature "COPY" Button (Screenshot 3 & 4) */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase">
          Product Highlights
        </h2>

        <button
          type="button"
          onClick={handleCopyHighlights}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-black transition active:scale-95 ${
            copied
              ? "bg-emerald-50 text-emerald-600"
              : "bg-purple-50 text-purple-700 hover:bg-purple-100"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>COPIED!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>

      {/* 2. 2-Column Key-Value Specs Grid (Screenshot 3 & 4) */}
      <div className="mt-4 grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
        {highlightEntries.slice(0, 6).map(([key, val]) => (
          <div key={key}>
            <p className="text-[11px] font-semibold text-slate-400 capitalize">
              {key.replace(/([A-Z])/g, " $1")}
            </p>
            <p className="mt-0.5 text-xs font-black text-slate-800 capitalize">
              {String(val)}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Collapsible "Additional Details" Accordion */}
      <div className="mt-4 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between text-xs font-black text-slate-700 hover:text-orange-600"
        >
          <span>Additional Details</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              showDetails ? "rotate-180 text-orange-600" : "text-slate-400"
            }`}
          />
        </button>

        {showDetails && (
          <div className="mt-3 space-y-3 rounded-xl bg-slate-50/70 p-3.5 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800">Description:</p>
              <p className="mt-1 leading-relaxed whitespace-pre-line text-[11px]">
                {description ||
                  `High quality ${category} item designed with comfortable touch and durable stitching. Easy to wash, skin friendly fabric.`}
              </p>
            </div>

            <div className="border-t border-slate-200/60 pt-2 text-[11px]">
              <p className="font-bold text-slate-800">Return & Exchange Policy:</p>
              <p className="mt-0.5 text-slate-500">
                {returnDays} Days Easy Return & Exchange available for size or defect issues with zero questions asked.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}