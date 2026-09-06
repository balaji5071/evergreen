"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await login(email, password);

      if (!res.success || !res.user) {
        setLoading(false);
        setError(res.message || "Invalid email or password");
        return;
      }

      const role = res.user.role;
      if (role === "Admin" || role === "Staff") {
        window.location.href = "/staff/dashboard";
      } else {
        window.location.href = "/menu";
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 bg-[#FAF8F5] min-h-[85vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-6">
        {/* Brand Logo & Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#0C3B2E] text-amber-300 flex items-center justify-center font-serif text-3xl font-bold shadow-md border-2 border-emerald-700">
            🌿
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-[#0C3B2E]">Evergreen</h1>
            <p className="text-[10px] text-emerald-800 uppercase tracking-widest font-semibold mt-0.5">
              Cafe & Restaurant
            </p>
          </div>
        </div>

        <div className="text-center">
          <h2 className="font-serif text-xl font-bold text-[#0C3B2E]">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to your customer account to order food</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                suppressHydrationWarning
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                suppressHydrationWarning
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl btn-emerald flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold shadow-md cursor-pointer"
          >
            <span>{loading ? "Signing in..." : "Continue"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 flex flex-col space-y-2">
          <div>
            Don't have an account?{" "}
            <Link href="/signup" className="text-[#0C3B2E] font-bold underline">
              Create an account
            </Link>
          </div>

          <div className="pt-1">
            <Link
              href="/staff/login"
              className="inline-block text-[11px] font-extrabold text-[#0C3B2E] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition"
            >
              Are you kitchen / restaurant staff? Staff Portal Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
