"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Store,
} from "lucide-react";

// Safe API Base URL Handler
const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response received from server.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Invalid login credentials.");
      }

      const allowedRoles = ["admin", "super_admin", "manager", "cashier", "dispatch"];
      const userRole = data.role || data.user?.role;

      if (!allowedRoles.includes(userRole)) {
        throw new Error("Access Denied: You do not have staff or admin privileges.");
      }

      if (!data.token) {
        throw new Error("Authentication token missing from server response.");
      }

      // Save Primary Session
      localStorage.setItem("texora_admin", JSON.stringify(data));

      // 🛡️ Role-Based Smart Redirection
      if (userRole === "cashier") {
        // Also sync POS session for counter billing
        localStorage.setItem("texora_pos_session", JSON.stringify(data));
        setSuccess(`Welcome Cashier ${data.name || data.user?.name || ""}! Redirecting to POS Terminal...`);
        setTimeout(() => {
          router.replace("/admin/pos");
        }, 600);
      } else if (userRole === "dispatch") {
        setSuccess(`Welcome Dispatch Team! Redirecting...`);
        setTimeout(() => {
          router.replace("/admin/orders");
        }, 600);
      } else {
        setSuccess(`Welcome ${data.name || data.user?.name || "Admin"}! Redirecting...`);
        setTimeout(() => {
          router.replace("/admin");
        }, 600);
      }
    } catch (err) {
      console.error("Login Error:", err);
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Cannot connect to backend. Make sure server is running on port 5000.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100dvh-64px)] items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-[390px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
        
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 shadow-sm border border-orange-100">
            <Store size={26} strokeWidth={2.2} />
          </div>

          <h1 className="mt-3.5 text-xl font-bold tracking-tight text-slate-900">
            Texora Enterprise Portal
          </h1>

          <p className="mt-1 text-xs text-slate-500 font-medium">
            Sign in as Admin, Store Manager, or Cashier
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-semibold text-red-600 animate-in fade-in"
          >
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div
            role="status"
            className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-700 animate-in fade-in"
          >
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label
              htmlFor="staff-email"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="staff-email"
                type="email"
                required
                autoComplete="username"
                placeholder="admin@texorashop.in or cashier email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="staff-password"
              className="mb-1.5 block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="staff-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-orange-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-orange-600 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-orange-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In to Terminal
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 border-t border-slate-100 pt-3 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1 font-medium">
            <ShieldCheck size={13} className="text-emerald-500" />
            Enterprise Role-Based Access Control
          </p>
        </div>
      </section>
    </main>
  );
}