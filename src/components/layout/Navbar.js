"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, ChevronDown, Package, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";

export default function Navbar() {
  const router = useRouter();
  const { totalItemsCount, totalCount } = useCart();
  const { user, isLoggedIn, openAuthModal, logout } = useUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const cartCount = totalItemsCount ?? totalCount ?? 0;

  // UI-only: keep the badge compact for large counts
  const cartBadge = cartCount > 99 ? "99+" : cartCount;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/90 shadow-2xs backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-950/85">
      {/* Main Navbar */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-1.5 sm:gap-4 sm:px-5 sm:py-2.5 lg:px-6">
        {/* Brand Logo */}
        <Link
          href="/"
          aria-label="TexoraShop home"
          className="group flex shrink-0 items-center gap-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:gap-2"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-orange-700 shadow-sm shadow-orange-500/25 ring-1 ring-inset ring-white/20 transition group-hover:scale-105 motion-reduce:transition-none sm:h-9 sm:w-9 sm:rounded-xl">
            <span className="text-sm font-black text-white sm:text-lg">T</span>
          </div>
          <span className="whitespace-nowrap text-[15px] font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-lg lg:text-xl">
            Texora<span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">Shop</span>
            <span className="text-orange-500">.</span>
          </span>
        </Link>

        {/* Desktop / Tablet Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden min-w-0 max-w-xl flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products, brands and more..."
            aria-label="Search products"
            className="h-9 w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 text-[13px] text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900 dark:focus:ring-orange-500/20"
          />
        </form>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          {/* Customer Profile / Sign In */}
          {isLoggedIn ? (
            <div
              className="relative"
              onMouseEnter={() => setShowProfileMenu(true)}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
                className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-1.5 text-xs font-semibold text-slate-800 transition hover:border-orange-400 hover:bg-orange-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 sm:pl-1.5 sm:pr-2.5 sm:text-[13px]"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-[11px] font-black text-white sm:h-7 sm:w-7">
                  {user.name?.[0]?.toUpperCase() || "M"}
                </div>
                {/* name hidden on small screens to save space */}
                <span className="hidden max-w-[110px] truncate sm:inline">{user.name}</span>
                <ChevronDown
                  className={`hidden h-3.5 w-3.5 text-slate-400 transition-transform motion-reduce:transition-none sm:block ${
                    showProfileMenu ? "rotate-180 text-orange-500" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-50 w-56 pt-1.5 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-xs font-semibold text-slate-700 shadow-xl shadow-slate-900/10 ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <div className="border-b border-slate-100 px-2.5 py-2 dark:border-slate-800">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Signed in as
                      </p>
                      <p className="truncate text-[13px] font-extrabold leading-tight text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        +91 {user.phone || "Customer"}
                      </p>
                    </div>

                    <div className="mt-1 space-y-0.5">
                      <Link
                        href="/account"
                        role="menuitem"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                      >
                        <User className="h-4 w-4 text-orange-500" />
                        <span>My Account</span>
                      </Link>
                      <Link
                        href="/orders"
                        role="menuitem"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-slate-700 transition hover:bg-orange-50 hover:text-orange-600 dark:text-slate-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
                      >
                        <Package className="h-4 w-4 text-orange-500" />
                        <span>My Orders</span>
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          logout();
                          setShowProfileMenu(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              aria-label="Sign in"
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold text-slate-800 transition hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:text-slate-100 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 sm:px-3.5"
            >
              <User className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}

          {/* Cart Icon with Red Badge */}
          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} items`}
            className="relative flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold text-slate-800 transition hover:bg-orange-50 hover:text-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 dark:text-slate-100 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 sm:px-3"
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white shadow-xs ring-2 ring-white dark:ring-slate-950">
                  {cartBadge}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Mobile Search */}
      <form onSubmit={handleSearchSubmit} className="px-3 pb-2 sm:hidden">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products, brands and more..."
            aria-label="Search products"
            className="h-8 w-full rounded-full border border-gray-200 bg-gray-50 pl-9 pr-3 text-xs text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-orange-500/20"
          />
        </div>
      </form>
    </header>
  );
}