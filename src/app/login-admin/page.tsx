"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Mail, Lock, AlertCircle, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(email, password);

    if (!res.success) {
      setLoading(false);
      setError(res.message || "Invalid administrator credentials");
      return;
    }

    setLoading(false);

    if (res.user?.role === "Admin") {
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      router.replace(redirect?.startsWith("/admin") ? redirect : "/admin");
    } else {
      await fetch("/api/auth/logout", { method: "POST" });
      await refreshUser();
      setError("Access Denied: Admin privileges required.");
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 bg-[#FAF8F5] min-h-screen">
      {/* Top Header */}
      <div className="pt-8 flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-white p-1 border-2 border-[#0C3B2E] shadow-xl relative">
          <Image
            src="/logo.png"
            alt="Evergreen Logo"
            width={72}
            height={72}
            className="rounded-full object-contain"
            priority
          />
          <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 p-1.5 rounded-full border border-amber-500 shadow">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0C3B2E]/10 text-[#0C3B2E] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Suite</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#0C3B2E]">Evergreen Admin</h1>
          <p className="text-xs text-emerald-800 uppercase tracking-widest font-semibold mt-1">
            Management Portal Login
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="my-auto w-full max-w-sm mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8] shadow-card-soft space-y-5">
          <div className="text-center">
            <h2 className="font-serif text-xl font-bold text-[#0C3B2E]">Admin Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Enter your admin credentials to access controls</p>
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
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@evergreen.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#E6E2D8] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl btn-emerald flex items-center justify-center space-x-2 text-sm font-bold shadow-lg"
            >
              <span>{loading ? "Authenticating Admin..." : "Sign In to Admin"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500">
          Not an administrator?{" "}
          <Link href="/users" className="text-[#0C3B2E] font-bold underline">
            Customer Login
          </Link>
        </div>
      </div>

      {/* Footer info */}
      <div className="pb-6 text-center">
        <p className="text-[11px] text-slate-400">
          Evergreen Restaurant Internal Portal • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
