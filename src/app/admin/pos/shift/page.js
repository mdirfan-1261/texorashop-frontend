"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Banknote,
  Clock,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Loader2,
  IndianRupee,
  Lock,
  Unlock,
  RefreshCw,
  ArrowLeft,
  FileText,
  Printer,
  QrCode,
  CreditCard,
  Receipt,
  User,
  TrendingUp,
} from "lucide-react";

// Safe API URL handler (Prevents duplicate /api/api)
const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

const COUNTER_OPTIONS = [
  "Counter 1",
  "Counter 2",
  "Counter 3",
  "Counter 4",
  "Counter 5",
  "Counter 6",
];

export default function ShiftRegisterPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeShift, setActiveShift] = useState(null);
  const [alert, setAlert] = useState(null);

  // Open Shift Form State
  const [openingCash, setOpeningCash] = useState("1000");
  const [counterName, setCounterName] = useState("Counter 1");

  // Close Shift Modal State
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closingCash, setClosingCash] = useState("");
  const [closingNotes, setClosingNotes] = useState("");
  const [closedSummary, setClosedSummary] = useState(null);

  // Helper to extract JWT token
  const getAuthToken = () => {
    try {
      const posSession = localStorage.getItem("texora_pos_session");
      if (posSession) {
        const p = JSON.parse(posSession);
        if (p.token) return p.token;
      }
      const adminSession = localStorage.getItem("texora_admin");
      if (adminSession) {
        const a = JSON.parse(adminSession);
        return a.token || adminSession;
      }
    } catch {}
    return null;
  };

  // Fetch Current Active Shift
  const fetchCurrentShift = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setAlert({
          type: "error",
          message: "Please login with Cashier PIN or Admin account first.",
        });
        return;
      }

      const res = await fetch(`${API_BASE}/pos/shift/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (data.success) {
        setActiveShift(data.shift || null);
        if (data.shift?.counterName) {
          setCounterName(data.shift.counterName);
        }
      }
    } catch (err) {
      console.error("Shift Fetch Error:", err);
      setAlert({ type: "error", message: "Failed to connect to backend server." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentShift();
  }, []);

  // 1. Open New Shift
  const handleOpenShift = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/pos/shift/open`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          openingCash: Number(openingCash) || 0,
          counterName,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to open shift.");
      }

      setActiveShift(data.shift);
      setAlert({
        type: "success",
        message: `Shift opened successfully at ${counterName} with ₹${data.shift.openingCash} float cash!`,
      });
      setTimeout(() => setAlert(null), 4000);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Close Active Shift & Reconcile Cash
  const handleCloseShift = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/pos/shift/close`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          closingCash: Number(closingCash) || 0,
          closingNotes: closingNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to close shift.");
      }

      setClosedSummary(data.shift);
      setActiveShift(null);
      setCloseModalOpen(false);
      setClosingCash("");
      setClosingNotes("");
      setAlert({
        type: "success",
        message: "Shift closed & cash reconciliation report generated successfully!",
      });
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Live calculations for Active Shift
  const expectedCashInDrawer = activeShift
    ? (Number(activeShift.openingCash) || 0) + (Number(activeShift.cashSales) || 0)
    : 0;

  const currentDiff =
    closingCash !== "" ? Number(closingCash) - expectedCashInDrawer : 0;

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-xs font-bold">Loading Cash Register Status...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pos"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 transition-all"
            title="Back to POS Terminal"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Shift Cash Register & Drawer
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Open morning float cash drawer, track live counter revenue, and reconcile end-of-day cash.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeShift && (
            <button
              type="button"
              onClick={fetchCurrentShift}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5 text-orange-500" />
              <span>Refresh Metrics</span>
            </button>
          )}

          <Link
            href="/admin/pos"
            className="flex h-9 items-center gap-1.5 rounded-xl bg-orange-500 px-4 text-xs font-bold text-white shadow-sm shadow-orange-500/25 hover:bg-orange-600 transition-all active:scale-[0.99]"
          >
            <Monitor className="h-3.5 w-3.5" />
            <span>Go to POS Terminal</span>
          </Link>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs font-semibold shadow-xs ${
            alert.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
          )}
          <div className="flex-1 leading-relaxed">{alert.message}</div>
        </div>
      )}

      {/* ==========================================
          CASE 1: NO ACTIVE SHIFT OPEN (OPEN SHIFT FORM)
         ========================================== */}
      {!activeShift ? (
        <div className="mx-auto max-w-lg rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-200/40">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-200">
              <Banknote className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-900 tracking-tight">
              Open Cash Register Shift
            </h2>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Start your counter shift by declaring the opening cash in your drawer (petty cash / chillar float).
            </p>
          </div>

          <form onSubmit={handleOpenShift} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Billing Counter Terminal *
              </label>
              <select
                value={counterName}
                onChange={(e) => setCounterName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                {COUNTER_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Opening Float Cash in Drawer (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min={0}
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                  placeholder="2000"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2.5 text-base font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-500 font-medium">
                Initial change/coins kept in drawer for customer cash returns.
              </p>
            </div>

            {/* Quick Float Presets */}
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
                Quick Float Presets:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setOpeningCash(String(amt))}
                    className={`rounded-xl border py-2 text-xs font-mono font-bold transition-all ${
                      openingCash === String(amt)
                        ? "border-orange-500 bg-orange-50 text-orange-600 shadow-xs"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 text-xs font-black text-white shadow-md shadow-orange-500/25 hover:bg-orange-600 transition-all disabled:opacity-50 active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Opening Shift...</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  <span>Open Cash Drawer & Start Billing</span>
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* ==========================================
           CASE 2: ACTIVE SHIFT DASHBOARD (LIVE METRICS)
           ========================================== */
        <div className="space-y-5">
          {/* Active Shift Banner */}
          <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900 tracking-tight">
                    Shift Active: {activeShift.counterName}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 border border-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    OPEN
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-600 font-medium">
                  Cashier: <span className="font-bold text-slate-900">{activeShift.staffName}</span> • Started at:{" "}
                  <span className="font-bold text-slate-800">
                    {new Date(activeShift.startedAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCloseModalOpen(true)}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-xs font-bold text-white shadow-sm shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-[0.99]"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>End Shift & Reconcile Cash</span>
            </button>
          </div>

          {/* 4 Financial KPI Cards */}
          <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
            {/* 1. Opening Float */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Opening Float
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600">
                  <Banknote className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black font-mono text-slate-900 tabular-nums">
                ₹{activeShift.openingCash || 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Starting cash in drawer</p>
            </div>

            {/* 2. Total Bills */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Bills
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-orange-600">
                  <Receipt className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black font-mono text-orange-600 tabular-nums">
                {activeShift.totalBillsCount || 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Walk-in customers billed</p>
            </div>

            {/* 3. Shift Revenue */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Shift Revenue
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
                  <IndianRupee className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black font-mono text-blue-600 tabular-nums">
                ₹{activeShift.totalSales || 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">All payment modes combined</p>
            </div>

            {/* 4. Expected Cash */}
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4.5 shadow-xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Expected Cash
                </span>
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-white shadow-xs">
                  <Banknote className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black font-mono text-emerald-700 tabular-nums">
                ₹{expectedCashInDrawer}
              </p>
              <p className="text-[10px] text-emerald-700/80 mt-0.5 font-semibold">Opening Float + Cash Sales</p>
            </div>
          </div>

          {/* Payment Modes Breakdown Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Live Sales Split by Payment Mode
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Real-time segregation of sales across counter tender methods.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-400 font-mono">
                Counter: {activeShift.counterName}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {/* Cash Sales */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 transition-all hover:bg-emerald-50/70">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Banknote className="h-4 w-4" />
                  <span className="text-xs font-bold">Cash Sales (In Drawer)</span>
                </div>
                <p className="mt-2 font-mono text-xl font-black text-slate-900">
                  ₹{activeShift.cashSales || 0}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Physical notes & coins collected</p>
              </div>

              {/* UPI Sales */}
              <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4 transition-all hover:bg-orange-50/70">
                <div className="flex items-center gap-2 text-orange-700">
                  <QrCode className="h-4 w-4" />
                  <span className="text-xs font-bold">UPI / QR (In Bank)</span>
                </div>
                <p className="mt-2 font-mono text-xl font-black text-slate-900">
                  ₹{activeShift.upiSales || 0}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Instant online store VPA settlements</p>
              </div>

              {/* Card Sales */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 transition-all hover:bg-blue-50/70">
                <div className="flex items-center gap-2 text-blue-700">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-xs font-bold">Card Swipe (POS Machine)</span>
                </div>
                <p className="mt-2 font-mono text-xl font-black text-slate-900">
                  ₹{activeShift.cardSales || 0}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">Debit / Credit card swipe machine</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CLOSE SHIFT & RECONCILIATION MODAL
         ========================================== */}
      {closeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <Lock className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  End Shift & Tally Cash Drawer
                </h3>
              </div>
              <button
                onClick={() => setCloseModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCloseShift} className="mt-4 space-y-4">
              {/* Expected Cash Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Opening Float Cash:</span>
                  <span className="font-mono text-slate-800 font-bold">
                    ₹{activeShift?.openingCash || 0}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>Cash Sales Today:</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    +₹{activeShift?.cashSales || 0}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm">
                  <span className="text-slate-900">Expected Cash in Drawer:</span>
                  <span className="font-mono text-emerald-700 font-black">
                    ₹{expectedCashInDrawer}
                  </span>
                </div>
              </div>

              {/* Actual Cash Input */}
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-800">
                  Actual Physical Cash Counted in Drawer (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min={0}
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    placeholder={String(expectedCashInDrawer)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2.5 text-lg font-mono font-black text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Live Tally Difference Indicator */}
              {closingCash !== "" && (
                <div
                  className={`rounded-2xl border p-3.5 text-xs font-bold ${
                    currentDiff === 0
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : currentDiff < 0
                      ? "border-rose-200 bg-rose-50 text-rose-800"
                      : "border-blue-200 bg-blue-50 text-blue-800"
                  }`}
                >
                  {currentDiff === 0 && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>Hisaab Match: Physical cash matches expected cash exactly (₹0 difference).</span>
                    </div>
                  )}
                  {currentDiff < 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                      <span>
                        Cash Shortage: ₹{Math.abs(currentDiff)} kam hai (Shortage will be recorded in audit log).
                      </span>
                    </div>
                  )}
                  {currentDiff > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-blue-600" />
                      <span>Cash Surplus: ₹{currentDiff} extra cash found in drawer.</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Closing Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="e.g. ₹50 coin shortage due to customer round-off..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCloseModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || closingCash === ""}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 transition-all"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Close Shift & Lock</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          CLOSED SHIFT Z-REPORT SUMMARY
         ========================================== */}
      {closedSummary && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 text-slate-900 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Shift Reconciliation Z-Report
              </h3>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600" />
              <span>Print Z-Report</span>
            </button>
          </div>

          <div className="my-4 grid grid-cols-2 gap-3.5 text-xs sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
              <span className="text-slate-500 font-medium">Total Bills:</span>
              <p className="text-lg font-black font-mono text-slate-900 mt-1">
                {closedSummary.totalBillsCount || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
              <span className="text-slate-500 font-medium">Total Sales:</span>
              <p className="text-lg font-black font-mono text-blue-600 mt-1">
                ₹{closedSummary.totalSales || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
              <span className="text-slate-500 font-medium">Expected Cash:</span>
              <p className="text-lg font-black font-mono text-emerald-600 mt-1">
                ₹{closedSummary.expectedCash || 0}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
              <span className="text-slate-500 font-medium">Cash Difference:</span>
              <p
                className={`text-lg font-black font-mono mt-1 ${
                  closedSummary.cashDifference === 0
                    ? "text-emerald-600"
                    : closedSummary.cashDifference < 0
                    ? "text-rose-600"
                    : "text-blue-600"
                }`}
              >
                ₹{closedSummary.cashDifference || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}