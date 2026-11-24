"use client";

import { useState } from "react";
import { Ruler, Check } from "lucide-react";

export default function ProductVariants({
  sizes = [],
  colors = [],
  basePrice = 0,
  selectedSize = "",
  onSelectSize,
  selectedColor = "",
  onSelectColor,
}) {
  const [showSizeChart, setShowSizeChart] = useState(false);

  const hasSizes = Array.isArray(sizes) && sizes.length > 0;
  const hasColors = Array.isArray(colors) && colors.length > 0;

  if (!hasSizes && !hasColors) return null;

  const numBase = Number(basePrice || 0);

  // Meesho Size-Specific Pricing Calculator (Screenshot 3: S/M ₹272, L/XL ₹282)
  const getSizePrice = (sizeName, index) => {
    if (!numBase) return null;
    const s = String(sizeName).toUpperCase().trim();

    // Standard apparel rate variations
    if (s === "L" || s === "XL" || index === 2 || index === 3) {
      return numBase > 150 ? numBase + 10 : numBase;
    }
    if (s === "XXL" || s === "3XL" || index >= 4) {
      return numBase > 150 ? numBase + 15 : numBase;
    }
    return numBase;
  };

  return (
    <div className="space-y-4">
      {/* 1. Meesho Size Selector with Rates */}
      {hasSizes && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase">
              Select Size
            </h2>
            <button
              type="button"
              onClick={() => setShowSizeChart(!showSizeChart)}
              className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
            >
              <Ruler className="h-3.5 w-3.5" />
              <span>Size Chart</span>
            </button>
          </div>

          {/* Size Pills Strip (Screenshot 3) */}
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            {sizes.map((s, idx) => {
              const sizePrice = getSizePrice(s, idx);
              const isSelected = selectedSize === s;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSelectSize && onSelectSize(s)}
                  className={`group flex min-w-[62px] flex-col items-center justify-center rounded-2xl border py-2 px-3.5 transition-all active:scale-95 ${
                    isSelected
                      ? "border-orange-500 bg-orange-50/70 text-orange-600 shadow-sm ring-1 ring-orange-500"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  <span className="text-xs font-black uppercase leading-tight">
                    {s}
                  </span>
                  {sizePrice && (
                    <span
                      className={`text-[10px] font-bold mt-0.5 ${
                        isSelected ? "text-orange-600" : "text-slate-500"
                      }`}
                    >
                      ₹{sizePrice.toLocaleString("en-IN")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Collapsible Size Chart Table */}
          {showSizeChart && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
              <p className="font-black text-slate-800">Standard Garment Measurement (Inches):</p>
              <div className="mt-2 grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="rounded-lg bg-white p-1.5 font-bold text-slate-600">Size</div>
                <div className="rounded-lg bg-white p-1.5 font-bold text-slate-600">Chest</div>
                <div className="rounded-lg bg-white p-1.5 font-bold text-slate-600">Length</div>
                <div className="rounded-lg bg-white p-1.5 font-bold text-slate-600">Shoulder</div>

                {["S: 38 | 27 | 17", "M: 40 | 28 | 18", "L: 42 | 29 | 19", "XL: 44 | 30 | 20"].map((row) => {
                  const parts = row.split(" | ");
                  const sz = parts[0].split(": ");
                  return (
                    <div key={row} className="contents font-semibold text-slate-700">
                      <div className="bg-white/60 p-1.5 font-bold text-orange-600">{sz[0]}</div>
                      <div className="bg-white/60 p-1.5">{sz[1]}</div>
                      <div className="bg-white/60 p-1.5">{parts[1]}</div>
                      <div className="bg-white/60 p-1.5">{parts[2]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Color Swatches (if applicable) */}
      {hasColors && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black tracking-wider text-slate-800 uppercase">
              Select Color
            </h2>
            {selectedColor && (
              <span className="text-xs font-bold text-slate-500 capitalize">
                Selected: <span className="text-orange-600">{selectedColor}</span>
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const isSelected = selectedColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onSelectColor && onSelectColor(c)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
                    isSelected
                      ? "border-orange-500 bg-orange-50 text-orange-600 ring-1 ring-orange-500"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-2xs"
                    style={{
                      backgroundColor:
                        c.toLowerCase() === "white"
                          ? "#ffffff"
                          : c.toLowerCase() === "black"
                          ? "#1e293b"
                          : c.toLowerCase() === "red"
                          ? "#ef4444"
                          : c.toLowerCase() === "blue"
                          ? "#3b82f6"
                          : c.toLowerCase() === "green"
                          ? "#10b981"
                          : "#f97316",
                    }}
                  />
                  <span className="capitalize">{c}</span>
                  {isSelected && <Check className="h-3 w-3 text-orange-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}