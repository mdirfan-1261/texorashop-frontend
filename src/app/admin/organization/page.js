"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Landmark,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Share2,
  Sparkles,
} from "lucide-react";

// Safe API URL handler (Prevents duplicate /api/api)
const rawBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const API_BASE = rawBase.endsWith("/api") ? rawBase : `${rawBase}/api`;

export default function OrganizationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);

  const [org, setOrg] = useState({
    legalName: "",
    tradeName: "",
    cin: "",
    gstin: "",
    pan: "",
    stateCode: "",
    stateName: "",
    registeredAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    warehouseAddress: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
    },
    supportPhone: "",
    supportEmail: "",
    workingHours: "",
    grievanceOfficer: {
      name: "",
      email: "",
      phone: "",
    },
    bankDetails: {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      branchName: "",
      upiId: "",
    },
    logoUrl: "",
    websiteUrl: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      youtube: "",
      twitter: "",
    },
  });

  // Helper to extract JWT token
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

  // Fetch current Organization settings
  useEffect(() => {
    const fetchOrg = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/organization`);

        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }

        const data = await res.json();
        if (data.success && data.organization) {
          setOrg((prev) => ({
            ...prev,
            ...data.organization,
            registeredAddress: {
              ...prev.registeredAddress,
              ...(data.organization.registeredAddress || {}),
            },
            warehouseAddress: {
              ...prev.warehouseAddress,
              ...(data.organization.warehouseAddress || {}),
            },
            grievanceOfficer: {
              ...prev.grievanceOfficer,
              ...(data.organization.grievanceOfficer || {}),
            },
            bankDetails: {
              ...prev.bankDetails,
              ...(data.organization.bankDetails || {}),
            },
            socialLinks: {
              ...prev.socialLinks,
              ...(data.organization.socialLinks || {}),
            },
          }));
        }
      } catch (err) {
        console.error("Failed to load organization profile:", err);
        setAlert({
          type: "error",
          message:
            "Could not fetch profile. Please make sure backend is running on http://localhost:5000",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrg();
  }, []);

  // Save changes to backend
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setAlert(null);

    const token = getAuthToken();
    if (!token) {
      setAlert({
        type: "error",
        message: "Authentication token missing. Please login as Admin first.",
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/organization`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(org),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response received from server.");
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      setAlert({
        type: "success",
        message:
          "Organization profile updated successfully! All business details saved to database.",
      });

      setTimeout(() => setAlert(null), 5000);
    } catch (err) {
      setAlert({
        type: "error",
        message: err.message || "An error occurred while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-xs font-bold">Loading Organization Profile...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-50 text-orange-600 ring-1 ring-orange-200">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Organization & Legal Profile
              </h1>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Manage your registered company details, GSTIN, PAN, bank settlement, and retail addresses.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save Organization Profile</span>
            </>
          )}
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: Legal Entity & Tax Registrations */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-orange-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                1. Legal Entity & Tax Registrations
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Mandatory company tax identifiers for GST invoicing and legal compliance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Legal Company Name *
              </label>
              <input
                type="text"
                required
                value={org.legalName}
                onChange={(e) => setOrg({ ...org, legalName: e.target.value })}
                placeholder="e.g. Texora Retail Private Limited"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Trade / Brand Name *
              </label>
              <input
                type="text"
                required
                value={org.tradeName}
                onChange={(e) => setOrg({ ...org, tradeName: e.target.value })}
                placeholder="e.g. TexoraShop"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                GSTIN Number (15 Digits)
              </label>
              <input
                type="text"
                maxLength={15}
                value={org.gstin}
                onChange={(e) => setOrg({ ...org, gstin: e.target.value.toUpperCase() })}
                placeholder="07AABCT1332M1ZQ"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 uppercase"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                PAN Card Number (10 Digits)
              </label>
              <input
                type="text"
                maxLength={10}
                value={org.pan}
                onChange={(e) => setOrg({ ...org, pan: e.target.value.toUpperCase() })}
                placeholder="AABCT1332M"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 uppercase"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                CIN (Corporate Identification No.)
              </label>
              <input
                type="text"
                value={org.cin}
                onChange={(e) => setOrg({ ...org, cin: e.target.value.toUpperCase() })}
                placeholder="U52590DL2026PTC123456"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 uppercase"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                State Code & State Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={2}
                  value={org.stateCode}
                  onChange={(e) => setOrg({ ...org, stateCode: e.target.value })}
                  placeholder="07"
                  className="w-16 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2.5 text-center text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
                <input
                  type="text"
                  value={org.stateName}
                  onChange={(e) => setOrg({ ...org, stateName: e.target.value })}
                  placeholder="e.g. Delhi"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Addresses */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Registered Office */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-orange-600">
                <MapPin className="h-4 w-4" />
              </div>
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                2. Registered Head Office
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Street / Building / Area
                </label>
                <input
                  type="text"
                  value={org.registeredAddress.street}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      registeredAddress: {
                        ...org.registeredAddress,
                        street: e.target.value,
                      },
                    })
                  }
                  placeholder="Street / Unit / Building"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={org.registeredAddress.city}
                    onChange={(e) =>
                      setOrg({
                        ...org,
                        registeredAddress: {
                          ...org.registeredAddress,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="City"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={org.registeredAddress.state}
                    onChange={(e) =>
                      setOrg({
                        ...org,
                        registeredAddress: {
                          ...org.registeredAddress,
                          state: e.target.value,
                        },
                      })
                    }
                    placeholder="State"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={org.registeredAddress.pincode}
                    onChange={(e) =>
                      setOrg({
                        ...org,
                        registeredAddress: {
                          ...org.registeredAddress,
                          pincode: e.target.value,
                        },
                      })
                    }
                    placeholder="110001"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Warehouse / Dispatch Hub */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  3. Warehouse / Dispatch Center
                </h2>
              </div>
              <button
                type="button"
                onClick={() =>
                  setOrg({
                    ...org,
                    warehouseAddress: { ...org.registeredAddress },
                  })
                }
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Same as Registered
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  Street / Warehouse Unit
                </label>
                <input
                  type="text"
                  value={org.warehouseAddress.street}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      warehouseAddress: {
                        ...org.warehouseAddress,
                        street: e.target.value,
                      },
                    })
                  }
                  placeholder="Warehouse address"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={org.warehouseAddress.city}
                    onChange={(e) =>
                      setOrg({
                        ...org,
                        warehouseAddress: {
                          ...org.warehouseAddress,
                          city: e.target.value,
                        },
                      })
                    }
                    placeholder="City"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">State</label>
                  <input
                    type="text"
                    value={org.warehouseAddress.state}
                    onChange={(e) =>
                      setOrg({
                        ...org,
                        warehouseAddress: {
                          ...org.warehouseAddress,
                          state: e.target.value,
                        },
                      })
                    }
                    placeholder="State"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={org.warehouseAddress.pincode}
                    onChange={(e) =>
                      setOrg({
                        ...org,
                        warehouseAddress: {
                          ...org.warehouseAddress,
                          pincode: e.target.value,
                        },
                      })
                    }
                    placeholder="110001"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Support, Grievance & Working Hours */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-orange-600">
              <Phone className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              4. Customer Support & Grievance Redressal
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Support Helpline Phone
              </label>
              <input
                type="text"
                value={org.supportPhone}
                onChange={(e) => setOrg({ ...org, supportPhone: e.target.value })}
                placeholder="+91 9696511261"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Support Email
              </label>
              <input
                type="email"
                value={org.supportEmail}
                onChange={(e) => setOrg({ ...org, supportEmail: e.target.value })}
                placeholder="support@texorashop.in"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Operating / Working Hours
              </label>
              <input
                type="text"
                value={org.workingHours}
                onChange={(e) => setOrg({ ...org, workingHours: e.target.value })}
                placeholder="Mon - Sat: 9:00 AM - 8:00 PM"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Grievance Officer details */}
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-bold text-slate-800">
                Consumer Grievance Officer (Indian E-Commerce Rules Mandatory)
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">Officer Name</label>
                <input
                  type="text"
                  value={org.grievanceOfficer.name}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      grievanceOfficer: { ...org.grievanceOfficer, name: e.target.value },
                    })
                  }
                  placeholder="Officer Name"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">Officer Email</label>
                <input
                  type="email"
                  value={org.grievanceOfficer.email}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      grievanceOfficer: { ...org.grievanceOfficer, email: e.target.value },
                    })
                  }
                  placeholder="grievance@texorashop.in"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-600">Officer Contact</label>
                <input
                  type="text"
                  value={org.grievanceOfficer.phone}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      grievanceOfficer: { ...org.grievanceOfficer, phone: e.target.value },
                    })
                  }
                  placeholder="Phone Number"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Bank & Settlement Account */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <Landmark className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              5. Official Bank & Settlement Account
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Bank Name
              </label>
              <input
                type="text"
                value={org.bankDetails.bankName}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    bankDetails: { ...org.bankDetails, bankName: e.target.value },
                  })
                }
                placeholder="e.g. HDFC Bank / State Bank of India"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Account Holder Name
              </label>
              <input
                type="text"
                value={org.bankDetails.accountHolderName}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    bankDetails: {
                      ...org.bankDetails,
                      accountHolderName: e.target.value,
                    },
                  })
                }
                placeholder="Texora Retail Private Limited"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Bank Account Number
              </label>
              <input
                type="text"
                value={org.bankDetails.accountNumber}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    bankDetails: {
                      ...org.bankDetails,
                      accountNumber: e.target.value,
                    },
                  })
                }
                placeholder="e.g. 50200088991122"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                IFSC Code (11 Digits)
              </label>
              <input
                type="text"
                maxLength={11}
                value={org.bankDetails.ifscCode}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    bankDetails: {
                      ...org.bankDetails,
                      ifscCode: e.target.value.toUpperCase(),
                    },
                  })
                }
                placeholder="HDFC0001234"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold tracking-wider text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 uppercase"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Branch Name
              </label>
              <input
                type="text"
                value={org.bankDetails.branchName}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    bankDetails: { ...org.bankDetails, branchName: e.target.value },
                  })
                }
                placeholder="Connaught Place, New Delhi"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Store UPI ID / VPA (For Direct POS QR)
              </label>
              <input
                type="text"
                value={org.bankDetails.upiId}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    bankDetails: { ...org.bankDetails, upiId: e.target.value.toLowerCase() },
                  })
                }
                placeholder="texorashop@okhdfcbank"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100 lowercase"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Branding & Social Handles */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:shadow-md transition-shadow">
          <div className="mb-5 flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-orange-600">
              <Share2 className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              6. Brand Identity & Social Handles
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Instagram URL / Handle
              </label>
              <input
                type="text"
                value={org.socialLinks.instagram}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    socialLinks: { ...org.socialLinks, instagram: e.target.value },
                  })
                }
                placeholder="https://instagram.com/texorashop"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Facebook URL
              </label>
              <input
                type="text"
                value={org.socialLinks.facebook}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    socialLinks: { ...org.socialLinks, facebook: e.target.value },
                  })
                }
                placeholder="https://facebook.com/texorashop"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                YouTube URL
              </label>
              <input
                type="text"
                value={org.socialLinks.youtube}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    socialLinks: { ...org.socialLinks, youtube: e.target.value },
                  })
                }
                placeholder="https://youtube.com/@texorashop"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                X / Twitter URL
              </label>
              <input
                type="text"
                value={org.socialLinks.twitter}
                onChange={(e) =>
                  setOrg({
                    ...org,
                    socialLinks: { ...org.socialLinks, twitter: e.target.value },
                  })
                }
                placeholder="https://x.com/texorashop"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-sm shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Organization Profile</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}