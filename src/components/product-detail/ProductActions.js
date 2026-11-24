"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";

export default function ProductActions({
  product,
  selectedSize,
  selectedColor,
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isLoggedIn, openAuthModal } = useUser();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = (product?.stock ?? 25) <= 0;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    addToCart(product, selectedSize || "Free Size", selectedColor || "Standard", quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;

    // 1. Add item to cart
    addToCart(product, selectedSize || "Free Size", selectedColor || "Standard", quantity);

    // 2. Check if logged in
    if (isLoggedIn) {
      router.push("/cart");
    } else {
      // 3. Open Shopsy OTP Login -> On verify, forward directly to /cart
      openAuthModal(() => {
        router.push("/cart");
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <label className="text-xs font-black tracking-wider text-slate-700 uppercase">
          Quantity
        </label>
        <div className="mt-3 inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-8 w-8 rounded-lg bg-white text-sm font-black text-slate-700 shadow-2xs hover:bg-slate-100"
          >
            -
          </button>
          <span className="w-12 text-center text-xs font-black text-slate-800">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-8 w-8 rounded-lg bg-white text-sm font-black text-slate-700 shadow-2xs hover:bg-slate-100"
          >
            +
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 font-black transition ${
            isOutOfStock
              ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
              : "border-orange-500 bg-orange-50 text-sm text-orange-600 hover:bg-orange-100/80 active:scale-95"
          }`}
        >
          {justAdded ? (
            <>
              <Check className="h-5 w-5 text-emerald-600" />
              <span className="text-emerald-700">Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-black text-white shadow-md transition ${
            isOutOfStock
              ? "bg-slate-300 shadow-none cursor-not-allowed"
              : "bg-orange-500 shadow-orange-500/25 hover:bg-orange-600 active:scale-95"
          }`}
        >
          <Zap className="h-5 w-5 fill-current" />
          <span>{isOutOfStock ? "Unavailable" : "Buy Now"}</span>
        </button>
      </div>
    </div>
  );
}