"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Phone,
  MapPin,
  ShoppingBag,
  IndianRupee,
  MessageSquare,
  Award,
} from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCustomersFromOrders = async () => {
    setLoading(true);
    try {
      const savedAdmin = localStorage.getItem("texora_admin");
      let token = "";
      if (savedAdmin) {
        try {
          token = JSON.parse(savedAdmin).token || "";
        } catch (e) {}
      }

      const res = await fetch("http://localhost:5000/api/orders", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const orders = await res.json();
        const map = new Map();

        (Array.isArray(orders) ? orders : []).forEach((o) => {
          const phone = o.phone || o.shippingAddress?.phone || "Unknown";
          const name = o.customerName || o.shippingAddress?.name || "Customer";
          const city = o.city || o.shippingAddress?.city || "India";
          const pincode = o.pincode || o.shippingAddress?.pincode || "";
          const price = Number(o.totalPrice ?? o.totalAmount ?? 0);

          if (!map.has(phone)) {
            map.set(phone, {
              phone,
              name,
              city,
              pincode,
              ordersCount: 1,
              totalSpent: price,
              lastOrderDate: o.createdAt,
            });
          } else {
            const existing = map.get(phone);
            existing.ordersCount += 1;
            existing.totalSpent += price;
            if (new Date(o.createdAt) > new Date(existing.lastOrderDate)) {
              existing.lastOrderDate = o.createdAt;
            }
          }
        });

        setCustomers(Array.from(map.values()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomersFromOrders();
  }, []);

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.includes(q) ||
      c.city?.toLowerCase().includes(q)
    );
  });

  const totalSpentAll = customers.reduce((s, c) => s + c.totalSpent, 0);
  const repeatBuyers = customers.filter((c) => c.ordersCount > 1).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
            <Users className="h-3 w-3" /> CRM & Buyer Directory
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
            Registered Customers & Buyers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View customer lifetime value, order frequency, and contact buyers directly on WhatsApp.
          </p>
        </div>

        <button
          onClick={fetchCustomersFromOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-orange-600 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-orange-500" : ""} />
          <span>Sync Customers</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Unique Buyers</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{customers.length}</p>
        </div>
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">Repeat Loyal Buyers</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{repeatBuyers}</p>
        </div>
        <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600">Total Customer GMV</p>
          <p className="text-2xl font-black text-orange-600 mt-1">
            ₹{totalSpentAll.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer by name, mobile number, or city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Mobile Number</th>
                <th className="py-3.5 px-4">City / Pincode</th>
                <th className="py-3.5 px-4">Orders Placed</th>
                <th className="py-3.5 px-4">Total Spend</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                    No customers found matching your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black flex items-center justify-center text-xs">
                          {c.name?.[0]?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          {c.ordersCount > 1 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                              <Award size={10} /> Repeat Buyer
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      +91 {c.phone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {c.city} {c.pincode ? `- ${c.pincode}` : ""}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 font-black px-2.5 py-1 rounded-lg">
                        <ShoppingBag size={12} className="text-orange-500" /> {c.ordersCount}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900">
                      ₹{c.totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          window.open(
                            `https://wa.me/91${c.phone}?text=${encodeURIComponent(
                              `Hello ${c.name}, thank you for shopping at TexoraShop! Let us know if you need any assistance.`
                            )}`,
                            "_blank"
                          )
                        }
                        className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition shadow-2xs"
                      >
                        <MessageSquare size={12} />
                        <span>WhatsApp</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}