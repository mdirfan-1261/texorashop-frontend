"use client";

import React from "react";
import Image from "next/image";
import { X, Printer, Phone, MapPin, Package, User } from "lucide-react";

export default function AdminOrderDetailModal({ order, onClose }) {
  if (!order) return null;

  const items = order.items || order.orderItems || [];
  const totalPrice = Number(order.totalPrice ?? order.totalAmount ?? 0);
  const status = order.status || order.orderStatus || "Pending";

  const customerName = order.customerName || order.shippingAddress?.name || "Customer";
  const phone = order.phone || order.shippingAddress?.phone || "N/A";
  const city = order.city || order.shippingAddress?.city || "N/A";
  const address = order.address || order.shippingAddress?.street || "N/A";
  const pincode = order.pincode || order.shippingAddress?.pincode || "N/A";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between bg-slate-900/60">
          <div>
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
              ORDER SLIP
            </span>
            <h3 className="font-mono font-bold text-white text-base">
              #{order._id?.slice(-8).toUpperCase() || "ORD-XXXX"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-700"
            >
              <Printer size={14} /> Print Slip
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User size={12} className="text-orange-400" /> Customer Information
              </p>
              <p className="text-sm font-bold text-white">{customerName}</p>
              <p className="text-slate-300 mt-1 flex items-center gap-1">
                <Phone size={12} className="text-slate-400" /> +91 {phone}
              </p>
              {order.email && <p className="text-slate-400 mt-0.5">{order.email}</p>}
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-orange-400" /> Shipping Address
              </p>
              <p className="text-slate-200">{address}</p>
              <p className="text-slate-300 font-semibold mt-0.5">
                {city} - <span className="text-white font-bold">{pincode}</span>
              </p>
            </div>
          </div>

          {/* Ordered Products List */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
              <Package size={12} className="text-orange-400" /> Ordered Items ({items.length})
            </p>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-14 rounded bg-slate-800 overflow-hidden border border-slate-700 shrink-0">
                      <Image
                        src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200"}
                        alt={item.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white line-clamp-1">{item.name}</p>
                      <p className="text-slate-400 mt-0.5">
                        Qty: <span className="font-bold text-white">{item.qty || item.quantity || 1}</span>
                      </p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-white text-sm">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Payment Mode</span>
              <span className="font-bold text-white">{order.paymentMethod || "Cash on Delivery"}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Delivery Fee</span>
              <span className="font-bold text-emerald-400 uppercase">Free</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
              <span className="font-bold text-sm text-white">Total Amount</span>
              <span className="font-mono font-black text-lg text-orange-400">
                ₹{totalPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}