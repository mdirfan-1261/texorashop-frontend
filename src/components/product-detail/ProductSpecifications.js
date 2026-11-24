"use client";

export default function ProductSpecifications({
  description = "",
  specifications = {},
}) {
  const specEntries = Object.entries(specifications || {}).filter(
    ([_, val]) => val && String(val).trim() !== ""
  );

  return (
    <div className="space-y-4">
      {/* Product Description */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
          Product Description
        </h3>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
          {description ||
            "Discover top-tier quality and design crafted for maximum durability and comfort. 100% authentic item from trusted merchants."}
        </p>
      </div>

      {/* Dynamic Specifications Table */}
      {specEntries.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
            Specifications & Details
          </h3>

          <div className="mt-3 divide-y divide-slate-100 text-xs">
            {specEntries.map(([key, value]) => (
              <div key={key} className="flex py-2.5 text-slate-700 capitalize">
                <span className="w-1/3 font-bold text-slate-400">
                  {key.replace(/([A-Z])/g, " $1")}
                </span>
                <span className="w-2/3 font-semibold text-slate-800">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}