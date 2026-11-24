"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Clock,
  ShieldCheck,
  ChevronDown,
  Truck,
  AlertTriangle,
  Settings,
  ExternalLink,
  LogOut,
  Laptop,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

// Safe API URL handler (Prevents duplicate /api/api)
const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loginTime, setLoginTime] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // ==========================================
  // 🛡️ RBAC ROUTE GUARD & ROLE VERIFICATION
  // ==========================================
  useEffect(() => {
    if (isLoginPage) return;

    // Check admin or staff session
    const saved = localStorage.getItem("texora_admin");
    const posSession = localStorage.getItem("texora_pos_session");

    let currentUser = null;

    if (saved) {
      try {
        currentUser = JSON.parse(saved);
      } catch (e) {}
    } else if (posSession) {
      try {
        const parsedPos = JSON.parse(posSession);
        currentUser = {
          ...parsedPos.staff,
          token: parsedPos.token,
          role: parsedPos.staff?.role || "cashier",
        };
      } catch (e) {}
    }

    // Agar koi session nahi hai, login par bhejo
    if (!currentUser || !currentUser.token) {
      router.push("/admin/login");
      return;
    }

    const role = currentUser.role || currentUser.user?.role || "cashier";
    const userObj = {
      name: currentUser.name || currentUser.user?.name || "Admin User",
      email: currentUser.email || currentUser.user?.email || "",
      role: role === "admin" ? "super_admin" : role,
      token: currentUser.token,
    };

    setAdmin(userObj);

    // ==========================================
    // 🛑 STRICT ROLE-BASED ACCESS CONTROL (RBAC)
    // ==========================================
    // 1. CASHIER: Only allowed on POS and Shift register
    if (userObj.role === "cashier") {
      const allowedCashierRoutes = ["/admin/pos", "/admin/pos/shift"];
      const isAllowed = allowedCashierRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!isAllowed) {
        // Cashier kisi aur page par jaane ki koshish kare toh turant POS par bhejo
        router.replace("/admin/pos");
        return;
      }
    }

    // 2. DISPATCH: Only allowed on Orders and Returns
    if (userObj.role === "dispatch") {
      const allowedDispatchRoutes = ["/admin/orders", "/admin/returns"];
      const isAllowed = allowedDispatchRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (!isAllowed) {
        router.replace("/admin/orders");
        return;
      }
    }

    // 3. MANAGER: Restricted from Organization Bank & Audit logs
    if (userObj.role === "manager") {
      const forbiddenManagerRoutes = [
        "/admin/organization",
        "/admin/audit-logs",
        "/admin/settings",
      ];
      const isForbidden = forbiddenManagerRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isForbidden) {
        router.replace("/admin");
        return;
      }
    }

    // Set Live Clock
    const now = new Date();
    const formatted =
      now.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) +
      ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    setLoginTime(formatted);

    // Load Live Notifications (For Super Admin and Managers only)
    if (["super_admin", "admin", "manager"].includes(userObj.role)) {
      async function loadLiveNotifications() {
        try {
          const [pRes, oRes] = await Promise.all([
            fetch(`${API_BASE}/products`),
            fetch(`${API_BASE}/orders`, {
              headers: { Authorization: `Bearer ${userObj.token}` },
            }),
          ]);

          const liveNotifs = [];

          if (oRes.ok) {
            const orders = await oRes.json();
            const pending = (Array.isArray(orders) ? orders : []).filter(
              (o) => o.status === "Pending" || o.status === "Confirmed"
            );
            pending.slice(0, 4).forEach((o) => {
              liveNotifs.push({
                id: o._id,
                type: "order",
                title: `New Order from ${o.customerName}`,
                sub: `Amount: ₹${Number(o.totalPrice || 0).toLocaleString("en-IN")} (${o.status})`,
                href: "/admin/orders",
              });
            });
          }

          if (pRes.ok) {
            const products = await pRes.json();
            const lowStock = (Array.isArray(products) ? products : []).filter(
              (p) => (p.stock ?? 0) <= 20
            );
            lowStock.slice(0, 4).forEach((p) => {
              liveNotifs.push({
                id: p._id,
                type: "stock",
                title: `Low Stock: ${p.name || p.title}`,
                sub: `Only ${p.stock} left in stock`,
                href: "/admin/inventory",
              });
            });
          }

          setNotifications(liveNotifs);
        } catch (e) {
          console.error("Notifications fetch error:", e);
        }
      }

      loadLiveNotifications();
    }
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem("texora_admin");
    localStorage.removeItem("texora_pos_session");
    router.push("/admin/login");
  };

  if (isLoginPage) return <>{children}</>;
  if (!admin) return null;

  const roleLabel = (admin.role || "super_admin").replace("_", " ");

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-[#f8fafc]">
      {/* Top Header Console (50px) */}
      <div className="relative z-30 flex h-[50px] shrink-0 items-center justify-between border-b border-slate-800 bg-[#0f172a] px-3 sm:px-6 text-white">
        {/* Left: Mobile Menu Button + Logo */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 transition hover:border-orange-500 hover:text-white lg:hidden"
            aria-label="Open sidebar menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-xs font-black text-white">
              T
            </div>
            <div>
              <h1 className="text-xs font-black uppercase tracking-wider">TEXORASHOP</h1>
              <p className="text-[9px] uppercase tracking-widest text-orange-400">Control Hub</p>
            </div>
          </Link>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 sm:flex">
            <Clock className="h-3 w-3 text-orange-400" />
            <div>
              <p className="text-[8px] uppercase text-slate-400">Last Login</p>
              <p className="text-[10px] font-bold text-white">{loginTime}</p>
            </div>
          </div>

          {/* Notifications (For Admin / Manager) */}
          {notifications.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotifMenu(!showNotifMenu);
                  setShowProfileMenu(false);
                }}
                className="relative rounded-lg border border-slate-700 bg-slate-800/80 p-1.5 text-slate-300 hover:border-orange-500 hover:text-white"
              >
                <Bell className="h-3.5 w-3.5" />
                <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-orange-500 px-1 text-[8px] font-black text-white">
                  {notifications.length}
                </span>
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3.5 py-2.5">
                    <span className="text-xs font-extrabold text-slate-900">
                      Notifications ({notifications.length})
                    </span>
                    <button
                      onClick={() => setShowNotifMenu(false)}
                      className="text-[10px] font-bold text-orange-600"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-64 divide-y divide-slate-100 overflow-y-auto">
                    {notifications.map((n) => (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => setShowNotifMenu(false)}
                        className="flex items-start gap-2.5 p-3 hover:bg-orange-50/50"
                      >
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-orange-100 text-orange-600">
                          {n.type === "order" ? (
                            <Truck className="h-3 w-3" />
                          ) : (
                            <AlertTriangle className="h-3 w-3" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="truncate text-xs font-bold text-slate-800">{n.title}</p>
                          <p className="text-[10px] text-slate-500">{n.sub}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Pill with Role Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-2 sm:px-2.5 py-1 hover:border-orange-500"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
              <div className="text-left">
                <p className="text-[11px] font-bold leading-none text-white truncate max-w-[80px] sm:max-w-none">
                  {admin.name}
                </p>
                <p className="text-[9px] font-extrabold text-orange-400 uppercase">
                  {roleLabel}
                </p>
              </div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl">
                <div className="p-1.5 text-xs font-semibold">
                  {/* Super admin options */}
                  {["super_admin", "admin"].includes(admin.role) && (
                    <Link
                      href="/admin/organization"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" /> Organization Profile
                    </Link>
                  )}

                  {/* Cashier quick POS shortcut */}
                  {admin.role === "cashier" && (
                    <Link
                      href="/admin/pos"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-emerald-700 hover:bg-emerald-50"
                    >
                      <Laptop className="h-3.5 w-3.5 text-emerald-600" /> POS Billing Counter
                    </Link>
                  )}

                  <Link
                    href="/"
                    target="_blank"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" /> View Live Store
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left font-bold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden relative">
        <AdminSidebar
          admin={admin}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}