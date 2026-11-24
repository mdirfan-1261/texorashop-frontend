"use client";

import React from "react";
import { MapPin, ChevronRight, Plus } from "lucide-react";

export default function CartAddressBar({ selectedAddress, onOpenAddressModal, isLoggedIn, onOpenAuth }) {
  if (!isLoggedIn) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-[#f4511e] flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Delivery Address</p>
            <p className="text-sm font-bold text-gray-900">Sign in to choose your delivery address</p>
          </div>
        </div>
        <button
          onClick={onOpenAuth}
          className="text-xs font-bold text-[#f4511e] border border-orange-500 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (!selectedAddress) {
    return (
      <div className="bg-white border border-dashed border-orange-300 rounded-xl p-4 shadow-sm mb-4 flex items-center justify-between bg-orange-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 text-[#f4511e] flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <div>
            <p className="text-xs text-orange-700 font-semibold">No Delivery Address Selected</p>
            <p className="text-sm font-bold text-gray-900">Add an address to see delivery timeline & checkout</p>
          </div>
        </div>
        <button
          onClick={onOpenAddressModal}
          className="text-xs font-bold bg-[#f4511e] hover:bg-[#d84315] text-white px-4 py-2 rounded-lg transition-all flex items-center gap-1 shadow-sm"
        >
          <Plus size={14} /> Add Address
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-orange-50 text-[#f4511e] flex items-center justify-center shrink-0 mt-0.5">
          <MapPin size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deliver to:</span>
            <span className="text-sm font-extrabold text-gray-900">{selectedAddress.name}</span>
            <span className="bg-gray-100 text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded">
              {selectedAddress.pincode}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
            {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state}
          </p>
        </div>
      </div>

      <button
        onClick={onOpenAddressModal}
        className="text-xs font-bold text-[#f4511e] hover:text-[#d84315] border border-orange-200 hover:border-orange-500 hover:bg-orange-50/50 px-3.5 py-1.5 rounded-lg transition-all shrink-0 self-start sm:self-auto"
      >
        Change
      </button>
    </div>
  );
}