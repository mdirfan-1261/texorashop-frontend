"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowLeft, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";

import CartAddressBar from "@/components/cart/CartAddressBar";
import AddressSelectModal from "@/components/cart/AddressSelectModal";
import CartItemCard from "@/components/cart/CartItemCard";
import PriceDetailsSidebar from "@/components/cart/PriceDetailsSidebar";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalCount } = useCart();
  const { user, isLoggedIn, openAuthModal, refreshProfile, updateUserAddresses } = useUser();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [storeSettings, setStoreSettings] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      deliveryFee: 40,
      freeDeliveryMinOrder: 499,
      isFreeDeliveryActive: true,
      returnWindowDays: 7,
      badge3Label: "7 Days Return",
    };
  });

  useEffect(() => {
    function readLocal() {
      try {
        const saved = localStorage.getItem("texora_store_settings");
        if (saved) setStoreSettings(JSON.parse(saved));
      } catch (e) {}
    }

    async function loadSettings() {
      try {
        const res = await fetch("http://localhost:5000/api/settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && data._id) {
            setStoreSettings(data);
            localStorage.setItem("texora_store_settings", JSON.stringify(data));
            return;
          }
        }
      } catch (e) {}

      readLocal();
    }

    readLocal();
    loadSettings();

    window.addEventListener("texora_settings_updated", readLocal);
    window.addEventListener("storage", readLocal);
    return () => {
      window.removeEventListener("texora_settings_updated", readLocal);
      window.removeEventListener("storage", readLocal);
    };
  }, []);

  useEffect(() => {
    if (user?.savedAddresses && user.savedAddresses.length > 0) {
      const def = user.savedAddresses.find((a) => a.isDefault) || user.savedAddresses[0];
      setSelectedAddress(def);
    } else {
      setSelectedAddress(null);
    }
  }, [user]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  // Dynamic Delivery Fee Calculation
  const isFreeDelivery =
    storeSettings.isFreeDeliveryActive &&
    (storeSettings.freeDeliveryMinOrder <= 0 || subtotal >= storeSettings.freeDeliveryMinOrder);

  const appliedDeliveryFee = isFreeDelivery ? 0 : Number(storeSettings.deliveryFee || 0);

  // Smart Coupon Discount Calculator
  const calculateCouponDiscount = () => {
    if (!appliedCoupon) return 0;
    if (subtotal < (Number(appliedCoupon.minOrder) || 0)) return 0;

    const benefitStr = String(appliedCoupon.discount || "");
    const numMatch = benefitStr.match(/(\d+)/);
    if (!numMatch) return 0;
    const val = Number(numMatch[1]);

    if (benefitStr.includes("%")) {
      return Math.round((subtotal * val) / 100);
    }
    return Math.min(subtotal, val);
  };

  const couponDiscount = calculateCouponDiscount();
  const finalPayable = Math.max(0, subtotal - couponDiscount + appliedDeliveryFee);

  const handleAddNewAddress = async (newAddr) => {
    try {
      const token = localStorage.getItem("texora_token") || localStorage.getItem("token");
      const updatedList = [...(user?.savedAddresses || []), newAddr];
      if (updateUserAddresses) updateUserAddresses(updatedList);
      setSelectedAddress(newAddr);

      if (token) {
        const res = await fetch("http://localhost:5000/api/auth/address", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newAddr),
        });
        const data = await res.json();
        if (data.addresses && updateUserAddresses) {
          updateUserAddresses(data.addresses);
        }
      }
      if (refreshProfile) refreshProfile();
    } catch (err) {
      console.error("Failed to add address", err);
    }
  };

  const handlePlaceOrder = async () => {
    setOrderError("");

    if (!isLoggedIn) {
      openAuthModal();
      return;
    }

    if (!selectedAddress) {
      setIsAddressModalOpen(true);
      return;
    }

    setPlacingOrder(true);
    try {
      const token = localStorage.getItem("texora_token") || localStorage.getItem("token");

      const orderPayload = {
        userId: user?._id || "",
        customerName: selectedAddress.name || user?.name || "Customer",
        phone: selectedAddress.phone || user?.phone || "",
        email: selectedAddress.email || user?.email || "",
        address: selectedAddress.street || selectedAddress.address || "Main Street",
        city: selectedAddress.city || "Local",
        pincode: selectedAddress.pincode || "110001",
        items: cartItems.map((item) => ({
          name: item.title || item.name || "Product",
          price: item.price,
          qty: item.quantity || 1,
          image: item.image || item.images?.[0] || "",
          slug: item.id || item._id || item.slug || "",
        })),
        subtotal: subtotal,
        deliveryFee: appliedDeliveryFee,
        couponCode: appliedCoupon?.code || "",
        couponDiscount: couponDiscount || 0,
        totalPrice: finalPayable,
        paymentMethod: paymentMethod,
        shippingAddress: selectedAddress,
      };

      const res = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (res.ok && (data.success || data.order || data._id)) {
        setOrderSuccess(data.order || data || { _id: "ORD" + Date.now() });
        clearCart();
      } else {
        setOrderError(data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      setOrderError("Network error. Please make sure backend is running.");
    } finally {
      setPlacingOrder(false);
    }
  };

  // SUCCESS SCREEN
  if (orderSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 bg-gray-50 py-12">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Order Placed Successfully!</h2>
          <p className="text-sm text-gray-500 mt-2">
            Payment Mode: <strong className="text-gray-800">{paymentMethod}</strong>
          </p>
          <div className="bg-gray-50 rounded-xl p-4 my-4 text-left border border-gray-100">
            <p className="text-xs text-gray-400 font-bold uppercase">Order Reference</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">#{orderSuccess._id}</p>
            <p className="text-xs text-gray-500 mt-2">
              Deliver to: <span className="font-semibold text-gray-800">{selectedAddress?.name}</span> ({selectedAddress?.pincode})
            </p>
          </div>

          {/* 📱 Real Flipkart/Amazon Style Automatic Confirmation Box */}
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-left shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs mt-0.5">
                <CheckCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-black text-emerald-950 text-xs">
                    Automated WhatsApp & SMS Sent
                  </p>
                  <span className="rounded-md bg-emerald-200/70 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                    +91 {selectedAddress?.phone || user?.phone || "Phone"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-emerald-800/90 leading-relaxed">
                  Your order receipt has been sent directly to your WhatsApp inbox. You will receive real-time notifications when your package is packed, shipped and out for delivery.
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between">
              <Link
                href={`/invoice/${orderSuccess._id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-900 shadow-2xs hover:bg-emerald-50 transition"
              >
                <span>📄 Download GST Invoice</span>
              </Link>
              <span className="text-[10.5px] font-semibold text-emerald-700 flex items-center gap-1">
                <span>⚡ Auto-Updates Active</span>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/orders"
              className="block w-full py-3 bg-[#f4511e] hover:bg-[#d84315] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-orange-500/25"
            >
              Track Your Order
            </Link>
            <Link
              href="/"
              className="block w-full py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY CART SCREEN
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-orange-50 text-[#f4511e] rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Your Cart is Empty</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Looks like you haven't added anything to your cart yet. Explore our top deals!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#f4511e] hover:bg-[#d84315] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-500/20"
          >
            <ArrowLeft size={16} /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold">Shopping Cart ({totalCount})</span>
        </div>

        {/* ERROR ALERT BANNER */}
        {orderError && (
          <div className="mb-4 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-4">
            {/* 1. ORIGINAL ADDRESS BAR */}
            <CartAddressBar
              selectedAddress={selectedAddress}
              onOpenAddressModal={() => setIsAddressModalOpen(true)}
              isLoggedIn={isLoggedIn}
              onOpenAuth={openAuthModal}
            />

            {/* 2. PAYMENT MODE SELECTOR (COD vs UPI) */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h4 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider mb-2.5">
                Payment Option
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label
                  onClick={() => setPaymentMethod("Cash on Delivery")}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethod === "Cash on Delivery"
                      ? "border-[#f4511e] bg-orange-50/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payMode"
                    checked={paymentMethod === "Cash on Delivery"}
                    onChange={() => setPaymentMethod("Cash on Delivery")}
                    className="text-[#f4511e]"
                  />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">💵 Cash on Delivery</span>
                    <span className="text-[10px] text-gray-400">Pay cash at doorstep</span>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod("Online UPI")}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition ${
                    paymentMethod === "Online UPI"
                      ? "border-[#f4511e] bg-orange-50/20"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payMode"
                    checked={paymentMethod === "Online UPI"}
                    onChange={() => setPaymentMethod("Online UPI")}
                    className="text-[#f4511e]"
                  />
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">⚡ Online UPI / QR</span>
                    <span className="text-[10px] text-gray-400">GPay, PhonePe, Paytm</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 3. ORIGINAL CART ITEMS LIST */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id || item._id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          </div>

          {/* 4. ORIGINAL PRICE SIDEBAR (WITH FULL COUPONS SECTION INTACT!) */}
          <div className="lg:col-span-1">
            <PriceDetailsSidebar
              totalItems={totalCount}
              subtotal={subtotal}
              onPlaceOrder={handlePlaceOrder}
              placingOrder={placingOrder}
              isLoggedIn={isLoggedIn}
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              couponDiscount={couponDiscount}
              deliveryFee={appliedDeliveryFee}
              standardFee={storeSettings.deliveryFee}
              freeThreshold={storeSettings.freeDeliveryMinOrder}
              isFreeDelivery={isFreeDelivery}
              returnDays={storeSettings.returnWindowDays || (storeSettings.badge3Label ? Number(storeSettings.badge3Label.match(/\d+/)?.[0]) : 7) || 7}
            />
          </div>
        </div>
      </div>

      {/* ORIGINAL ADDRESS SELECT MODAL */}
      <AddressSelectModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addresses={user?.savedAddresses || []}
        selectedAddress={selectedAddress}
        onSelectAddress={(addr) => setSelectedAddress(addr)}
        onAddNewAddress={handleAddNewAddress}
      />
    </div>
  );
}