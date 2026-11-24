"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Monitor,
  User,
  Clock,
  Receipt,
  KeyRound,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Building2,
  Lock,
} from "lucide-react";

// Safe API URL handler (Prevents duplicate /api/api)
const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

const ACTION_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "POS_BILL_CREATED", label: "Bills Created (POS)" },
  { value: "POS_PIN_LOGIN", label: "PIN Terminal Logins" },
  { value: "SHIFT_OPENED", label: "Shift Opened" },
  { value: "SHIFT_CLOSED", label: "Shift Closed & Tally" },
  { value: "STAFF_CREATED", label: "Staff Created" },
  { value: "STAFF_UPDATED", label: "Staff Updated" },
  { value: "STAFF_ACTIVATED", label: "Staff Activated" },
  { value: "STAFF_DEACTIVATED", label: "Staff Suspended" },
  { value: "ORGANIZATION_UPDATED", label: "Organization Legal Updated" },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ todayActions: 0, todayBills: 0, todayLogins: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState(null);

  // Filters & Pagination
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedCounter, setSelectedCounter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const getAuthToken = () => {
    try {
      const stored = localStorage.getItem("texora_admin");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed.token || stored;
    } catch {
      return localStorage.getItem("texora_admin");
    }
  };

  // Fetch Audit Logs with filters
  const fetchLogs = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const token = getAuthToken();
      if (!token) {
        setAlert("Admin authorization required. Please login.");
        return;
      }

      const params = new URLSearchParams({
        page: String(page),
        limit: "30",
        action: selectedAction,
        actorRole: selectedRole,
        counterName: selectedCounter,
      });

      const [logsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/audit?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/audit/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const logsData = await logsRes.json();
      if (logsData.success && Array.isArray(logsData.logs)) {
        setLogs(logsData.logs);
        setTotalPages(logsData.totalPages || 1);
        setTotalCount(logsData.totalCount || 0);
      }

      const statsData = await statsRes.json();
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error("Audit log error:", err);
      setAlert("Failed to fetch audit log trail.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, selectedAction, selectedRole, selectedCounter]);

  // Action Badge Helper
  const getActionBadge = (action) => {
    switch (action) {
      case "POS_BILL_CREATED":
        return {
          label: "Bill Punched",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: Receipt,
        };
      case "POS_PIN_LOGIN":
        return {
          label: "PIN Unlock",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: KeyRound,
        };
      case "SHIFT_OPENED":
        return {
          label: "Shift Open",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Clock,
        };
      case "SHIFT_CLOSED":
        return {
          label: "Shift Tally",
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: Lock,
        };
      case "STAFF_CREATED":
      case "STAFF_UPDATED":
        return {
          label: "Staff Modified",
          bg: "bg-orange-50 text-orange-700 border-orange-200",
          icon: User,
        };
      case "STAFF_ACTIVATED":
        return {
          label: "Staff Active",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: ShieldCheck,
        };
      case "STAFF_DEACTIVATED":
        return {
          label: "Staff Suspended",
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: ShieldAlert,
        };
      case "ORGANIZATION_UPDATED":
        return {
          label: "Legal Updated",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: Building2,
        };
      default:
        return {
          label: action,
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          icon: FileText,
        };
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-200">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Security Audit Trail & Activity Logs
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Immutable activity log tracking staff actions, terminal logins, bill generations, and drawer tallies.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs(true)}
          disabled={refreshing}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all active:scale-[0.99]"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-orange-500 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">{alert}</div>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Total Events</p>
          <p className="mt-1.5 text-2xl font-black text-slate-900 tabular-nums">
            {stats.todayActions || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Logged security events</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">POS Bills Today</p>
          <p className="mt-1.5 text-2xl font-black text-emerald-600 tabular-nums">
            {stats.todayBills || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">In-store walk-in sales</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Terminal PIN Logins</p>
          <p className="mt-1.5 text-2xl font-black text-blue-600 tabular-nums">
            {stats.todayLogins || 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Cashier desktop unlocks</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Security State</p>
          <div className="mt-2 flex items-center gap-1.5 text-emerald-700 font-black text-sm">
            <ShieldCheck className="h-4 w-4" />
            <span>All Systems Normal</span>
          </div>
          <p className="text-[10px] text-emerald-700/80 mt-1 font-semibold">Real-time fraud prevention</p>
        </div>
      </div>

      {/* Filter Selector Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Action Filter */}
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="manager">Manager</option>
            <option value="cashier">Cashier</option>
            <option value="dispatch">Dispatch</option>
          </select>

          {/* Counter Filter */}
          <select
            value={selectedCounter}
            onChange={(e) => {
              setSelectedCounter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none"
          >
            <option value="all">All Counters</option>
            <option value="Counter 1">Counter 1</option>
            <option value="Counter 2">Counter 2</option>
            <option value="Counter 3">Counter 3</option>
            <option value="Counter 4">Counter 4</option>
            <option value="Counter 5">Counter 5</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-slate-900">{logs.length}</span> of {totalCount} records
        </span>
      </div>

      {/* Audit Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="text-xs font-semibold">Loading security trail...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-slate-400">
            <FileText className="h-8 w-8 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No activity logs recorded yet.</p>
            <p className="text-[11px] text-slate-400">
              Actions taken on POS counters or staff will automatically show here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Staff / Actor</th>
                  <th className="px-4 py-3">Counter</th>
                  <th className="px-4 py-3">Action Event</th>
                  <th className="px-4 py-3">Details & Parameters</th>
                  <th className="px-4 py-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const Icon = badge.icon;
                  const dateObj = new Date(log.createdAt);

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">
                          {dateObj.toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {dateObj.toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })}
                        </div>
                      </td>

                      {/* Staff Actor */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{log.actorName}</div>
                        <span
                          className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider mt-0.5 ${
                            log.actorRole === "super_admin" || log.actorRole === "admin"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : log.actorRole === "manager"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {log.actorRole}
                        </span>
                      </td>

                      {/* Counter */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                          <Monitor className="h-3 w-3 text-orange-500" />
                          <span>{log.counterName || "System"}</span>
                        </span>
                      </td>

                      {/* Action Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${badge.bg}`}
                        >
                          <Icon className="h-3 w-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Details Description */}
                      <td className="px-4 py-3.5 max-w-md">
                        <p className="text-xs font-semibold text-slate-900 leading-snug">
                          {log.details}
                        </p>
                        {log.targetEntity && (
                          <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">
                            Target: {log.targetEntity} {log.targetId ? `(#${log.targetId.slice(-6)})` : ""}
                          </span>
                        )}
                      </td>

                      {/* IP Address */}
                      <td className="px-4 py-3.5 text-right font-mono text-[11px] text-slate-400 whitespace-nowrap">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-3 text-xs">
            <span className="text-slate-500">
              Page <span className="font-bold text-slate-900">{page}</span> of {totalPages}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}