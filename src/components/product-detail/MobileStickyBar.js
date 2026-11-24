"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";

export default function MobileStickyBar({
  product,
  selectedSize,
  selectedColor,
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isLoggedIn, openAuthModal } = useUser();
  const [justAdded, setJustAdded] = useState(false);

  const isOutOfStock = (product?.stock ?? 25) <= 0;

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;

    addToCart(product, selectedSize || "Free Size", selectedColor || "Standard", 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;

    // 1. Add item to cart
    addToCart(product, selectedSize || "Free Size", selectedColor || "Standard", 1);

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
    <div className="fixed right-0 bottom-0 left-0 z-50 flex items-center gap-2.5 border-t border-slate-200 bg-white p-3 shadow-2xl md:hidden">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 text-xs font-black transition active:scale-95 ${
          isOutOfStock
            ? "border-slate-200 bg-slate-100 text-slate-400"
            : "border-orange-500 bg-orange-50 text-orange-600"
        }`}
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4 text-emerald-600" />
            <span className="text-emerald-700">Added!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4" />
            <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handleBuyNow}
        disabled={isOutOfStock}
        className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-black text-white shadow-md transition active:scale-95 ${
          isOutOfStock
            ? "bg-slate-300 shadow-none"
            : "bg-orange-500 shadow-orange-500/30"
        }`}
      >
        <Zap className="h-4 w-4 fill-current" />
        <span>{isOutOfStock ? "Unavailable" : "Buy Now"}</span>
      </button>
    </div>
  );
}