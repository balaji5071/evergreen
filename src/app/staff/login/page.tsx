"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, AlertCircle, ShieldAlert, UtensilsCrossed } from "lucide-react";

export default function StaffLoginPage() {
  const router = useRouter();
  const { user, login, logout, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in as staff or admin, redirect to staff dashboard
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "Staff" || user.role === "Admin") {
        router.push("/staff/dashboard");
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(email, password);
    if (!res.success) {
      setLoading(false);
      setError(res.message || "Invalid credentials");
      return;
    }

    // Verify staff role via /api/auth/me
    try {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      const role = meData?.user?.role;

      if (role === "Staff" || role === "Admin") {
        router.push("/staff/dashboard");
      } else {
        await logout();
        setError("Access Denied: Customer accounts cannot access the Staff Portal. Please use the Customer App.");
      }
    } catch (err: any) {
      setError("Authorization verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-[#0C3B2E] text-white">
      {/* Background Subtle Gradient Overlay */}
      <div className="w-full max-w-md bg-white text-slate-900 p-8 rounded-3xl border border-emerald-800 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Decorative Banner */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400" />

        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-full bg-[#0C3B2E] text-white flex items-center justify-center p-1 shadow-md border-2 border-emerald-600">
            <Image
              src="/logo.png"
              alt="Evergreen Logo"
              width={48}
              height={48}
              className="rounded-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-black text-[#0C3B2E] tracking-tight">
              Evergreen Staff Portal
            </h1>
            <p className="text-[10px] text-emerald-800 uppercase tracking-widest font-extrabold mt-0.5 flex items-center justify-center space-x-1">
              <UtensilsCrossed className="w-3 h-3 text-emerald-700" />
              <span>Kitchen & Operations Operations</span>
            </p>
          </div>
        </div>

        <div className="text-center bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
          <p className="text-xs font-bold text-[#0C3B2E]">Authorized Personnel Only</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Sign in with your assigned staff email & employee credentials
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase tracking-wider">
              Staff Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@evergreen.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase tracking-wider">
              Staff Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl btn-emerald flex items-center justify-center space-x-2 text-xs sm:text-sm font-extrabold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
          >
            <span>{loading ? "Authenticating Staff..." : "Sign In to Staff Portal"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100 flex flex-col space-y-1.5">
          <span>Are you a customer trying to order food?</span>
          <Link href="/login" className="text-[#0C3B2E] font-extrabold hover:underline">
            Go to Customer App Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
