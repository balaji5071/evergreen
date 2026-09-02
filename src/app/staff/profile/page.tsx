"use client";

import React, { useEffect, useState } from "react";
import {
  UserCheck,
  Phone,
  Mail,
  BadgeCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Activity,
  Calendar,
  Award,
  DollarSign,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StaffStats {
  daysWorked: number;
  joiningDate: string;
  totalOrdersDelivered: number;
  totalRevenueCollected: number;
  cancelledOrdersCount: number;
}

export default function StaffProfilePage() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [employeeId, setEmployeeId] = useState(user?.employeeId || "");
  const [dutyStatus, setDutyStatus] = useState<"Available" | "Busy" | "Offline">(
    (user?.dutyStatus as any) || "Available"
  );
  const [stats, setStats] = useState<StaffStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [workHistory, setWorkHistory] = useState<any[]>([]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);
  const [passMessage, setPassMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchProfileStats = async () => {
    try {
      const res = await fetch("/api/staff/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setName(data.user.name || "");
          setPhone(data.user.phone || "");
          setEmployeeId(data.user.employeeId || "");
          setDutyStatus(data.user.dutyStatus || "Available");
        }
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.workHistory) {
          setWorkHistory(data.workHistory);
        }
      }
    } catch (e) {
      console.error("Failed to fetch staff profile stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/staff/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          employeeId,
          dutyStatus,
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Staff profile and availability status updated!" });
        if (refreshUser) refreshUser();
        fetchProfileStats();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || "Failed to update profile" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (newPassword !== confirmPassword) {
      setPassMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPassMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setPassMessage({ type: "success", text: "Password changed successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPassMessage({ type: "error", text: data.message || "Failed to change password." });
      }
    } catch (err: any) {
      setPassMessage({ type: "error", text: err.message || "Network error." });
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E] flex items-center space-x-2">
          <UserCheck className="w-7 h-7 text-emerald-700" />
          <span>Staff Employee Profile</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          View your work metrics, auto-generated Employee ID, and duty status
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center space-x-3 shadow-xs ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      {/* Staff Performance Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Days Worked */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft">
          <div className="flex items-center space-x-2 text-emerald-800 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase">Days Worked</span>
          </div>
          <p className="text-3xl font-extrabold text-[#0C3B2E]">
            {stats ? stats.daysWorked : 1}{" "}
            <span className="text-xs font-normal text-slate-500">Days</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Joined: {stats?.joiningDate || "Today"}</p>
        </div>

        {/* Orders Delivered */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft">
          <div className="flex items-center space-x-2 text-purple-800 mb-1">
            <PackageCheck className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase">Delivered</span>
          </div>
          <p className="text-3xl font-extrabold text-[#0C3B2E]">
            {stats ? stats.totalOrdersDelivered : 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Completed orders</p>
        </div>

        {/* Total Revenue Handled */}
        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft">
          <div className="flex items-center space-x-2 text-amber-800 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase">Cash Collected</span>
          </div>
          <p className="font-serif text-2xl font-extrabold text-[#0C3B2E]">
            ₹{stats ? stats.totalRevenueCollected : 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Total revenue handled</p>
        </div>

        {/* Employee ID Badge */}
        <div className="bg-[#0C3B2E] text-white p-5 rounded-3xl border border-emerald-800 shadow-md">
          <div className="flex items-center space-x-2 text-emerald-300 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs font-extrabold uppercase">Employee ID</span>
          </div>
          <p className="font-mono text-xl font-black text-amber-300 tracking-wider">
            {employeeId || "EMP-1001"}
          </p>
          <p className="text-[10px] text-emerald-200 mt-1">Auto-assigned ID</p>
        </div>
      </div>

      {/* Profile & Duty Form */}
      <form
        onSubmit={handleUpdate}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E2D8] shadow-card-soft space-y-6"
      >
        {/* Duty Status Selector Card */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>Active Duty Availability Status</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                id: "Available",
                label: "Available",
                desc: "Ready for orders",
                color: "bg-emerald-50 border-emerald-500 text-emerald-900",
              },
              {
                id: "Busy",
                label: "Busy",
                desc: "Currently prepping",
                color: "bg-amber-50 border-amber-500 text-amber-900",
              },
              {
                id: "Offline",
                label: "Offline",
                desc: "Off duty / Break",
                color: "bg-slate-100 border-slate-400 text-slate-700",
              },
            ].map((st) => {
              const isSelected = dutyStatus === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setDutyStatus(st.id as any)}
                  className={`p-3 sm:p-4 rounded-2xl border text-left transition cursor-pointer ${
                    isSelected
                      ? `${st.color} ring-2 ring-[#0C3B2E] font-bold`
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <p className="text-xs font-black">{st.label}</p>
                  <p className="text-[10px] opacity-80 mt-0.5">{st.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile Inputs */}
        <div className="space-y-4 pt-2 border-t border-[#E6E2D8]/80 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase flex items-center space-x-1">
                <BadgeCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Employee ID (Auto-Generated)</span>
              </label>
              <input
                type="text"
                readOnly
                value={employeeId}
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-100 font-mono text-sm font-black text-[#0C3B2E] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address (Read-only)</span>
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-100 text-sm font-bold text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl btn-emerald text-xs font-extrabold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Update Availability & Profile"}</span>
          </button>
        </div>
      </form>

      {/* FEATURE: Working Days & Attendance History Log */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E2D8] shadow-card-soft space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              <span>Working Days History & Duty Log</span>
            </h3>
            <p className="text-xs text-slate-500">
              Complete date-by-date record of attendance, duty shifts, and orders fulfilled
            </p>
          </div>
          <span className="text-xs font-extrabold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
            {workHistory.length} Days Recorded
          </span>
        </div>

        {workHistory.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No working history records found.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
            {workHistory.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#0C3B2E] text-sm">{item.formattedDate}</p>
                  <p className="text-[10px] text-slate-500">
                    Shift Duration: <strong className="text-slate-700">{item.dutyHours} Hours</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-900">
                      {item.ordersHandled} Orders Handled
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {item.revenue > 0 ? `₹${item.revenue} Revenue` : "No direct dispatch"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${
                      item.status === "Available" || item.status === "Shift Completed" || item.status === "Present"
                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}
                  >
                    ● {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FEATURE: Change Password Form */}
      <div id="password" className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E2D8] shadow-card-soft space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
          <BadgeCheck className="w-5 h-5 text-amber-600" />
          <span>Change Account Password</span>
        </h3>
        <p className="text-xs text-slate-500">Update your security password for staff portal login</p>

        {passMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold ${
              passMessage.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-300"
                : "bg-red-50 text-red-900 border border-red-300"
            }`}
          >
            {passMessage.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPass}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl btn-emerald text-xs font-extrabold shadow-md cursor-pointer"
            >
              {changingPass ? "Updating Password..." : "Update Staff Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
