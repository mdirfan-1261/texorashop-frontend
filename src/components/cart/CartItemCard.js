"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ShieldCheck } from "lucide-react";

export default function CartItemCard({ item, onUpdateQuantity, onRemove }) {
  const originalPrice = Math.round(item.price * 1.6);
  const discountPercent = Math.round(((originalPrice - item.price) / originalPrice) * 100);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition-all">
      <div className="flex gap-4">
        {/* Product Image */}
        <Link
          href={`/products/${item.id || item._id}`}
          className="relative w-24 h-28 sm:w-28 sm:h-32 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100"
        >
          <Image
            src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
            alt={item.title || item.name}
            fill
            sizes="120px"
            className="object-cover"
          />
        </Link>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <Link
              href={`/products/${item.id || item._id}`}
              className="text-sm font-bold text-gray-900 hover:text-[#f4511e] transition-colors line-clamp-2"
            >
              {item.title || item.name}
            </Link>

            <div className="flex items-center gap-2 mt-1">
              {item.selectedSize && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">
                  Size: {item.selectedSize}
                </span>
              )}
              {item.selectedColor && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">
                  Color: {item.selectedColor}
                </span>
              )}
              <span className="text-[11px] text-gray-400 font-medium">Seller: Swoz Trader</span>
            </div>

            {/* Pricing Strip */}
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-base font-black text-gray-900">₹{item.price}</span>
              <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
              <span className="text-xs font-bold text-emerald-600">{discountPercent}% Off</span>
            </div>
          </div>

          {/* Bottom Actions: Stepper + Remove */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => onUpdateQuantity(item.id || item._id, (item.quantity || 1) - 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
                disabled={item.quantity <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="w-9 h-8 flex items-center justify-center text-xs font-bold text-gray-900 bg-gray-50 border-x border-gray-300">
                {item.quantity || 1}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id || item._id, (item.quantity || 1) + 1)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(item.id || item._id)}
              className="text-xs font-bold text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors px-2 py-1 rounded"
            >
              <Trash2 size={14} /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}