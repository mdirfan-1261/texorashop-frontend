"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, Package, User } from "lucide-react";
import { useUser } from "@/context/UserContext";

/* ── UI-only style tokens ── */
const tabBase =
  "relative flex min-h-[48px] flex-col items-center justify-center gap-0.5 text-[10.5px] font-semibold leading-none transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#f4511e]/60 active:bg-orange-50/70 dark:active:bg-orange-500/10";
const activeCls = "text-[#f4511e]";
const idleCls = "text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white";

function TabInner({ icon: Icon, label, active }) {
  return (
    <>
      {/* top active indicator */}
      <span
        aria-hidden="true"
        className={`absolute inset-x-5 top-0 h-[2.5px] rounded-b-full bg-[#f4511e] transition-opacity motion-reduce:transition-none ${
          active ? "opacity-100" : "opacity-0"
        }`}
      />
      <Icon size={20} strokeWidth={active ? 2.4 : 1.9} />
      <span className="mt-0.5">{label}</span>
    </>
  );
}

export default function MobileNav() {
  const pathname = usePathname();
  const { isLoggedIn, openAuthModal } = useUser();

  const homeActive = pathname === "/";
  const categoriesActive = pathname.startsWith("/category");
  const ordersActive = pathname === "/orders";
  const accountActive = pathname === "/account";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-gray-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_-12px_rgba(15,23,42,0.25)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-950/90 md:hidden"
    >
      {/* 1. Home */}
      <Link
        href="/"
        aria-current={homeActive ? "page" : undefined}
        className={`${tabBase} ${homeActive ? activeCls : idleCls}`}
      >
        <TabInner icon={Home} label="Home" active={homeActive} />
      </Link>

      {/* 2. Categories */}
      <Link
        href="/category/all"
        aria-current={categoriesActive ? "page" : undefined}
        className={`${tabBase} ${categoriesActive ? activeCls : idleCls}`}
      >
        <TabInner icon={Grid} label="Categories" active={categoriesActive} />
      </Link>

      {/* 3. My Orders */}
      <Link
        href="/orders"
        aria-current={ordersActive ? "page" : undefined}
        className={`${tabBase} ${ordersActive ? activeCls : idleCls}`}
      >
        <TabInner icon={Package} label="My Orders" active={ordersActive} />
      </Link>

      {/* 4. Account */}
      {isLoggedIn ? (
        <Link
          href="/account"
          aria-current={accountActive ? "page" : undefined}
          className={`${tabBase} ${accountActive ? activeCls : idleCls}`}
        >
          <TabInner icon={User} label="Account" active={accountActive} />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => openAuthModal()}
          className={`${tabBase} ${idleCls} hover:text-[#f4511e]`}
        >
          <TabInner icon={User} label="Account" active={false} />
        </button>
      )}
    </nav>
  );
}