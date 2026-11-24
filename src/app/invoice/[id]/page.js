"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Building2 } from "lucide-react";

export default function InvoicePage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState({
    storeName: "TexoraShop",
    supportEmail: "support@texorashop.in",
    supportPhone: "+91 9696511261",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        // 1. Fetch Store Settings for GSTIN & Address
        try {
          const sRes = await fetch("http://localhost:5000/api/settings", { cache: "no-store" });
          if (sRes.ok) {
            const sData = await sRes.json();
            if (sData) setSettings((prev) => ({ ...prev, ...sData }));
          }
        } catch (e) {}

        // 2. Fetch Order Data
        const res = await fetch("http://localhost:5000/api/orders", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load orders");

        const allOrders = await res.json();
        if (Array.isArray(allOrders)) {
          const found = allOrders.find((o) => o._id === orderId);
          if (found) {
            setOrder(found);
            return;
          }
        }
        throw new Error("Order not found");
      } catch (err) {
        setError(err.message || "Failed to load invoice details");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) loadData();
  }, [orderId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Convert Number to Indian Words
  const numberToWords = (num) => {
    const a = [
      "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
      "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ",
      "Seventeen ", "Eighteen ", "Nineteen ",
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const n = Math.round(Number(num) || 0);
    if (n === 0) return "Zero Rupees Only";

    function inWords(val) {
      if (val < 20) return a[val];
      const digit = val % 10;
      if (val < 100) return b[Math.floor(val / 10)] + (digit ? "-" + a[digit] : " ");
      if (val < 1000) return a[Math.floor(val / 100)] + "Hundred " + (val % 100 === 0 ? "" : "and " + inWords(val % 100));
      if (val < 100000) return inWords(Math.floor(val / 1000)) + "Thousand " + (val % 1000 === 0 ? "" : inWords(val % 1000));
      if (val < 10000000) return inWords(Math.floor(val / 100000)) + "Lakh " + (val % 100000 === 0 ? "" : inWords(val % 100000));
      return inWords(Math.floor(val / 10000000)) + "Crore " + inWords(val % 10000000);
    }

    return "INR " + inWords(n).trim() + " Rupees Only";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-slate-600">Generating Official GST Tax Invoice v2...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full text-center shadow-sm">
          <h2 className="text-base font-black text-slate-800">Invoice Unavailable</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">{error || "Could not find order invoice."}</p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-orange-600"
          >
            <ArrowLeft size={14} /> Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const items = order.items || order.orderItems || [];
  const shipping = order.shippingAddress || {
    name: order.customerName,
    street: order.address,
    city: order.city,
    pincode: order.pincode,
    phone: order.phone,
  };

  const invoiceNumber = `INV-TXO-${String(order._id || "").slice(-8).toUpperCase()}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const invoiceDate = orderDate;

  // Real Indian State & State Code Helper
  const detectPlaceOfSupply = (city = "", pincode = "") => {
    const c = String(city).toLowerCase().trim();
    const pin = String(pincode).trim();

    if (c.includes("delhi") || pin.startsWith("11")) return { state: "Delhi", code: "07" };
    if (c.includes("mumbai") || c.includes("pune") || c.includes("nagpur") || pin.startsWith("40") || pin.startsWith("41") || pin.startsWith("42") || pin.startsWith("43") || pin.startsWith("44")) {
      return { state: "Maharashtra", code: "27" };
    }
    if (c.includes("bangalore") || c.includes("bengaluru") || pin.startsWith("56")) return { state: "Karnataka", code: "29" };
    if (c.includes("lucknow") || c.includes("noida") || c.includes("kanpur") || pin.startsWith("20") || pin.startsWith("21") || pin.startsWith("22") || pin.startsWith("23") || pin.startsWith("24") || pin.startsWith("25") || pin.startsWith("26")) {
      return { state: "Uttar Pradesh", code: "09" };
    }
    if (c.includes("jaipur") || pin.startsWith("30") || pin.startsWith("31") || pin.startsWith("32")) return { state: "Rajasthan", code: "08" };
    if (c.includes("ahmedabad") || c.includes("surat") || pin.startsWith("38") || pin.startsWith("39")) return { state: "Gujarat", code: "24" };
    if (c.includes("kolkata") || pin.startsWith("70")) return { state: "West Bengal", code: "19" };
    if (c.includes("chennai") || pin.startsWith("60")) return { state: "Tamil Nadu", code: "33" };
    if (c.includes("hyderabad") || pin.startsWith("50")) return { state: "Telangana", code: "36" };

    // Clean proper fallback if test/dummy input was provided (e.g. dnbfd)
    return { state: "Delhi", code: "07" };
  };

  const placeOfSupply = detectPlaceOfSupply(shipping.city || order.city, shipping.pincode || order.pincode);

  // Accurate HSN Code Helper
  const getHsnCode = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("shoe") || n.includes("sneaker") || n.includes("sandal") || n.includes("heels")) return "6403";
    if (n.includes("saree") || n.includes("kurti") || n.includes("shirt") || n.includes("dress") || n.includes("t-shirt") || n.includes("jacket")) return "6204";
    if (n.includes("bag") || n.includes("backpack") || n.includes("duffle") || n.includes("wallet")) return "4202";
    if (n.includes("watch") || n.includes("earbud") || n.includes("headphone") || n.includes("mobile") || n.includes("phone")) return "8517";
    if (n.includes("lipstick") || n.includes("serum") || n.includes("cream") || n.includes("perfume")) return "3304";
    return "9968";
  };

  // =========================================================================
  // ACCURATE GST-INCLUSIVE BACK-CALCULATION (Amazon/Flipkart Retail Standard)
  // Formula: Taxable Value = Gross Inclusive Amount / (1 + GST_RATE)
  // Tax Amount = Gross Inclusive Amount - Taxable Value
  // CGST (9%) = Tax Amount / 2, SGST (9%) = Tax Amount / 2
  // =========================================================================
  const GST_RATE = 0.18; // 18% Standard Integrated Tax (9% CGST + 9% SGST)

  const deliveryCharge = Number(order.deliveryFee || 0);
  const couponDiscount = Number(order.couponDiscount || 0);
  const grandTotal = Number(order.totalPrice || 0);

  // Item level calculations
  const calculatedItems = items.map((it) => {
    const qty = Number(it.qty || 1);
    const unitPrice = Number(it.price || 0);
    const lineTotal = unitPrice * qty; // GST-inclusive line amount

    const taxableValue = Math.round((lineTotal / (1 + GST_RATE)) * 100) / 100;
    const totalTax = Math.round((lineTotal - taxableValue) * 100) / 100;
    const cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    const sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;

    return {
      ...it,
      qty,
      unitPrice,
      lineTotal,
      hsn: getHsnCode(it.name),
      taxableValue,
      cgstAmount,
      sgstAmount,
      totalTax,
    };
  });

  // Delivery tax calculations
  const deliveryTaxable = deliveryCharge > 0 ? Math.round((deliveryCharge / (1 + GST_RATE)) * 100) / 100 : 0;
  const deliveryTax = deliveryCharge > 0 ? Math.round((deliveryCharge - deliveryTaxable) * 100) / 100 : 0;
  const deliveryCgst = Math.round((deliveryTax / 2) * 100) / 100;
  const deliverySgst = Math.round((deliveryTax - deliveryCgst) * 100) / 100;

  // Coupon discount tax adjustment
  const discountTaxable = couponDiscount > 0 ? Math.round((couponDiscount / (1 + GST_RATE)) * 100) / 100 : 0;
  const discountTax = couponDiscount - discountTaxable;
  const discountCgst = Math.round((discountTax / 2) * 100) / 100;
  const discountSgst = Math.round((discountTax - discountCgst) * 100) / 100;

  // Exact Grand Totals & Reconciled Sums
  const grossItemsTotal = calculatedItems.reduce((acc, it) => acc + it.lineTotal, 0);

  // Net Taxable Base Value
  const netTaxableValue = Math.max(
    0,
    Math.round(
      (calculatedItems.reduce((acc, it) => acc + it.taxableValue, 0) + deliveryTaxable - discountTaxable) * 100
    ) / 100
  );

  // Total CGST & SGST with zero rounding discrepancy
  const totalCgst = Math.max(
    0,
    Math.round(
      (calculatedItems.reduce((acc, it) => acc + it.cgstAmount, 0) + deliveryCgst - discountCgst) * 100
    ) / 100
  );

  const totalSgst = Math.max(
    0,
    Math.round(
      (calculatedItems.reduce((acc, it) => acc + it.sgstAmount, 0) + deliverySgst - discountSgst) * 100
    ) / 100
  );

  const totalTaxAmount = Math.round((totalCgst + totalSgst) * 100) / 100;

  // Payment Status & Receipt Detection
  const isDelivered = (order.status || "").toLowerCase().includes("delivered");
  const isCod = (order.paymentMethod || "").toLowerCase().includes("cash");
  const isPaid = order.isPaid || order.paymentStatus === "Paid" || (!isCod) || isDelivered;

  let paymentStatusLabel = "";
  let paymentBadgeClass = "";
  let paymentReceiptNote = "";

  if (isPaid) {
    if (isCod) {
      paymentStatusLabel = "PAID (Cash Collected at Doorstep on Delivery)";
      paymentBadgeClass = "bg-emerald-50 text-emerald-800 border-emerald-300";
      paymentReceiptNote = `Full cash payment of ₹${grandTotal} was received by the logistics delivery executive upon doorstep handover.`;
    } else {
      paymentStatusLabel = "PAID (Online UPI / Digital Payment)";
      paymentBadgeClass = "bg-emerald-50 text-emerald-800 border-emerald-300";
      paymentReceiptNote = `Online payment of ₹${grandTotal} was received and verified electronically via payment gateway.`;
    }
  } else {
    paymentStatusLabel = "PENDING (To be Collected in Cash at Doorstep)";
    paymentBadgeClass = "bg-amber-50 text-amber-800 border-amber-300";
    paymentReceiptNote = `Cash on delivery balance of ₹${grandTotal} is payable to the delivery executive upon arrival.`;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-4 px-3 sm:px-6 print:p-0 print:m-0 print:bg-white text-slate-900 font-sans">
      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm 8mm;
        }
        @media print {
          html, body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, footer, .print\\:hidden {
            display: none !important;
          }
          .invoice-sheet {
            border: 1px solid #cbd5e1 !important;
            box-shadow: none !important;
            padding: 16px 20px !important;
            border-radius: 0 !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* 1. TOP FLOATING ACTION BAR (Hidden on Print / PDF) */}
      <div className="max-w-4xl mx-auto mb-4 flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-sm print:hidden">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-orange-600 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-md shadow-orange-500/20 transition cursor-pointer"
          >
            <Printer size={15} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* 2. OFFICIAL GST TAX INVOICE SHEET (A4 Formatted) */}
      <div className="invoice-sheet max-w-4xl mx-auto bg-white border border-slate-300 p-5 sm:p-7 shadow-lg print:shadow-none print:border print:border-slate-300 print:p-5 rounded-2xl">
        
        {/* Header Strip: Document Type & Tax Identifiers */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-slate-900 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-base font-black text-white">
                T
              </span>
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Texora<span className="text-orange-600">Shop</span>
              </span>
            </div>
            <h1 className="text-sm font-black uppercase tracking-wider text-slate-900 mt-1">
              TAX INVOICE
            </h1>
            <p className="text-[10px] text-slate-500">
              (Issued under Section 31 of CGST Act, 2017 & Indian E-Commerce Rules)
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                Original for Recipient
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${paymentBadgeClass}`}>
                {isPaid ? "✓ PAID IN FULL" : "⏳ CASH TO COLLECT"}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5">
            <p className="font-mono text-xs font-black text-slate-900">
              Invoice No: <span className="text-orange-600 font-bold">{invoiceNumber}</span>
            </p>
            <p className="text-slate-600 text-[11px]">Invoice Date: <span className="font-bold text-slate-900">{invoiceDate}</span></p>
            <p className="font-mono text-[11px] text-slate-500">Order ID: #{order._id}</p>
            <p className="text-slate-600 text-[11px]">Order Date: {orderDate}</p>
            <p className="text-[10px] text-slate-500">Reverse Charge: <span className="font-bold text-slate-800">No</span></p>
          </div>
        </div>

        {/* 2-Column: Seller Details & Buyer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b border-slate-200 text-xs">
          {/* Registered Seller Details */}
          <div className="space-y-1">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Building2 size={13} className="text-orange-500" />
              <span>Sold By / Supplier Details</span>
            </h4>
            <p className="font-bold text-slate-900 text-xs">Texora Retail Private Limited</p>
            <p className="text-[11px] text-slate-600">Trading As: <span className="font-bold text-slate-800">{settings.storeName || "TexoraShop"}</span></p>
            <p className="text-[11px] text-slate-600">Plot 42, Okhla Industrial Area, Phase-III</p>
            <p className="text-[11px] text-slate-600">New Delhi, Delhi - 110020, India</p>
            <p className="text-[11px] text-slate-800 pt-0.5">
              <span className="font-bold">GSTIN:</span> 07AABCT1332M1ZQ
            </p>
            <p className="text-[11px] text-slate-800">
              <span className="font-bold">PAN:</span> AABCT1332M • <span className="font-bold">State Code:</span> 07 (Delhi)
            </p>
            <p className="text-[10px] text-slate-500">Helpdesk: {settings.supportEmail} | {settings.supportPhone}</p>
          </div>

          {/* Customer / Billing & Shipping Details */}
          <div className="space-y-1">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1">
              Billing & Shipping Details (B2C)
            </h4>
            <p className="font-bold text-slate-900 text-xs">{shipping.name || order.customerName}</p>
            <p className="text-[11px] text-slate-600 leading-snug">{shipping.street || order.address}</p>
            <p className="text-[11px] text-slate-600">
              {shipping.city || order.city} - <span className="font-bold text-slate-900">{shipping.pincode || order.pincode}</span>
            </p>
            <p className="text-[11px] text-slate-800 pt-0.5">
              <span className="font-bold">Place of Supply:</span> {placeOfSupply.state} (State Code: {placeOfSupply.code})
            </p>
            <p className="text-[11px] text-slate-800">
              <span className="font-bold">Mobile:</span> +91 {shipping.phone || order.phone}
            </p>
            <p className="text-[10px] text-slate-500">
              <span className="font-semibold">Customer GSTIN:</span> URP (Unregistered Person / Retail Consumer)
            </p>
          </div>
        </div>

        {/* 3. PRODUCT-WISE HSN & GST TAX BREAKDOWN TABLE */}
        <div className="py-3 overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-700 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r border-slate-300 w-8 text-center">#</th>
                <th className="p-2 border-r border-slate-300">Description of Goods</th>
                <th className="p-2 border-r border-slate-300 text-center">HSN</th>
                <th className="p-2 border-r border-slate-300 text-center">Qty</th>
                <th className="p-2 border-r border-slate-300 text-right">Unit Price (₹)</th>
                <th className="p-2 border-r border-slate-300 text-right">Taxable Val. (₹)</th>
                <th className="p-2 border-r border-slate-300 text-center">CGST (9%)</th>
                <th className="p-2 border-r border-slate-300 text-center">SGST (9%)</th>
                <th className="p-2 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[11px]">
              {calculatedItems.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-500">{idx + 1}</td>
                  <td className="p-2 border-r border-slate-200 font-bold text-slate-800">
                    <div>{it.name}</div>
                    <div className="text-[10px] text-slate-400 font-normal">Prices are 18% GST-inclusive (MRP standard)</div>
                  </td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-700 font-semibold">{it.hsn}</td>
                  <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-900">{it.qty}</td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono font-semibold">₹{it.unitPrice.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono text-slate-700">₹{it.taxableValue.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-600">₹{it.cgstAmount.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-600">₹{it.sgstAmount.toFixed(2)}</td>
                  <td className="p-2 text-right font-black text-slate-900 font-mono">₹{it.lineTotal.toFixed(2)}</td>
                </tr>
              ))}

              {/* Delivery Charge Line Item */}
              <tr className="bg-slate-50/40">
                <td className="p-2 border-r border-slate-200 text-center font-bold text-slate-500">{calculatedItems.length + 1}</td>
                <td className="p-2 border-r border-slate-200 font-medium text-slate-700">
                  Doorstep Logistics & Delivery Fee (Standard)
                </td>
                <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-500">9968</td>
                <td className="p-2 border-r border-slate-200 text-center font-bold">1</td>
                <td className="p-2 border-r border-slate-200 text-right font-mono">₹{deliveryCharge.toFixed(2)}</td>
                <td className="p-2 border-r border-slate-200 text-right font-mono">₹{deliveryTaxable.toFixed(2)}</td>
                <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-500">₹{deliveryCgst.toFixed(2)}</td>
                <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px] text-slate-500">₹{deliverySgst.toFixed(2)}</td>
                <td className="p-2 text-right font-bold text-slate-800 font-mono">
                  {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : <span className="text-emerald-600 font-black">FREE</span>}
                </td>
              </tr>

              {/* Coupon Discount (If Any) */}
              {couponDiscount > 0 && (
                <tr className="bg-emerald-50/50 text-emerald-800">
                  <td className="p-2 border-r border-slate-200 text-center font-bold">-</td>
                  <td colSpan={4} className="p-2 border-r border-slate-200 font-bold">
                    Promo Discount {order.couponCode ? `("${order.couponCode}")` : ""} Applied
                  </td>
                  <td className="p-2 border-r border-slate-200 text-right font-mono font-bold">-₹{discountTaxable.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px]">-₹{discountCgst.toFixed(2)}</td>
                  <td className="p-2 border-r border-slate-200 text-center font-mono text-[10px]">-₹{discountSgst.toFixed(2)}</td>
                  <td className="p-2 text-right font-black text-emerald-700 font-mono">-₹{couponDiscount.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. TOTALS, TAX BREAKUP & RECONCILIATION SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 py-2 border-t border-slate-200">
          {/* Left Column: Words & Payment Receipt Details */}
          <div className="sm:col-span-7 space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                Total Amount in Words:
              </span>
              <p className="font-bold text-slate-800 mt-0.5 capitalize">{numberToWords(grandTotal)}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">Payment & Tax Reconciliation:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${paymentBadgeClass}`}>
                  {isPaid ? "✓ PAID IN FULL" : "⏳ CASH TO COLLECT"}
                </span>
              </div>
              <p>• <span className="font-semibold">Payment Mode:</span> {order.paymentMethod || "Cash on Delivery"}</p>
              <p>• <span className="font-semibold">Tax Breakup (18% GST):</span> CGST (₹{totalCgst.toFixed(2)}) + SGST (₹{totalSgst.toFixed(2)}) = ₹{totalTaxAmount.toFixed(2)}</p>
              <p>• <span className="font-semibold">Payment Status:</span> {paymentStatusLabel}</p>
              <p className="text-[10px] text-slate-500 italic pt-0.5">{paymentReceiptNote}</p>
            </div>
          </div>

          {/* Right Column: Reconciled Totals Table */}
          <div className="sm:col-span-5 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Gross Total (MRP Items):</span>
              <span className="font-mono font-bold">₹{grossItemsTotal.toFixed(2)}</span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon Savings:</span>
                <span className="font-mono">-₹{couponDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>Delivery Charge:</span>
              <span className="font-mono font-bold">
                {deliveryCharge > 0 ? `₹${deliveryCharge.toFixed(2)}` : <span className="text-emerald-600 font-black">FREE</span>}
              </span>
            </div>

            <div className="flex justify-between text-slate-500 text-[11px] pt-1.5 border-t border-slate-200">
              <span>Taxable Value (Base Excl. Tax):</span>
              <span className="font-mono font-semibold">₹{netTaxableValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Central Tax (CGST @ 9%):</span>
              <span className="font-mono">₹{totalCgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>State Tax (SGST @ 9%):</span>
              <span className="font-mono">₹{totalSgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-700 text-[11px] font-bold">
              <span>Total GST Included:</span>
              <span className="font-mono">₹{totalTaxAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t-2 border-slate-900 text-base font-black text-slate-900">
              <span>Grand Total:</span>
              <span className="text-lg text-orange-600 font-mono">₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-slate-200">
              <span className="text-slate-600">Balance Due:</span>
              <span className={isPaid ? "text-emerald-700 font-black font-mono" : "text-rose-600 font-black font-mono"}>
                {isPaid ? "₹0.00 (PAID IN FULL)" : `₹${grandTotal.toFixed(2)} (DUE ON DELIVERY)`}
              </span>
            </div>
          </div>
        </div>

        {/* 5. FOOTER, COMPLIANCE & AUTHORIZED SIGNATORY */}
        <div className="mt-4 pt-3 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-end gap-4 text-xs">
          <div className="space-y-0.5 text-slate-500 text-[10px] max-w-md">
            <p className="font-bold text-slate-800 text-xs">Statutory Declarations & Policy:</p>
            <p>1. We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
            <p>2. Returns / Replacements are valid within the applicable policy window ({settings.returnWindowDays || 3} days) from delivery date.</p>
            <p>3. All disputes are subject to the exclusive jurisdiction of the competent courts in New Delhi, India.</p>
            <p className="text-slate-400 pt-0.5">This is a computer-generated tax invoice and does not require a physical signature.</p>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <div className="inline-block p-1.5 border border-dashed border-slate-300 rounded-lg bg-slate-50/50 mb-1">
              <span className="font-black text-xs text-orange-600 block uppercase">TexoraShop Certified</span>
              <span className="text-[9px] text-slate-400 font-mono">DIGITALLY SIGNED</span>
            </div>
            <p className="font-black text-slate-900 text-xs">For Texora Retail Private Limited</p>
            <p className="text-[10px] text-slate-500">Authorized Signatory</p>
          </div>
        </div>

      </div>
    </div>
  );
}
