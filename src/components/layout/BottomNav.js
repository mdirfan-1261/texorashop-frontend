"use client";

import Link from "next/link";
import { Home, Grid, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function BottomNav() {
  const { totalCount } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-200 bg-white/95 py-2 backdrop-blur-md md:hidden">
      <Link href="/" className="flex flex-col items-center text-blue-600">
        <Home className="h-5 w-5" />
        <span className="mt-0.5 text-[10px] font-medium">Home</span>
      </Link>
      <Link href="/#featured" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
        <Grid className="h-5 w-5" />
        <span className="mt-0.5 text-[10px] font-medium">Categories</span>
      </Link>
      <Link href="/cart" className="relative flex flex-col items-center text-gray-500 hover:text-blue-600">
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {totalCount > 0 && (
            <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
              {totalCount}
            </span>
          )}
        </div>
        <span className="mt-0.5 text-[10px] font-medium">Cart</span>
      </Link>
      <Link href="/login" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
        <User className="h-5 w-5" />
        <span className="mt-0.5 text-[10px] font-medium">Account</span>
      </Link>
    </nav>
  );
}