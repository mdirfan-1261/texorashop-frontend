
"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Smartphone,
  ArrowRight,
  Loader2,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, loginSuccess } = useUser();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep(1);
      setOtp("");
      setError("");
      setTimer(0);
    }
  }, [isAuthModalOpen]);

  useEffect(() => {
    if (timer <= 0) return;

    const id = setInterval(() => {
      setTimer((current) => current - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [timer]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    setError("");

    const cleanPhone = phone.replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanPhone,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
        setOtp("");
        setTimer(30);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Send OTP Error:", err);
      setError("Unable to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setError("");

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Please enter the 6-digit OTP sent to your mobile");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          otp: otp.trim(),
          name: name.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        loginSuccess(data.user, data.token);
      } else {
        setError(data.message || "Invalid OTP entered");
      }
    } catch (err) {
      console.error("Verify OTP Error:", err);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#f4511e] to-orange-500 px-6 py-6 text-white relative">
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30 transition"
            aria-label="Close login modal"
          >
            <X size={18} />
          </button>

          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck size={12} />
            100% Secure OTP Login
          </span>

          <h2 className="mt-2 text-xl font-black tracking-tight">
            {step === 1 ? "Sign In / Sign Up" : "Verify Mobile OTP"}
          </h2>

          <p className="mt-1 text-xs text-white/90">
            {step === 1
              ? "Enter your mobile number to get instant access to your orders & offers."
              : `We have sent a 6-digit verification code via SMS to +91 ${phone}`}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-600">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700">
                  Your Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (e.g. Irfan)"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#f4511e] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">
                  Mobile Number
                </label>

                <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-[#f4511e] focus-within:bg-white">
                  <span className="border-r border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-black text-slate-700">
                    +91
                  </span>

                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Enter 10-digit mobile number"
                    required
                    className="w-full px-3.5 py-2.5 text-sm font-mono font-bold text-slate-900 outline-none bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4511e] hover:bg-[#d84315] py-3.5 text-sm font-black text-white shadow-md shadow-orange-500/25 transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending SMS OTP...</span>
                  </>
                ) : (
                  <>
                    <Smartphone size={16} />
                    <span>Send Verification OTP</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Enter 6-Digit SMS OTP
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                    }}
                    className="text-xs font-bold text-[#f4511e] hover:underline"
                  >
                    Change Number?
                  </button>
                </div>

                <div className="relative mt-1.5">
                  <KeyRound
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="• • • • • •"
                    required
                    autoFocus
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-center font-mono text-lg font-black tracking-[0.4em] text-slate-900 outline-none focus:border-[#f4511e] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4511e] hover:bg-[#d84315] py-3.5 text-sm font-black text-white shadow-md shadow-orange-500/25 transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying OTP...</span>
                  </>
                ) : (
                  <span>Verify & Continue</span>
                )}
              </button>

              {/* Resend OTP Timer */}
              <div className="text-center pt-1">
                {timer > 0 ? (
                  <p className="text-xs font-semibold text-slate-400">
                    Resend OTP in{" "}
                    <span className="font-mono font-bold text-slate-700">
                      {timer}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#f4511e] hover:underline disabled:opacity-50"
                  >
                    <RefreshCw size={12} />
                    <span>Resend OTP via SMS</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
