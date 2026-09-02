"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Mail,
  Phone,
  Plus,
  UtensilsCrossed,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Award,
  PackageCheck,
  DollarSign,
  Trash2,
  ShieldCheck,
  Sliders,
} from "lucide-react";

const ALL_PERMISSIONS = [
  { id: "orders", label: "Orders & Dispatch", desc: "Manage kitchen orders and delivery status" },
  { id: "coupons", label: "Coupons & Discounts", desc: "Create, view, and manage promotional offers" },
  { id: "banners", label: "Banners & Promos", desc: "Update homepage promotional banners" },
  { id: "menu", label: "Menu & Categories", desc: "Update menu items, pricing, and availability" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Create Staff Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"Admin" | "Staff">("Staff");
  const [permissions, setPermissions] = useState<string[]>(["orders", "coupons", "banners", "menu"]);
  const [creating, setCreating] = useState(false);

  // Edit Permissions Modal State
  const [editingPermissionsUser, setEditingPermissionsUser] = useState<any | null>(null);
  const [editPermissionsList, setEditPermissionsList] = useState<string[]>([]);
  const [updatingPerms, setUpdatingPerms] = useState(false);

  // Delete User State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePermissionInCreate = (permId: string) => {
    setPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const togglePermissionInEdit = (permId: string) => {
    setEditPermissionsList((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
          role,
          permissions: role === "Admin" ? ["orders", "coupons", "banners", "menu"] : permissions,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `New ${role} member created successfully! Auto Employee ID: ${data.user?.employeeId || "Assigned"}`,
        });
        setShowModal(false);
        // Reset Form
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setRole("Staff");
        setPermissions(["orders", "coupons", "banners", "menu"]);
        fetchUsers();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to create staff account." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error while creating account." });
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPermissionsUser) return;
    setUpdatingPerms(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingPermissionsUser._id,
          permissions: editPermissionsList,
        }),
      });

      if (res.ok) {
        setMessage({
          type: "success",
          text: `Updated permissions for ${editingPermissionsUser.name}!`,
        });
        setEditingPermissionsUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.message || "Failed to update permissions." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error updating permissions." });
    } finally {
      setUpdatingPerms(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      console.error("Role update failed:", err);
    }
  };

  const handleDeleteUser = async (userToDelete: any) => {
    if (
      !confirm(
        `Are you sure you want to delete staff account "${userToDelete.name}" (${userToDelete.email})? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(userToDelete._id);
    try {
      const res = await fetch(`/api/admin/users?id=${userToDelete._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `User "${userToDelete.name}" deleted successfully!` });
        fetchUsers();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to delete user." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Error deleting user account." });
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRoleFilter === "All" || u.role === selectedRoleFilter;
    const matchesSearch =
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone?.includes(searchQuery) ||
      u.employeeId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
            Staff & User Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Manage staff accounts, assign granular section permissions, track Employee IDs & working days history
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl btn-emerald text-xs font-extrabold shadow-md flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Staff Member</span>
        </button>
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

      {/* Role Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {["All", "Staff", "Admin", "Customer"].map((r) => {
            const count = r === "All" ? users.length : users.filter((u) => u.role === r).length;
            const isSelected = selectedRoleFilter === r;

            return (
              <button
                key={r}
                onClick={() => setSelectedRoleFilter(r)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? "bg-[#0C3B2E] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{r === "Staff" ? "🍳 Staff Members" : r === "Admin" ? "👑 Admin" : r === "Customer" ? "👤 Customers" : "All Accounts"}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isSelected ? "bg-emerald-800 text-amber-300" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, or EMP-ID..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
        </div>
      </div>

      {/* Users List with Permissions & Actions */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E6E2D8] p-6">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="font-serif text-lg font-bold text-[#0C3B2E]">No users found</h4>
          <p className="text-xs text-slate-500">Try selecting another role filter or clear search query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft overflow-hidden">
          <div className="divide-y divide-[#E6E2D8]/50">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition"
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-xs mt-0.5 ${
                      u.role === "Admin"
                        ? "bg-amber-400 text-slate-950"
                        : u.role === "Staff"
                        ? "bg-teal-700 text-white"
                        : "bg-[#0C3B2E] text-amber-300"
                    }`}
                  >
                    {u.role === "Staff" ? (
                      <UtensilsCrossed className="w-5 h-5" />
                    ) : u.name ? (
                      u.name.charAt(0).toUpperCase()
                    ) : (
                      "U"
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h4 className="font-bold text-base text-[#0C3B2E]">{u.name}</h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "Admin"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : u.role === "Staff"
                            ? "bg-teal-100 text-teal-900 border border-teal-300"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>

                      {u.employeeId && (
                        <span className="font-mono text-[11px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {u.employeeId}
                        </span>
                      )}

                      {u.dutyStatus && u.role !== "Customer" && (
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            u.dutyStatus === "Available"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : u.dutyStatus === "Busy"
                              ? "bg-amber-50 text-amber-800 border-amber-300"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          ● {u.dutyStatus}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.email}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.phone}</span>
                      </span>
                    </p>

                    {/* Staff Metrics & Assigned Permissions */}
                    {u.role !== "Customer" && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center space-x-4 text-xs text-slate-700 font-medium">
                          <span className="flex items-center space-x-1 text-emerald-800">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Worked: <strong>{u.daysWorked || 1} Days</strong></span>
                          </span>

                          <span className="flex items-center space-x-1 text-purple-800">
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Orders Handled: <strong>{u.totalOrdersDelivered || 0}</strong></span>
                          </span>

                          <span className="flex items-center space-x-1 text-amber-800">
                            <DollarSign className="w-3.5 h-3.5" />
                            <span>Revenue: <strong>₹{u.totalRevenueCollected || 0}</strong></span>
                          </span>
                        </div>

                        {/* Permissions Tags */}
                        {u.role === "Staff" && (
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 pt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Permissions:
                            </span>
                            {(u.permissions && u.permissions.length > 0
                              ? u.permissions
                              : ["orders", "coupons", "banners", "menu"]
                            ).map((p: string) => (
                              <span
                                key={p}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 uppercase"
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions & Role Switcher */}
                <div className="flex items-center space-x-2.5 self-start md:self-center">
                  {u.role === "Staff" && (
                    <button
                      onClick={() => {
                        setEditingPermissionsUser(u);
                        setEditPermissionsList(u.permissions || ["orders", "coupons", "banners", "menu"]);
                      }}
                      className="px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition flex items-center space-x-1 cursor-pointer"
                      title="Manage Staff Access Permissions"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Permissions</span>
                    </button>
                  )}

                  <div className="flex items-center space-x-1.5">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="px-3 py-2 rounded-xl border border-[#E6E2D8] bg-white text-xs font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E] cursor-pointer shadow-xs"
                    >
                      <option value="Customer">Customer</option>
                      <option value="Staff">Kitchen Staff</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteUser(u)}
                    disabled={deletingId === u._id}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition cursor-pointer"
                    title="Delete User Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Create New Staff Member */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 border border-[#E6E2D8] animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0C3B2E]">
                  Create Staff or Admin Account
                </h3>
                <p className="text-xs text-slate-500">
                  Admin cannot create customer accounts. Only Staff or Admin creation is permitted.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Account Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                >
                  <option value="Staff">🍳 Kitchen & Operations Staff</option>
                  <option value="Admin">👑 System Administrator</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@evergreen.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 12345"
                    className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Account Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                />
              </div>

              {/* Granular Permissions Controls (if role is Staff) */}
              {role === "Staff" && (
                <div className="space-y-2 pt-2 border-t border-[#E6E2D8]">
                  <label className="font-bold text-[#0C3B2E] uppercase flex items-center justify-between">
                    <span>Assign Granular Staff Access Permissions</span>
                    <span className="text-[10px] text-slate-400 font-normal">Select permitted tabs</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {ALL_PERMISSIONS.map((perm) => {
                      const isChecked = permissions.includes(perm.id);
                      return (
                        <label
                          key={perm.id}
                          onClick={() => togglePermissionInCreate(perm.id)}
                          className={`p-3 rounded-xl border flex items-start space-x-2.5 transition cursor-pointer select-none ${
                            isChecked
                              ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 accent-[#0C3B2E]"
                          />
                          <div>
                            <p className="text-xs">{perm.label}</p>
                            <p className="text-[10px] text-slate-500 font-normal">{perm.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-xl btn-emerald font-extrabold shadow-md cursor-pointer"
                >
                  {creating ? "Creating Account..." : `Create ${role} Member`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Staff Access Permissions */}
      {editingPermissionsUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-[#E6E2D8] animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#0C3B2E]">
                  Edit Permissions for {editingPermissionsUser.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Control which portal modules this staff member can access
                </p>
              </div>
              <button
                onClick={() => setEditingPermissionsUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePermissions} className="space-y-4 text-xs">
              <div className="space-y-2">
                {ALL_PERMISSIONS.map((perm) => {
                  const isChecked = editPermissionsList.includes(perm.id);
                  return (
                    <label
                      key={perm.id}
                      onClick={() => togglePermissionInEdit(perm.id)}
                      className={`p-3 rounded-xl border flex items-start space-x-3 transition cursor-pointer select-none ${
                        isChecked
                          ? "bg-emerald-50 border-emerald-400 text-emerald-950 font-bold"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="mt-0.5 accent-[#0C3B2E]"
                      />
                      <div>
                        <p className="text-xs">{perm.label}</p>
                        <p className="text-[10px] text-slate-500 font-normal">{perm.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPermissionsUser(null)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPerms}
                  className="flex-1 py-3 rounded-xl btn-emerald font-extrabold shadow-md cursor-pointer"
                >
                  {updatingPerms ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
