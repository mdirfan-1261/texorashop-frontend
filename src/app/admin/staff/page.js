"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Monitor,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Edit2,
  X,
  Search,
  BadgeCheck,
  Phone,
  Mail,
  Lock,
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
  "All Counters",
];

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  pin: "",
  role: "cashier",
  assignedCounter: "Counter 1",
  permissions: {
    canGiveDiscount: false,
    canProcessRefund: false,
    canViewReports: false,
    canEditStock: false,
    canExportData: false,
  },
};

export default function StaffManagementPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

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

  // Fetch all staff
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.staff)) {
        setStaffList(data.staff);
      }
    } catch (err) {
      console.error("Failed to load staff list:", err);
      setAlert({
        type: "error",
        message: "Failed to connect to backend server.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Open Add Modal
  const openAddModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (staff) => {
    setEditingId(staff._id);
    setFormData({
      name: staff.name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      password: "",
      pin: "",
      role: staff.role || "cashier",
      assignedCounter: staff.assignedCounter || "Counter 1",
      permissions: {
        canGiveDiscount: !!staff.permissions?.canGiveDiscount,
        canProcessRefund: !!staff.permissions?.canProcessRefund,
        canViewReports: !!staff.permissions?.canViewReports,
        canEditStock: !!staff.permissions?.canEditStock,
        canExportData: !!staff.permissions?.canExportData,
      },
    });
    setModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData(INITIAL_FORM);
  };

  // Submit Add or Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setAlert(null);

    const token = getAuthToken();
    if (!token) {
      setAlert({ type: "error", message: "Admin authorization required." });
      setSubmitting(false);
      return;
    }

    const cleanPin = String(formData.pin || "").trim();
    if (!editingId && cleanPin.length !== 4) {
      setAlert({
        type: "error",
        message: "4-Digit POS PIN is required and must be exactly 4 digits.",
      });
      setSubmitting(false);
      return;
    }

    if (editingId && cleanPin && cleanPin.length !== 4) {
      setAlert({
        type: "error",
        message: "PIN must be exactly 4 digits.",
      });
      setSubmitting(false);
      return;
    }

    try {
      const url = editingId
        ? `${API_BASE}/staff/${editingId}`
        : `${API_BASE}/staff`;
      const method = editingId ? "PUT" : "POST";

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        assignedCounter: formData.assignedCounter,
        permissions: formData.permissions,
      };

      if (!editingId) {
        payload.password = formData.password;
        payload.pin = cleanPin;
      } else {
        if (formData.password) payload.password = formData.password;
        if (cleanPin) payload.pin = cleanPin;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save staff record.");
      }

      setAlert({
        type: "success",
        message: editingId
          ? "Staff member credentials updated successfully!"
          : "New cashier added successfully with Counter & 4-Digit PIN!",
      });

      closeModal();
      fetchStaff();
      setTimeout(() => setAlert(null), 5000);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Active / Deactivate
  const handleToggleStatus = async (staff) => {
    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/staff/${staff._id}/toggle-status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response");
      }

      if (!res.ok) throw new Error(data.message || "Failed to update status");

      setAlert({
        type: "success",
        message: data.message || `Staff status updated!`,
      });

      fetchStaff();
      setTimeout(() => setAlert(null), 3000);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    }
  };

  // Delete Staff
  const handleDelete = async (staff) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete staff ${staff.name}?`
      )
    )
      return;

    const token = getAuthToken();
    try {
      const res = await fetch(`${API_BASE}/staff/${staff._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAlert({
        type: "success",
        message: `Staff member ${staff.name} deleted.`,
      });
      fetchStaff();
      setTimeout(() => setAlert(null), 4000);
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    }
  };

  // Filtered List
  const filteredStaff = staffList.filter((s) => {
    const matchSearch =
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.assignedCounter?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "all" || s.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-200">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Staff & Cashiers Management
            </h1>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Control terminal counter assignments, 4-digit quick PINs, and POS authorization privileges.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.99]"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Staff / Cashier</span>
        </button>
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

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Team</p>
          <p className="mt-1.5 text-2xl font-black text-slate-900 tabular-nums">{staffList.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cashiers</p>
          <p className="mt-1.5 text-2xl font-black text-orange-600 tabular-nums">
            {staffList.filter((s) => s.role === "cashier").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Managers</p>
          <p className="mt-1.5 text-2xl font-black text-blue-600 tabular-nums">
            {staffList.filter((s) => s.role === "manager").length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Accounts</p>
          <p className="mt-1.5 text-2xl font-black text-emerald-600 tabular-nums">
            {staffList.filter((s) => s.isActive !== false).length}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/90 bg-white p-3 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or counter..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
          >
            <option value="all">All Roles</option>
            <option value="cashier">Cashier</option>
            <option value="manager">Manager</option>
            <option value="dispatch">Dispatch</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center gap-3 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="text-xs font-semibold">Loading staff records...</span>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-slate-400">
            <Users className="h-8 w-8 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">No staff members found.</p>
            <button
              onClick={openAddModal}
              className="mt-1 text-xs font-bold text-orange-600 hover:underline"
            >
              + Create First Staff / Cashier
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3">Staff / Cashier</th>
                  <th className="px-4 py-3">Assigned Counter</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">POS Quick PIN</th>
                  <th className="px-4 py-3">Permissions</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStaff.map((staff) => (
                  <tr key={staff._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Name & Contact */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{staff.name}</div>
                      <div className="text-[11px] text-slate-500">{staff.email}</div>
                      {staff.phone && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          +91 {staff.phone}
                        </div>
                      )}
                    </td>

                    {/* Counter */}
                    <td className="px-4 py-3.5">
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                        <Monitor className="h-3 w-3 text-orange-500" />
                        <span>{staff.assignedCounter || "Counter 1"}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                          staff.role === "super_admin"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : staff.role === "manager"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : staff.role === "dispatch"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {staff.role}
                      </span>
                    </td>

                    {/* PIN Indicator */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-600">
                        <KeyRound className="h-3 w-3" />
                        <span>Active (4-Digits)</span>
                      </span>
                    </td>

                    {/* Granular Permissions Badges */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {staff.permissions?.canGiveDiscount && (
                          <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[9px] font-bold text-orange-700 border border-orange-200">
                            Discount
                          </span>
                        )}
                        {staff.permissions?.canProcessRefund && (
                          <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-200">
                            Refund
                          </span>
                        )}
                        {staff.permissions?.canViewReports && (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-200">
                            Reports
                          </span>
                        )}
                        {staff.permissions?.canEditStock && (
                          <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-bold text-purple-700 border border-purple-200">
                            Stock
                          </span>
                        )}
                        {!staff.permissions?.canGiveDiscount &&
                          !staff.permissions?.canProcessRefund &&
                          !staff.permissions?.canViewReports && (
                            <span className="text-[10px] text-slate-400 font-medium">Standard</span>
                          )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(staff)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${
                          staff.isActive !== false
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {staff.isActive !== false ? (
                          <>
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-2.5 w-2.5" />
                            <span>Suspended</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(staff)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          title="Edit Staff Credentials"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {staff.role !== "super_admin" && (
                          <button
                            type="button"
                            onClick={() => handleDelete(staff)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Delete Staff"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-orange-600">
                  <Shield className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingId ? "Edit Staff / Cashier Credentials" : "Create New Staff / Cashier"}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Phone Number (10 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@texorashop.in"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    System Password {editingId ? "(Blank to keep current)" : "*"}
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Counter Assignment & 4-Digit Quick PIN */}
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Monitor className="h-3.5 w-3.5 text-orange-600" />
                    <span>Assigned POS Counter *</span>
                  </label>
                  <select
                    value={formData.assignedCounter}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedCounter: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-orange-500 focus:outline-none"
                  >
                    {COUNTER_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <KeyRound className="h-3.5 w-3.5 text-emerald-600" />
                    <span>4-Digit POS Unlock PIN {editingId ? "(Optional)" : "*"}</span>
                  </label>
                  <input
                    type="password"
                    required={!editingId}
                    maxLength={4}
                    pattern="\d{4}"
                    value={formData.pin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pin: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    placeholder="4-digit PIN (e.g. 1234)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-mono font-black tracking-widest text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  Account Role
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["cashier", "manager", "dispatch", "super_admin"].map((role) => (
                    <button
                      type="button"
                      key={role}
                      onClick={() => setFormData({ ...formData, role })}
                      className={`rounded-xl border py-2 text-xs font-bold capitalize transition-all ${
                        formData.role === role
                          ? "border-orange-500 bg-orange-50 text-orange-600 shadow-xs"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      {role.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular POS Authorizations */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                <p className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  Granular POS Privileges
                </p>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canGiveDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            canGiveDiscount: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300 text-orange-500 focus:ring-0"
                    />
                    <span>Can Apply Discount</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canProcessRefund}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            canProcessRefund: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300 text-orange-500 focus:ring-0"
                    />
                    <span>Can Process Refunds</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canEditStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            canEditStock: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300 text-orange-500 focus:ring-0"
                    />
                    <span>Can Edit Stock Inventory</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    <input
                      type="checkbox"
                      checked={formData.permissions.canViewReports}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            canViewReports: e.target.checked,
                          },
                        })
                      }
                      className="rounded border-slate-300 text-orange-500 focus:ring-0"
                    />
                    <span>Can View Daily Shift Reports</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingId ? "Update Staff" : "Create Staff"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}