
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  Banknote,
  CheckCircle2,
  ArrowLeft,
  MapPin,
  Lock,
  MessageSquare,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CheckoutPage() {
  const {
    cartItems,
    subtotalPrice,
    totalMrp,
    totalDiscount,
    clearCart,
    isLoaded,
  } = useCart();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    pincode: "",
    address: "",
    city: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (submitting) return;

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const address = form.address.trim();
    const city = form.city.trim() || "India";
    const pincode = form.pincode.trim();

    if (!name || !phone || !address || !pincode) {
      setError(
        "Please fill in Name, Phone Number, Delivery Address and Pincode."
      );
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    const invalidItem = cartItems.find(
      (item) =>
        !(item._id || item.id) ||
        !item.title ||
        !(Number(item.price) > 0)
    );

    if (invalidItem) {
      setError(
        "A product in your cart has missing details. Please remove it and add it again."
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: name,
        phone,
        email,
        address,
        city,
        pincode,

        items: cartItems.map((item) => ({
          productId: String(item._id || item.id),
          id: String(item.id || item._id),
          slug: item.slug || "",
          title: item.title,
          brand: item.brand || "",
          image: item.image || item.images?.[0] || "",
          price: Number(item.price),
          quantity: Number(item.quantity) || 1,
          selectedSize: item.selectedSize || "Free Size",
          selectedColor: item.selectedColor || "Standard",
        })),

        paymentMethod: "Cash on Delivery",
      };

      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to place order.");
      }

      if (!data.order || !data.order._id) {
        throw new Error("Order response is invalid.");
      }

      clearCart();
      setPlacedOrder(data.order);
    } catch (err) {
      console.error("PLACE ORDER ERROR:", err);
      setError(
        err.message || "Something went wrong while placing your order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  // Order success screen
  if (placedOrder) {
    return (
      <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 shadow-sm">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h2 className="mt-5 text-2xl font-black text-slate-900">
          Order Placed Successfully!
        </h2>

        <p className="mt-2 text-xs text-slate-500">
          Your order has been received.
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Order ID:{" "}
          <span className="font-mono font-bold text-slate-800">
            {placedOrder._id}
          </span>
        </p>

        <div className="mt-5 w-full rounded-2xl border border-slate-200 bg-white p-5 text-left text-xs shadow-sm">
          <p className="font-black text-slate-900">
            Delivery To:
          </p>

          <p className="mt-1 font-semibold text-slate-600">
            {placedOrder.customerName} ({placedOrder.phone})
          </p>

          <p className="text-slate-500">
            {placedOrder.address}, {placedOrder.city} -{" "}
            {placedOrder.pincode}
          </p>

          <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 font-black text-slate-900">
            <span>Payment Mode:</span>
            <span className="text-orange-600">
              {placedOrder.paymentMethod}
            </span>
          </div>

          <div className="mt-1 flex justify-between font-black text-slate-900">
            <span>Order Status:</span>
            <span className="text-emerald-600">
              {placedOrder.status || "Pending"}
            </span>
          </div>

          <div className="mt-1 flex justify-between font-black text-slate-900">
            <span>Total Amount:</span>
            <span className="text-emerald-600">
              ₹{Number(placedOrder.totalPrice).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* 📱 Real Flipkart/Amazon Style Automatic Confirmation Box */}
        <div className="mt-4 w-full rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-left shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs mt-0.5">
              <CheckCircle2 size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-black text-emerald-950 text-xs">
                  Automated WhatsApp & SMS Sent
                </p>
                <span className="rounded-md bg-emerald-200/70 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                  +91 {placedOrder.phone}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-800/90 leading-relaxed">
                Your order receipt has been sent directly to your WhatsApp inbox. You will receive real-time notifications when your package is packed, shipped and out for delivery.
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between">
            <Link
              href={`/invoice/${placedOrder._id}`}
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

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-black text-white shadow-md hover:bg-orange-600"
          >
            Continue Shopping
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-black text-slate-700 hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <h2 className="text-lg font-black text-slate-900">
          Your cart is empty
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Please add items to cart before proceeding to checkout.
        </p>

        <Link
          href="/products"
          className="mt-4 rounded-xl bg-orange-500 px-5 py-2 text-xs font-black text-white"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Bar */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
            <Lock className="h-3.5 w-3.5" />
            Secure Checkout
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Shipping Details */}
            <div className="space-y-5 lg:col-span-7">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                  {error}
                </div>
              )}

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
                    Delivery Address
                  </h3>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600">
                      Mobile Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      maxLength={10}
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email (optional)"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-600">
                      Complete Address *
                    </label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House no, building, street, area..."
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600">
                      City / District
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Your city"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      required
                      maxLength={6}
                      value={form.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CreditCard className="h-4 w-4 text-orange-500" />
                  <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
                    Payment Method
                  </h3>
                </div>

                <div className="mt-4">
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-orange-500 bg-orange-50/50 p-3.5 ring-2 ring-orange-200">
                    <div className="flex items-center gap-3">
                      <Banknote className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-xs font-black text-slate-900">
                          Cash on Delivery (COD)
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Pay when your product arrives.
                        </p>
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="h-4 w-4 accent-orange-600"
                    />
                  </label>

                  <p className="mt-2 text-[10px] text-slate-500">
                    Online payment will be available after payment gateway integration.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-20 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <h3 className="text-xs font-black tracking-wider text-slate-800 uppercase">
                  Order Summary ({cartItems.length} products)
                </h3>

                <div className="mt-3 max-h-48 divide-y divide-slate-100 overflow-y-auto pr-1">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.id || item._id}-${item.selectedSize || ""}-${index}`}
                      className="flex items-center justify-between py-2 text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.title || "Product"}
                            className="h-10 w-10 rounded-lg border object-cover"
                          />
                        )}

                        <div className="min-w-0">
                          <p className="line-clamp-1 font-bold text-slate-800">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Qty: {item.quantity || 1}
                          </p>
                        </div>
                      </div>

                      <span className="ml-2 shrink-0 font-black text-slate-900">
                        ₹
                        {(
                          Number(item.price) *
                          (Number(item.quantity) || 1)
                        ).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total MRP</span>
                    <span className="font-bold">
                      ₹{totalMrp.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between font-bold text-emerald-600">
                      <span>Discount Savings</span>
                      <span>
                        -₹{totalDiscount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery</span>
                    <span className="font-black text-emerald-600">
                      FREE
                    </span>
                  </div>

                  <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-black text-slate-900">
                    <span>Final Payable</span>
                    <span className="text-xl text-orange-600">
                      ₹{subtotalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || cartItems.length === 0}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-black text-white shadow-md shadow-orange-500/30 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting
                    ? "Placing Order..."
                    : `Place Order (₹${subtotalPrice.toLocaleString("en-IN")})`}
                </button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Secure Order Processing
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
