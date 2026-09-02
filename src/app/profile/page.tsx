"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
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
          <div className="h-20 bg-slate-200 animate-pulse rounded-3xl mt-6" />
          <div className="h-40 bg-slate-200 animate-pulse rounded-3xl mt-4" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 flex flex-col pb-24 md:pb-12 bg-[#FAF8F5]">
        <header className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">Profile</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 px-6 space-y-4 bg-white rounded-3xl border border-[#E6E2D8] max-w-lg mx-auto shadow-card-soft">
            <div className="w-20 h-20 rounded-full bg-[#EAF5EF] text-[#0C3B2E] flex items-center justify-center mx-auto text-3xl shadow-sm">
              👤
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#0C3B2E]">Sign in to your profile</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Log in to manage saved addresses, track active orders, and customize preferences.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-3.5 rounded-2xl btn-emerald text-sm font-bold shadow-lg hover:shadow-xl transition"
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
    <div className="flex-1 flex flex-col pb-36 md:pb-12 bg-[#FAF8F5]">
      {/* Header Container */}
      <header className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
              Account Profile
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage personal information, addresses, and settings
            </p>
          </div>

          {user.role === "Admin" && (
            <Link
              href="/admin"
              className="px-4 py-2 rounded-full bg-[#0C3B2E] text-amber-300 text-xs font-bold shadow-md hover:bg-[#082920] transition"
            >
              Admin Panel
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: User Card & Stats (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* User Details Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft flex items-center space-x-5">
              <div className="w-20 h-20 rounded-full bg-[#0C3B2E] text-amber-300 flex items-center justify-center font-serif text-3xl font-bold border-4 border-emerald-700 shrink-0 shadow-md">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-serif text-2xl font-bold text-[#0C3B2E] truncate">
                  {user.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">{user.email}</p>
                <ChangePhoneInline phone={user.phone} onUpdated={refreshUser} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0C3B2E] text-white p-5 rounded-3xl shadow-md flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Package className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.ordersCount}</p>
                  <p className="text-xs text-emerald-100 font-medium">Total Orders</p>
                </div>
              </div>

              <div className="bg-[#EAF5EF] text-[#0C3B2E] p-5 rounded-3xl border border-emerald-200 flex items-center space-x-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <MapPin className="w-6 h-6 text-[#0C3B2E]" />
                </div>
                <div>
                  <p className="text-2xl font-black">{stats.addressesCount}</p>
                  <p className="text-xs text-slate-600 font-medium">Saved Addresses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Navigation (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Account Settings List */}
            <div className="bg-white rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E6E2D8]/60 bg-slate-50/50">
                <h3 className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
                  Account Management
                </h3>
              </div>

              <div className="divide-y divide-[#E6E2D8]/50">
                <Link
                  href="/profile/addresses"
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Saved Delivery Addresses</p>
                      <p className="text-xs text-slate-500">Manage hostel, home, or office addresses</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Notifications & Support */}
            <div className="bg-white rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
                Preferences & Support
              </h3>

              <PushNotificationPrompt />

              <Link
                href="/help"
                className="w-full p-4 rounded-2xl border border-[#E6E2D8] flex items-center justify-between hover:bg-slate-50 transition text-slate-800 cursor-pointer"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Help & Support</p>
                    <p className="text-xs text-slate-500">FAQs, customer support, and inquiry desk</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
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
        className="flex items-center space-x-1.5 mt-1 group cursor-pointer"
      >
        <Phone className="w-3.5 h-3.5 text-emerald-700" />
        <span className="text-xs text-emerald-800 font-extrabold">{phone || "Add phone"}</span>
        <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex items-center space-x-1.5">
        <input
          type="tel"
          value={newPhone}
          onChange={(e) => setNewPhone(e.target.value)}
          placeholder="Enter new phone"
          autoFocus
          maxLength={13}
          className="w-36 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-emerald-300 bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition cursor-pointer"
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
    <div className="bg-white rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft overflow-hidden">
      {/* Toggle Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
      >
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-slate-800">Security & Account</p>
            <p className="text-xs text-slate-500">Password, logout, and account actions</p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      {/* Collapsible Content */}
      {expanded && (
        <div className="px-6 pb-6 space-y-5 border-t border-[#E6E2D8]/50 pt-5 animate-in slide-in-from-top-2 duration-200">
          {/* Change Password Form */}
          <ChangePasswordCard />

          {/* Logout with Confirmation */}
          {!showLogoutConfirm ? (
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-3.5 rounded-2xl bg-red-50 text-red-600 font-extrabold text-sm flex items-center justify-center space-x-2 border border-red-200 hover:bg-red-100 transition cursor-pointer shadow-xs"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out Account</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-300 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-sm font-bold text-red-800">Are you sure you want to sign out?</p>
              </div>
              <p className="text-xs text-red-600">
                You'll need to log in again to access your orders and saved addresses.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => logout()}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition cursor-pointer"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white text-slate-700 font-bold text-xs border border-slate-300 hover:bg-slate-100 transition cursor-pointer"
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
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setStatus({ type: "error", text: "Password must be at least 6 characters long." });
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
        setStatus({ type: "error", text: data.message || "Failed to update password." });
      }
    } catch (err: any) {
      setStatus({ type: "error", text: err.message || "Network error." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700" />
        <span>Change Password</span>
      </h4>

      {status && (
        <div
          className={`p-3 rounded-xl text-xs font-bold ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
              : "bg-red-50 text-red-900 border border-red-300"
          }`}
        >
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-700 uppercase">Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 uppercase">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl btn-emerald font-extrabold shadow-sm transition cursor-pointer"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
