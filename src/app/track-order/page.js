"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  Loader2, 
  HelpCircle, 
  Package, 
  MapPin, 
  Phone, 
  UserCheck, 
  Truck, 
  Home, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertCircle
} from "lucide-react";

// ==========================================
// 1. REAL DYNAMIC STEPPER (AMAZON / FLIPKART STYLE)
// ==========================================
function OrderTrackingStepper({ order }) {
  const status = (order.status || order.orderStatus || "Pending").toLowerCase();

  let activeIndex = 0;
  if (status.includes("cancel")) {
    activeIndex = -1;
  } else if (status.includes("delivered")) {
    activeIndex = 3;
  } else if (status.includes("out")) {
    activeIndex = 2;
  } else if (status.includes("shipped")) {
    activeIndex = 1;
  } else {
    activeIndex = 0;
  }

  // Format real timestamps from database
  const formatDateTime = (dateValue) => {
    if (!dateValue) return "";
    const d = new Date(dateValue);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Real step times from database
  const confirmedTime = formatDateTime(order.confirmedAt || order.createdAt);
  const shippedTime = order.shippedAt ? formatDateTime(order.shippedAt) : (activeIndex >= 1 ? formatDateTime(order.updatedAt) : "Expected in 24 hours");
  const outTime = order.outForDeliveryAt ? formatDateTime(order.outForDeliveryAt) : (activeIndex >= 2 ? formatDateTime(order.updatedAt) : "Upcoming");
  const deliveredTime = order.deliveredAt ? `Delivered on ${formatDateTime(order.deliveredAt)}` : (activeIndex === 3 ? `Delivered on ${formatDateTime(order.updatedAt)}` : "Expected in 2-3 days");

  const steps = [
    {
      title: "Order Confirmed",
      desc: "Seller has received and confirmed your order",
      time: confirmedTime,
      icon: <Package size={18} />,
    },
    {
      title: "Shipped",
      desc: "Dispatched via Texora Express Logistics (AWB: TX789421)",
      time: shippedTime,
      icon: <Truck size={18} />,
    },
    {
      title: "Out for Delivery",
      desc: "Delivery executive is out to deliver your package",
      time: outTime,
      icon: <Clock size={18} />,
    },
    {
      title: "Delivered",
      desc: "Package handed over to receiver with OTP verification",
      time: deliveredTime,
      icon: <Home size={18} />,
    },
  ];

  if (activeIndex === -1) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2 font-black text-xl">
          ✕
        </div>
        <h3 className="font-bold text-red-900 text-base">This Order Was Cancelled</h3>
        <p className="text-xs text-red-600 mt-1">
          If paid online, refund will be credited back within 3-5 working days.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
        <div>
          <h3 className="font-extrabold text-gray-900 text-base">Live Order Tracking</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Current Status: <span className="font-black text-[#f4511e] uppercase">{order.status || "Pending"}</span>
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Tracking
        </span>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-9 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
        {steps.map((step, idx) => {
          const isCompleted = idx <= activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={idx} className="relative flex items-start gap-4">
              <div
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center -ml-6 transition-all ${
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-300"
                } ${isCurrent ? "ring-4 ring-emerald-100 scale-110" : ""}`}
              >
                {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={10} />}
              </div>

              <div className="flex-1 -mt-0.5">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-bold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                    {step.title}
                  </h4>
                  <span className={`text-xs font-semibold ${isCompleted ? "text-emerald-600" : "text-gray-400"}`}>
                    {step.time}
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isCompleted ? "text-gray-600" : "text-gray-400"}`}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 2. DELIVERY ADDRESS CARD
// ==========================================
function DeliveryAddressCard({ shippingAddress }) {
  if (!shippingAddress) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <MapPin size={18} className="text-[#f4511e]" />
        <h3 className="font-extrabold text-gray-900 text-base">Delivery Address</h3>
      </div>

      <div className="space-y-1.5 text-sm text-gray-700">
        <p className="font-bold text-gray-900 text-base flex items-center gap-1.5">
          <UserCheck size={16} className="text-emerald-600" />
          {shippingAddress.name}
        </p>
        <p className="text-xs text-gray-600 leading-relaxed">{shippingAddress.street}</p>
        <p className="text-xs text-gray-600">
          {shippingAddress.city}, {shippingAddress.state} -{" "}
          <span className="font-bold text-gray-900">{shippingAddress.pincode}</span>
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-800 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
            <Phone size={13} className="text-gray-500" />
            +91 {shippingAddress.phone}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. ORDER SUMMARY CARD
// ==========================================
function OrderSummaryCard({ order }) {
  if (!order) return null;
  const items = order.items || order.orderItems || [];
  const totalPrice = Number(order.totalPrice ?? order.totalAmount ?? 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      <h3 className="font-extrabold text-gray-900 text-base mb-4 pb-3 border-b border-gray-100">
        Items in this Order ({items.length})
      </h3>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-center">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
              <Image
                src={item.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"}
                alt={item.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-900 line-clamp-2">{item.name}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Qty: {item.qty || item.quantity || 1}
              </p>
              <p className="text-sm font-black text-gray-900 mt-1">₹{item.price}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Payment Method</span>
          <span className="font-bold text-gray-800">{order.paymentMethod || "Cash on Delivery"}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Delivery Charge</span>
          <span className="font-bold text-emerald-600 uppercase">Free</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-gray-100">
          <span className="font-black text-sm text-gray-900">Total Paid / Payable</span>
          <span className="font-black text-lg text-gray-900">₹{totalPrice}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN TRACK ORDER CONTENT
// ==========================================
function TrackOrderContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("texora_token");
        const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          setOrder(data.order || data);
        } else {
          setError("Order not found with this ID");
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
        setError("Unable to connect to order server");
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetail();
    } else {
      setLoading(false);
      setError("No order ID provided in URL");
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#f4511e] mb-3" />
        <p className="text-sm font-bold text-gray-700">Loading live tracking details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Order Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            {error || "Could not retrieve tracking details for this order ID."}
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 bg-[#f4511e] text-white px-5 py-2.5 rounded-xl font-bold text-xs"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const shippingInfo = order.shippingAddress || {
    name: order.customerName || "Customer",
    phone: order.phone || "",
    street: order.address || "",
    city: order.city || "",
    state: order.state || "India",
    pincode: order.pincode || "",
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link
              href="/orders"
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 shadow-sm"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Tracking</h1>
              <p className="text-xs text-gray-500">
                Order ID: <span className="font-bold text-gray-800">#{order._id}</span>
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-3.5 py-2 rounded-xl shadow-sm"
          >
            <HelpCircle size={14} />
            <span>Need Help?</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-2 space-y-6">
            <OrderTrackingStepper order={order} />
          </div>

          <div className="md:col-span-1 space-y-6">
            <DeliveryAddressCard shippingAddress={shippingInfo} />
            <OrderSummaryCard order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 5. EXPORT WITH SUSPENSE
// ==========================================
export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-[#f4511e]" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}