"use client";
import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Copy, Check, Search } from "lucide-react";

export default function AdminMediaPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [copiedUrl, setCopiedUrl] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setProducts(d); })
      .catch(console.error);
  }, []);

  const filtered = products.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
          <ImageIcon className="h-3 w-3" /> Digital Assets
        </span>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">Product Media Library ({filtered.length})</h1>
        <p className="text-xs text-slate-500 mt-0.5">Browse and copy product image URLs across all storefront categories.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter media by product title or category..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:bg-white focus:border-orange-500 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {filtered.map((p) => {
          const img = p.images?.[0] || p.image;
          return (
            <div key={p._id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs group flex flex-col justify-between">
              <div className="aspect-square bg-slate-100 overflow-hidden relative">
                <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <div className="p-2.5">
                <p className="text-[11px] font-bold text-slate-800 truncate">{p.title}</p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] font-bold text-orange-600">{p.category}</span>
                  <button onClick={() => { navigator.clipboard.writeText(img); setCopiedUrl(p._id); setTimeout(() => setCopiedUrl(null), 1500); }} className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {copiedUrl === p._id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    <span>{copiedUrl === p._id ? "Copied" : "URL"}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
