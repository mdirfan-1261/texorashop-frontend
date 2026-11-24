"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Monitor,
  Search,
  Plus,
  Minus,
  Trash2,
  Lock,
  Unlock,
  KeyRound,
  Printer,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  IndianRupee,
  CreditCard,
  QrCode,
  Banknote,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  User,
  Phone,
  Clock,
  ArrowRight,
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

export default function PosBillingPage() {
  // Cashier Session State
  const [activeStaff, setActiveStaff] = useState(null);
  const [currentCounter, setCurrentCounter] = useState("Counter 1");
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  // Catalog & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Cart & Billing State
  const [cart, setCart] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [cashTendered, setCashTendered] = useState("");
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [billingLoading, setBillingLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Completed Bill Modal State
  const [completedOrder, setCompletedOrder] = useState(null);
  const [storeUpi, setStoreUpi] = useState("");

  const searchInputRef = useRef(null);

  // 1. Check existing session on mount
  useEffect(() => {
    try {
      const storedPos = localStorage.getItem("texora_pos_session");
      if (storedPos) {
        const parsed = JSON.parse(storedPos);
        if (parsed.staff && parsed.token) {
          setActiveStaff(parsed.staff);
          setCurrentCounter(parsed.staff.assignedCounter || "Counter 1");
          setIsLocked(false);
        }
      } else {
        // Fallback: Check if super admin is logged in
        const storedAdmin = localStorage.getItem("texora_admin");
        if (storedAdmin) {
          const parsedAdmin = JSON.parse(storedAdmin);
          if (parsedAdmin.user && parsedAdmin.role === "admin") {
            setActiveStaff({
              name: parsedAdmin.user.name || "Super Admin",
              role: "super_admin",
              assignedCounter: "Counter 1",
              permissions: { canGiveDiscount: true },
            });
            setIsLocked(false);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Fetch store UPI ID for QR code
    fetch(`${API_BASE}/organization`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.organization?.bankDetails?.upiId) {
          setStoreUpi(data.organization.bankDetails.upiId);
        }
      })
      .catch(() => {});
  }, []);

  // Helper to extract active auth token
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

  // 2. Fetch Products
  const fetchProducts = async (q = "", cat = "all") => {
    try {
      setSearching(true);
      const token = getAuthToken();
      if (!token) return;

      const url = `${API_BASE}/pos/products?query=${encodeURIComponent(
        q
      )}&category=${encodeURIComponent(cat === "all" ? "" : cat)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("POS Search Error:", err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (!isLocked) {
      fetchProducts(searchQuery, selectedCategory);
    }
  }, [isLocked, selectedCategory]);

  // Handle Search Input Debounce
  useEffect(() => {
    if (isLocked) return;
    const timer = setTimeout(() => {
      fetchProducts(searchQuery, selectedCategory);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 3. Unlock with 4-Digit Quick PIN
  const handlePinUnlock = async (digit = null) => {
    let pinToTry = pinInput;
    if (digit !== null) {
      if (pinInput.length >= 4) return;
      pinToTry = pinInput + digit;
      setPinInput(pinToTry);
    }

    if (pinToTry.length !== 4) return;

    setPinLoading(true);
    setPinError("");

    try {
      const res = await fetch(`${API_BASE}/staff/login-pin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pin: pinToTry,
          counterName: currentCounter,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid 4-digit PIN");
      }

      localStorage.setItem("texora_pos_session", JSON.stringify(data));
      setActiveStaff(data.staff);
      setIsLocked(false);
      setPinInput("");
    } catch (err) {
      setPinError(err.message);
      setPinInput("");
    } finally {
      setPinLoading(false);
    }
  };

  // Lock Terminal
  const handleLockTerminal = () => {
    localStorage.removeItem("texora_pos_session");
    setIsLocked(true);
    setPinInput("");
    setPinError("");
  };

  // 4. Cart Operations
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          _id: product._id,
          name: product.title || product.name,
          price: Number(product.price) || 0,
          image: product.images?.[0] || product.image || "",
          qty: 1,
          slug: product.slug,
          stock: product.stock || 0,
        },
      ];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setCashTendered("");
    setCustomerPhone("");
    setCustomerName("Walk-in Customer");
  };

  // 5. Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalPayable = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const changeDue =
    paymentMethod === "Cash" && cashTendered
      ? Math.max(0, Number(cashTendered) - totalPayable)
      : 0;

  // 6. Complete Bill & Checkout
  const handleCheckout = async () => {
    if (!cart.length) {
      setAlert({ type: "error", message: "Cart is empty. Add products to bill." });
      return;
    }

    if (paymentMethod === "Cash" && cashTendered && Number(cashTendered) < totalPayable) {
      setAlert({
        type: "error",
        message: `Cash tendered (₹${cashTendered}) is less than Total (₹${totalPayable})`,
      });
      return;
    }

    setBillingLoading(true);
    setAlert(null);

    const token = getAuthToken();
    try {
      const payload = {
        customerName: customerName.trim() || "Walk-in Customer",
        phone: customerPhone.trim() || "9999999999",
        items: cart,
        paymentMethod,
        discount: Number(discountAmount) || 0,
        counterName: currentCounter,
      };

      const res = await fetch(`${API_BASE}/pos/bill`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to process POS bill.");
      }

      setCompletedOrder({
        ...data.order,
        cashTendered: Number(cashTendered) || totalPayable,
        changeDue,
        counter: currentCounter,
        cashier: activeStaff?.name || "Cashier",
      });

      clearCart();
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    } finally {
      setBillingLoading(false);
    }
  };

  // ==========================================
  // VIEW 1: 4-DIGIT QUICK PIN UNLOCK SCREEN (LIGHT THEME)
  // ==========================================
  if (isLocked) {
    return (
      <div className="flex min-h-[82vh] items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200/90 bg-white p-7 text-center shadow-2xl shadow-slate-200/50">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-200">
            <Lock className="h-7 w-7" />
          </div>

          <h2 className="mt-4 text-xl font-black text-slate-900 tracking-tight">
            Terminal Locked
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Enter 4-Digit Cashier PIN to unlock counter
          </p>

          {/* Counter Switcher */}
          <div className="mt-5">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1 text-left">
              Select Terminal Counter
            </label>
            <select
              value={currentCounter}
              onChange={(e) => setCurrentCounter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
            >
              {COUNTER_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 4-Digit Dots Indicator */}
          <div className="my-6 flex justify-center gap-3">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full border transition-all ${
                  pinInput.length > idx
                    ? "border-orange-500 bg-orange-500 shadow-sm shadow-orange-500/50 scale-110"
                    : "border-slate-200 bg-slate-100"
                }`}
              />
            ))}
          </div>

          {pinError && (
            <p className="mb-4 text-xs font-bold text-rose-600 animate-shake">
              {pinError}
            </p>
          )}

          {/* Touch / Click Keypad */}
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handlePinUnlock(digit)}
                disabled={pinLoading}
                className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-base font-extrabold text-slate-800 transition-all active:scale-95 hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-600 shadow-2xs"
              >
                {digit}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setPinInput("");
                setPinError("");
              }}
              className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => handlePinUnlock(0)}
              disabled={pinLoading}
              className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-base font-extrabold text-slate-800 transition-all active:scale-95 hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-600 shadow-2xs"
            >
              0
            </button>

            <button
              type="button"
              onClick={() => handlePinUnlock()}
              disabled={pinLoading || pinInput.length !== 4}
              className="flex h-12 items-center justify-center rounded-2xl bg-orange-500 text-xs font-bold text-white transition-all active:scale-95 hover:bg-orange-600 shadow-sm shadow-orange-500/30 disabled:opacity-40"
            >
              {pinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-3.5">
            <Link
              href="/admin"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ACTIVE POS FAST BILLING TERMINAL (LIGHT THEME)
  // ==========================================
  return (
    <div className="space-y-4 pb-12">
      {/* Top Counter Header */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm shadow-orange-500/30">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">{currentCounter}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Terminal Online
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Cashier: <span className="font-bold text-slate-900">{activeStaff?.name || "Cashier"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Shift Link */}
          <Link
            href="/admin/pos/shift"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <Banknote className="h-3.5 w-3.5 text-emerald-600" />
            <span>Shift Cash Drawer</span>
          </Link>

          {/* Lock Terminal Button */}
          <button
            type="button"
            onClick={handleLockTerminal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-2xs"
          >
            <Lock className="h-3.5 w-3.5 text-orange-500" />
            <span>Lock Counter</span>
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div
          className={`flex items-center gap-2 rounded-2xl border p-3.5 text-xs font-semibold shadow-xs ${
            alert.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Main Split Grid: Left Catalog | Right Billing Cart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT: Fast Product Search & Grid (7 Columns) */}
        <div className="space-y-3 lg:col-span-7">
          {/* Search Input Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product title, brand, or scan barcode..."
              className="w-full rounded-2xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 shadow-xs"
            />
            {searching && (
              <Loader2 className="absolute right-3.5 top-3 h-4 w-4 animate-spin text-orange-500" />
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              "all",
              "fashion",
              "mobiles",
              "electronics",
              "footwear",
              "bags",
              "beauty",
              "kids",
              "grocery",
            ].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[11px] font-bold capitalize transition-all ${
                  selectedCategory === cat
                    ? "bg-orange-500 text-white shadow-xs shadow-orange-500/25"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 shadow-2xs"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Items Grid */}
          <div className="max-h-[620px] overflow-y-auto pr-1">
            {products.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white p-6 text-center text-slate-400 shadow-xs">
                <ShoppingBag className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">No products found for counter.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Type product title or scan product barcode.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {products.map((p) => {
                  const inStock = (p.stock || 0) > 0;
                  return (
                    <div
                      key={p._id}
                      onClick={() => inStock && addToCart(p)}
                      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-2.5 transition-all cursor-pointer shadow-xs ${
                        inStock
                          ? "hover:border-orange-300 hover:shadow-md"
                          : "opacity-50 cursor-not-allowed bg-slate-50"
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100">
                        {p.images?.[0] || p.image ? (
                          <Image
                            src={p.images?.[0] || p.image}
                            alt={p.title || p.name}
                            fill
                            sizes="180px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-slate-400">
                            <ShoppingBag className="h-6 w-6" />
                          </div>
                        )}
                        <span
                          className={`absolute right-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[9px] font-black ${
                            inStock
                              ? "bg-emerald-600 text-white shadow-2xs"
                              : "bg-rose-500 text-white"
                          }`}
                        >
                          {inStock ? `Stock: ${p.stock}` : "Sold Out"}
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <p className="line-clamp-1 text-xs font-bold text-slate-900">
                          {p.title || p.name}
                        </p>
                        <div className="mt-1 flex items-baseline justify-between">
                          <span className="font-mono text-sm font-black text-slate-900">
                            ₹{p.price}
                          </span>
                          {p.mrp > p.price && (
                            <span className="font-mono text-[11px] text-slate-400 line-through">
                              ₹{p.mrp}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!inStock}
                        className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-xl bg-slate-50 py-1.5 text-[11px] font-bold text-slate-700 transition-colors group-hover:bg-orange-500 group-hover:text-white border border-slate-200 group-hover:border-orange-500"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Fast Checkout Cart & Tender (5 Columns) */}
        <div className="space-y-3 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-orange-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Active Bill Items ({cart.length})
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 my-2">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-xs font-semibold text-slate-600">Cart is currently empty.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    Click items on left to add to bill.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex items-center justify-between py-2.5 text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="line-clamp-1 font-bold text-slate-900">{item.name}</p>
                      <p className="font-mono text-[11px] text-slate-500">
                        ₹{item.price} each
                      </p>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQty(item._id, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center font-mono font-bold text-slate-900 text-xs">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item._id, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="w-16 text-right font-mono font-black text-slate-900 text-xs pl-2">
                      ₹{item.price * item.qty}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item._id)}
                      className="ml-2 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Customer Contact Details */}
            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] font-bold text-slate-600">
                    Customer Mobile (WhatsApp Receipt)
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <div>
                  <label className="mb-0.5 block text-[10px] font-bold text-slate-600">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Discount Input */}
              {activeStaff?.permissions?.canGiveDiscount !== false && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-600">Manual Discount (₹):</span>
                  <input
                    type="number"
                    min={0}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    className="w-24 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-right text-xs font-mono font-bold text-slate-900 focus:border-orange-500 focus:bg-white focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="mt-3.5 border-t border-slate-100 pt-3">
              <label className="mb-1.5 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Cash", icon: Banknote },
                  { id: "UPI / QR", icon: QrCode },
                  { id: "Card", icon: CreditCard },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMethod(mode.id)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold transition-all ${
                      paymentMethod === mode.id
                        ? "border-orange-500 bg-orange-500 text-white shadow-xs shadow-orange-500/25"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <mode.icon className="h-3.5 w-3.5" />
                    <span>{mode.id}</span>
                  </button>
                ))}
              </div>

              {/* Cash Tendered Calculator */}
              {paymentMethod === "Cash" && (
                <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-900">Cash Received From Customer:</span>
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder={`₹${totalPayable}`}
                      className="w-28 rounded-xl border border-emerald-200 bg-white px-2.5 py-1 text-right text-xs font-mono font-black text-emerald-700 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  {cashTendered && Number(cashTendered) >= totalPayable && (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-100/80 px-2.5 py-1.5 text-xs font-bold text-emerald-800">
                      <span>Change to Return:</span>
                      <span className="font-mono text-sm font-black">₹{changeDue}</span>
                    </div>
                  )}
                </div>
              )}

              {/* UPI Instant QR Prompt */}
              {paymentMethod === "UPI / QR" && storeUpi && (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center text-xs">
                  <p className="text-slate-500 font-medium">Direct Store VPA:</p>
                  <p className="font-mono font-bold text-orange-600 mt-0.5">{storeUpi}</p>
                </div>
              )}
            </div>

            {/* Bill Summary Totals */}
            <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal ({cart.length} items):</span>
                <span className="font-mono font-bold text-slate-900">₹{subtotal}</span>
              </div>
              {Number(discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-slate-100 pt-2.5 text-base font-black text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-xl font-black text-orange-600">
                  ₹{totalPayable}
                </span>
              </div>
            </div>

            {/* 1-Click Charge Bill Button */}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={billingLoading || cart.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 py-3 text-sm font-black text-white shadow-md shadow-orange-500/25 transition-all hover:bg-orange-600 active:scale-[0.99] disabled:opacity-40"
            >
              {billingLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Tax Invoice...</span>
                </>
              ) : (
                <>
                  <IndianRupee className="h-4 w-4" />
                  <span>Charge & Print Bill (₹{totalPayable})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          POST-BILLING SUCCESS MODAL & RECEIPT
         ========================================== */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-3 text-lg font-black tracking-tight text-slate-900">
                Payment Successful!
              </h3>
              <p className="font-mono text-xs text-orange-600 font-bold mt-0.5">
                Order #{completedOrder._id?.slice(-8).toUpperCase()}
              </p>
            </div>

            {/* Order Brief */}
            <div className="my-4 space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Customer:</span>
                <span className="font-bold text-slate-900">
                  {completedOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Mode:</span>
                <span className="font-bold text-slate-900">
                  {completedOrder.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Terminal / Cashier:</span>
                <span className="font-bold text-slate-900">
                  {completedOrder.counter} ({completedOrder.cashier})
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-bold">
                <span className="text-slate-700">Total Paid:</span>
                <span className="font-mono text-emerald-700 text-sm font-black">
                  ₹{completedOrder.totalPrice}
                </span>
              </div>
              {completedOrder.changeDue > 0 && (
                <div className="flex justify-between text-xs text-amber-700 font-bold">
                  <span>Change Given:</span>
                  <span className="font-mono font-black">₹{completedOrder.changeDue}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {/* Print Receipt Slip */}
                <Link
                  href={`/invoice/${completedOrder._id}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors shadow-2xs"
                >
                  <Printer className="h-4 w-4 text-orange-600" />
                  <span>GST Tax Invoice</span>
                </Link>

                {/* WhatsApp Receipt Link */}
                <a
                  href={`https://wa.me/91${completedOrder.phone}?text=${encodeURIComponent(
                    `Namaste ${completedOrder.customerName}! 🙏 Thank you for shopping with TexoraShop.\n\nYour In-Store Bill #${completedOrder._id?.slice(-8).toUpperCase()} for ₹${completedOrder.totalPrice} is generated successfully.\nView your GST Invoice here: ${window.location.origin}/invoice/${completedOrder._id}\n\nHave a great day!`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-2xs"
                >
                  <MessageSquare className="h-4 w-4 fill-current" />
                  <span>WhatsApp Bill</span>
                </a>
              </div>

              {/* Next Sale Button */}
              <button
                type="button"
                onClick={() => setCompletedOrder(null)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-3 text-xs font-black text-white shadow-sm shadow-orange-500/25 hover:bg-orange-600 transition-colors active:scale-[0.99]"
              >
                <span>Start Next Customer Sale</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}