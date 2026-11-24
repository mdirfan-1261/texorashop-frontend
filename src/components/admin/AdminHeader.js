"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Clock,
  ShieldCheck,
  ChevronDown,
  Truck,
  AlertTriangle,
  Settings,
  ExternalLink,
  LogOut,
} from "lucide-react";

export default function AdminHeader({ admin, loginTime, notifications = [] }) {
  const router = useRouter();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("texora_admin");
    router.push("/admin/login");
  };

  return (
    <header className="relative z-30 flex h-[52px] shrink-0 items-center justify-between border-b border-slate-800 bg-[#0f172a] px-4 text-white sm:px-6">
      <Link href="/admin" className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-xs font-black text-white">
          T
        </div>
        <div>
          <h1 className="text-xs font-black uppercase tracking-wider">TEXORASHOP</h1>
          <p className="text-[9px] uppercase tracking-widest text-orange-400 font-extrabold">
            Admin Console
          </p>
        </div>
      </Link>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 sm:flex">
          <Clock className="h-3 w-3 text-orange-400" />
          <div>
            <p className="text-[8px] uppercase text-slate-400 font-extrabold">Last Login</p>
            <p className="text-[10px] font-bold text-white">{loginTime}</p>
          </div>
        </div>

        {/* Notifications */}
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
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-orange-500 px-1 text-[8px] font-black text-white">
                {notifications.length}
              </span>
            )}
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

        {/* Admin Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 hover:border-orange-500"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
            <div className="text-left">
              <p className="text-[11px] font-bold leading-none text-white">{admin?.name || "Admin"}</p>
              <p className="text-[9px] text-orange-400 font-extrabold">Super Admin</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-2xl">
              <div className="p-1.5 text-xs font-semibold">
                <Link
                  href="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" /> Store Settings
                </Link>
                <Link
                  href="/"
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
    </header>
  );
}