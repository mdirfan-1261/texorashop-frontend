"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  RotateCcw,
  Boxes,
  Users,
  BarChart3,
  Percent,
  Image as ImageIcon,
  Settings,
  ChevronDown,
  ExternalLink,
  LogOut,
  X,
  PlusCircle,
  Shirt,
  Smartphone,
  Laptop,
  Footprints,
  Briefcase,
  Sparkles,
  Baby,
  ShoppingBasket,
  Headphones,
  Building2,
  UserCheck,
  ShieldCheck,
  Banknote,
} from "lucide-react";

const CATEGORY_LINKS = [
  { name: "All Categories Hub", href: "/admin/products", icon: ShoppingBag },
  { name: "Add New Product", href: "/admin/products/new", icon: PlusCircle },
  { name: "Fashion Store", href: "/admin/products/fashion", icon: Shirt },
  { name: "Mobiles Store", href: "/admin/products/mobiles", icon: Smartphone },
  { name: "Electronics Store", href: "/admin/products/electronics", icon: Laptop },
  { name: "Footwear Store", href: "/admin/products/footwear", icon: Footprints },
  { name: "Bags & Luggage", href: "/admin/products/bags", icon: Briefcase },
  { name: "Beauty & Care", href: "/admin/products/beauty", icon: Sparkles },
  { name: "Kids & Toys", href: "/admin/products/kids", icon: Baby },
  { name: "Grocery Store", href: "/admin/products/grocery", icon: ShoppingBasket },
];

export default function AdminSidebar({
  admin,
  sidebarOpen = false,
  setSidebarOpen,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [catalogOpen, setCatalogOpen] = useState(true);

  // Identify Current Role
  const role = admin?.role || "super_admin";
  const isSuperAdmin = role === "super_admin" || role === "admin";
  const isManager = role === "manager";
  const isCashier = role === "cashier";
  const isDispatch = role === "dispatch";

  const closeSidebar = () => {
    if (typeof setSidebarOpen === "function") {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("texora_admin");
    localStorage.removeItem("texora_pos_session");
    router.push("/admin/login");
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Modern Compact Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-56 shrink-0 flex-col justify-between border-r border-slate-800 bg-[#0f172a] text-slate-200 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Management Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3">
          <div>
            <p className="text-[9px] font-extrabold tracking-widest text-orange-400 uppercase">
              {role.replace("_", " ")}
            </p>
            <h2 className="text-xs font-black tracking-tight text-white">
              Texora Control Hub
            </h2>
          </div>

          <button
            onClick={closeSidebar}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Navigation Links (ROLE-BASED FILTERED) */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-3">
          {/* 1. Main Dashboard (Super Admin & Manager only) */}
          {(isSuperAdmin || isManager) && (
            <Link
              href="/admin"
              onClick={closeSidebar}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                pathname === "/admin"
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
              <span>Dashboard</span>
            </Link>
          )}

          {/* 🖥️ 2. POS Counter Billing (Super Admin, Manager & Cashier) */}
          {(isSuperAdmin || isManager || isCashier) && (
            <>
              <Link
                href="/admin/pos"
                onClick={closeSidebar}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  pathname === "/admin/pos"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                }`}
              >
                <Laptop className="h-3.5 w-3.5 shrink-0" />
                <span>🖥️ POS Billing</span>
              </Link>

              <Link
                href="/admin/pos/shift"
                onClick={closeSidebar}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  pathname === "/admin/pos/shift"
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                }`}
              >
                <Banknote className="h-3.5 w-3.5 shrink-0" />
                <span>💵 Shift Cash Register</span>
              </Link>
            </>
          )}

          {/* 📦 3. Orders & Shipping (Super Admin, Manager & Dispatch) */}
          {(isSuperAdmin || isManager || isDispatch) && (
            <>
              <Link
                href="/admin/orders"
                onClick={closeSidebar}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  pathname.startsWith("/admin/orders")
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <Truck className="h-3.5 w-3.5 shrink-0" />
                <span>Orders & Delivery</span>
              </Link>

              <Link
                href="/admin/returns"
                onClick={closeSidebar}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  pathname.startsWith("/admin/returns")
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span>Returns & Refunds</span>
              </Link>
            </>
          )}

          {/* 📦 4. Inventory & Stock (Super Admin & Manager) */}
          {(isSuperAdmin || isManager) && (
            <Link
              href="/admin/inventory"
              onClick={closeSidebar}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                pathname.startsWith("/admin/inventory")
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-500/30"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <Boxes className="h-3.5 w-3.5 shrink-0" />
              <span>Inventory & Stock</span>
            </Link>
          )}

          {/* 🛍️ 5. Category-Wise Products Catalog (Super Admin & Manager) */}
          {(isSuperAdmin || isManager) && (
            <div>
              <button
                type="button"
                onClick={() => setCatalogOpen(!catalogOpen)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                  pathname.startsWith("/admin/products")
                    ? "bg-slate-800 text-orange-400"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                  <span>Category Catalog</span>
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    catalogOpen ? "rotate-180 text-orange-400" : "text-slate-400"
                  }`}
                />
              </button>

              {catalogOpen && (
                <div className="mt-1 ml-2.5 space-y-0.5 border-l border-slate-800 pl-2">
                  {CATEGORY_LINKS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                          isActive
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-3 w-3 shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 📊 6. Revenue & Reports (Super Admin Only - Owner) */}
          {isSuperAdmin && (
            <Link
              href="/admin/reports"
              onClick={closeSidebar}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                pathname.startsWith("/admin/reports")
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 shrink-0" />
              <span>Revenue & Reports</span>
            </Link>
          )}

          {/* 🏷️ 7. Discounts & Offers (Super Admin & Manager) */}
          {(isSuperAdmin || isManager) && (
            <Link
              href="/admin/discounts"
              onClick={closeSidebar}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                pathname.startsWith("/admin/discounts")
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <Percent className="h-3.5 w-3.5 shrink-0" />
              <span>Discounts & Offers</span>
            </Link>
          )}

          {/* ⚙️ 8. Store Settings (Super Admin Only) */}
          {isSuperAdmin && (
            <Link
              href="/admin/settings"
              onClick={closeSidebar}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                pathname.startsWith("/admin/settings")
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <Settings className="h-3.5 w-3.5 shrink-0" />
              <span>Store Settings</span>
            </Link>
          )}

          {/* 🏢 9. Organization & Legal Profile (Super Admin Only) */}
          {isSuperAdmin && (
            <Link
              href="/admin/organization"
              onClick={closeSidebar}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                pathname.startsWith("/admin/organization")
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span>Organization Profile</span>
            </Link>
          )}

          {/* 👥 10. Staff & Cashiers Hub (Super Admin Only) */}
          {isSuperAdmin && (
            <Link
              href="/admin/staff"
              onClick={closeSidebar}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                pathname.startsWith("/admin/staff")
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Staff & Cashiers</span>
            </Link>
          )}

          {/* 📜 11. Security Audit Logs (Super Admin Only) */}
          {isSuperAdmin && (
            <Link
              href="/admin/audit-logs"
              onClick={closeSidebar}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                pathname.startsWith("/admin/audit-logs")
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Security Audit Logs</span>
            </Link>
          )}
        </nav>

        {/* Bottom User & Logout Bar */}
        <div className="border-t border-slate-800/80 p-3">
          <div className="mb-2 flex items-center justify-between rounded-lg bg-slate-900/60 p-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-white">
                {admin?.name || "Admin User"}
              </p>
              <p className="text-[9px] font-extrabold uppercase text-orange-400">
                {role.replace("_", " ")}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-rose-400"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-800 py-1.5 text-[10px] font-bold text-slate-400 hover:border-slate-700 hover:text-white transition-all"
          >
            <span>Live Store</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </aside>
    </>
  );
}