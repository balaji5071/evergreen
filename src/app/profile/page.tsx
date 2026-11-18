"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Package,
  Phone,
  Pencil,
  Check,
  X,
  Lock,
  AlertTriangle,
} from "lucide-react";
import BottomNav from "@/components/customer/BottomNav";
import { useAuth } from "@/context/AuthContext";
import PushNotificationPrompt from "@/components/customer/PushNotificationPrompt";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, loading, refreshUser } = useAuth();
  const [stats, setStats] = useState({ ordersCount: 0, addressesCount: 0 });

  useEffect(() => {
    if (user) {
      Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/addresses").then((r) => r.json()),
      ])
        .then(([ordersData, addressesData]) => {
          setStats({
            ordersCount: (ordersData.allOrders || []).length,
            addressesCount: (addressesData || []).length,
          });
        })
        .catch(() => {});
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-6 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div className="h-20 bg-white border border-[#0C3B2E]/10 animate-pulse rounded-3xl mt-6" />
          <div className="h-44 bg-white border border-[#0C3B2E]/10 animate-pulse rounded-3xl mt-4" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col pb-24 md:pb-12 bg-[#FAF8F5] text-slate-900 font-sans">
        <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
              Profile
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 px-6 space-y-4 bg-white rounded-3xl border border-[#0C3B2E]/10 max-w-lg mx-auto shadow-2xs">
            <div className="w-20 h-20 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/10 text-[#0C3B2E] flex items-center justify-center mx-auto text-3xl shadow-2xs">
              👤
            </div>
            <h2 className="text-2xl font-bold text-[#0C3B2E]">
              Sign in to your profile
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
              Log in to manage saved addresses, track active orders, and customize preferences.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-3.5 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white text-sm font-semibold shadow-sm transition"
              >
                Sign In / Sign Up
              </Link>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-36 md:pb-16 bg-[#FAF8F5] text-slate-900 font-sans">
      {/* Header Container matching Evergreen Botanical Sage & Cream Theme */}
      <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
              Account Profile
            </h1>
            <p className="text-xs text-slate-600">
              Manage personal information, addresses, and settings
            </p>
          </div>

          {user.role === "Admin" && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-amber-300 text-xs font-bold shadow-2xs transition"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: User Card & Stats (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* User Details Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-[#0C3B2E] text-amber-300 flex items-center justify-center text-3xl font-extrabold ring-4 ring-[#EAF5EF] shrink-0 shadow-2xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-[#0C3B2E] truncate">
                  {user.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
                  {user.email}
                </p>
                <ChangePhoneInline phone={user.phone} onUpdated={refreshUser} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#0C3B2E] to-[#155240] text-white p-5 rounded-3xl shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold">{stats.ordersCount}</p>
                  <p className="text-xs text-emerald-100/85 font-medium">
                    Total Orders
                  </p>
                </div>
              </div>

              <div className="bg-white text-[#0C3B2E] p-5 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#0C3B2E]" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold">{stats.addressesCount}</p>
                  <p className="text-xs text-slate-600 font-medium">
                    Saved Addresses
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Navigation (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Account Settings List */}
            <div className="bg-white rounded-3xl border border-[#0C3B2E]/10 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-[#0C3B2E]/10 bg-[#F7FBF8]">
                <h3 className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
                  Account Management
                </h3>
              </div>

              <div className="divide-y divide-[#0C3B2E]/10">
                <Link
                  href="/profile/addresses"
                  className="px-6 py-4 flex items-center justify-between hover:bg-[#EAF5EF]/50 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center group-hover:bg-[#0C3B2E] group-hover:text-amber-300 transition-colors shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0C3B2E]">
                        Saved Delivery Addresses
                      </p>
                      <p className="text-xs text-slate-500">
                        Manage hostel, home, or office addresses
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0C3B2E] transition-colors" />
                </Link>
              </div>
            </div>

            {/* Notifications & Support */}
            <div className="bg-white rounded-3xl border border-[#0C3B2E]/10 shadow-2xs p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
                Preferences &amp; Support
              </h3>

              <PushNotificationPrompt />

              <Link
                href="/help"
                className="w-full p-4 rounded-2xl border border-[#0C3B2E]/15 bg-[#FAF8F5] flex items-center justify-between hover:bg-[#EAF5EF]/60 hover:border-[#0C3B2E]/25 transition text-slate-800 cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center group-hover:bg-[#0C3B2E] group-hover:text-amber-300 transition-colors shrink-0">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0C3B2E]">
                      Help &amp; Support
                    </p>
                    <p className="text-xs text-slate-500">
                      FAQs, customer support, and inquiry desk
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-[#0C3B2E] transition-colors" />
              </Link>
            </div>

            {/* Security & Account (Collapsible) */}
            <SecuritySection logout={logout} />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

/* ─── Inline Change Phone Number ─── */
function ChangePhoneInline({
  phone,
  onUpdated,
}: {
  phone: string;
  onUpdated: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [newPhone, setNewPhone] = useState(phone || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    const sanitized = newPhone.replace(/[^0-9]/g, "");
    if (sanitized.length < 10) {
      setError("Min 10 digits required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPhone: sanitized }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditing(false);
        setNewPhone(data.phone);
        await onUpdated();
      } else {
        setError(data.message || "Failed to update");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setNewPhone(phone || "");
    setError("");
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 hover:bg-[#dceee4] transition group cursor-pointer"
      >
        <Phone className="w-3 h-3 text-[#0C3B2E]" />
        <span className="text-xs text-[#0C3B2E] font-bold">
          {phone || "Add phone"}
        </span>
        <Pencil className="w-3 h-3 text-[#0C3B2E]/60 group-hover:text-[#0C3B2E] transition-colors" />
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-1.5">
        <input
          type="tel"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="Enter new phone"
          autoFocus
          maxLength={13}
          className="w-36 px-3 py-1.5 text-xs font-semibold rounded-full border border-[#0C3B2E]/25 bg-[#FAF8F5] text-slate-800 focus:outline-none focus:bg-white focus:border-[#0C3B2E]"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-7 h-7 rounded-full bg-[#0C3B2E] text-white hover:bg-[#145341] flex items-center justify-center transition cursor-pointer disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCancel}
          className="w-7 h-7 rounded-full bg-[#EAF5EF] text-[#0C3B2E] hover:bg-[#dceee4] flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {error && <p className="text-[10px] text-red-600 font-bold">{error}</p>}
    </div>
  );
}

/* ─── Collapsible Security Section: Change Password + Logout ─── */
function SecuritySection({ logout }: { logout: () => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-[#0C3B2E]/10 shadow-2xs overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#EAF5EF]/40 transition cursor-pointer"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-amber-300/35 border border-amber-400/50 text-[#0C3B2E] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-[#0C3B2E]">
              Security &amp; Account
            </p>
            <p className="text-xs text-slate-500">
              Password, logout, and account actions
            </p>
          </div>
        </div>
        <span className="w-8 h-8 rounded-full bg-[#EAF5EF] text-[#0C3B2E] flex items-center justify-center">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </span>
      </button>

      {/* Collapsible Content */}
      {expanded && (
        <div className="px-6 pb-6 space-y-5 border-t border-[#0C3B2E]/10 pt-5 animate-in slide-in-from-top-2 duration-200">
          {/* Change Password Form */}
          <ChangePasswordCard />

          {/* Logout with Confirmation */}
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3.5 rounded-full bg-red-50 text-red-600 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-red-200 hover:bg-red-100 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out Account</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-sm font-bold text-red-800">
                  Are you sure you want to sign out?
                </p>
              </div>
              <p className="text-xs text-red-600">
                You&apos;ll need to log in again to access your orders and saved addresses.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => logout()}
                  className="flex-1 py-2.5 rounded-full bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition cursor-pointer"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-full bg-white text-slate-700 font-bold text-xs border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Change Password Sub-Card ─── */
function ChangePasswordCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({
        type: "error",
        text: "Password must be at least 6 characters long.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", text: "Password updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setStatus({
          type: "error",
          text: data.message || "Failed to update password.",
        });
      }
    } catch (err: any) {
      setStatus({ type: "error", text: err.message || "Network error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#0C3B2E]" />
        <span>Change Password</span>
      </h4>

      {status && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold ${
            status.type === "success"
              ? "bg-[#EAF5EF] text-[#0C3B2E] border border-[#0C3B2E]/20"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-[#0C3B2E] uppercase">
            Current Password
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full px-4 py-2.5 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="font-bold text-[#0C3B2E] uppercase">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-[#0C3B2E] uppercase">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-4 py-2.5 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-[#0C3B2E] hover:bg-[#145341] disabled:opacity-60 text-white font-semibold shadow-2xs transition cursor-pointer"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}