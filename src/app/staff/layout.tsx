"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  History,
  UserCheck,
  LogOut,
  ChevronDown,
  Tag,
  ImageIcon,
  Utensils,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import OrderSoundAlertListener from "@/components/staff/OrderSoundAlertListener";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // All Hooks must run unconditionally BEFORE any early return
  useEffect(() => {
    if (pathname === "/staff" || pathname === "/staff/login") return;
    if (!loading && (!user || (user.role !== "Staff" && user.role !== "Admin"))) {
      router.push("/staff");
    }
  }, [user, loading, router, pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Early return for login route (SAFE because all hooks have executed)
  if (pathname === "/staff" || pathname === "/staff/login") {
    return <>{children}</>;
  }

  if (loading || !user || (user.role !== "Staff" && user.role !== "Admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5]">
        <div className="w-10 h-10 border-4 border-[#0C3B2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Permission check helper
  const hasPermission = (perm: string) => {
    if (user.role === "Admin") return true;
    if (!user.permissions || !Array.isArray(user.permissions)) return false;
    return user.permissions.includes(perm);
  };

  const allNavItems = [
    { label: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard, requiredPerm: null },
    { label: "Active Orders", href: "/staff/orders", icon: UtensilsCrossed, requiredPerm: "orders" },
    { label: "Order History", href: "/staff/history", icon: History, requiredPerm: "orders" },
    { label: "Coupons", href: "/admin/coupons", icon: Tag, requiredPerm: "coupons" },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon, requiredPerm: "banners" },
    { label: "Menu Items", href: "/admin/menu", icon: Utensils, requiredPerm: "menu" },
    { label: "Staff Profile", href: "/staff/profile", icon: UserCheck, requiredPerm: null },
  ];

  const navItems = allNavItems.filter(
    (item) => !item.requiredPerm || hasPermission(item.requiredPerm)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] pb-16 md:pb-0">
      {/* Real-time Loud Kitchen Bell Sound & Toast Alert for Staff */}
      <OrderSoundAlertListener />

      {/* Top Header for Staff Portal */}
      <header className="bg-[#0C3B2E] text-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-lg border-b border-emerald-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shrink-0 shadow-md">
            <Image
              src="/logo.png"
              alt="Evergreen Logo"
              width={36}
              height={36}
              className="rounded-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold flex items-center space-x-2">
              <span>Evergreen Staff</span>
              <span className="text-[10px] bg-emerald-700/80 px-2 py-0.5 rounded-full font-sans uppercase font-bold tracking-wider text-emerald-200">
                {user.role}
              </span>
            </h1>
            <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-semibold">
              Kitchen & Operations Portal
            </p>
          </div>
        </div>

        {/* User Profile Badge & Hidden Logout Menu */}
        <div className="relative flex items-center space-x-2" ref={menuRef}>
          {user.role === "Admin" && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-full bg-emerald-700/60 text-emerald-100 text-xs font-bold hover:bg-emerald-700 transition"
            >
              Admin Panel
            </Link>
          )}

          {/* Trigger button for user profile dropdown */}
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-100 transition cursor-pointer border border-emerald-700/60"
          >
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[11px]">
              {user.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <span className="hidden sm:inline font-bold">{user.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
          </button>

          {/* Hidden Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-2xl border border-[#E6E2D8] py-2 z-50 text-slate-800 animate-scaleIn">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-[#0C3B2E] truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                {user.employeeId && (
                  <span className="inline-block mt-1 text-[9px] font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                    {user.employeeId}
                  </span>
                )}
              </div>

              <Link
                href="/staff/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold hover:bg-emerald-50 text-slate-700 hover:text-[#0C3B2E] transition"
              >
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>Staff Profile</span>
              </Link>

              <Link
                href="/staff/profile#password"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold hover:bg-emerald-50 text-slate-700 hover:text-[#0C3B2E] transition"
              >
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span>Change Password</span>
              </Link>

              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Staff Top Navigation Bar (Desktop & Tablet) */}
      <nav className="hidden md:flex bg-white border-b border-[#E6E2D8] px-4 py-2 overflow-x-auto no-scrollbar items-center space-x-2 sticky top-[65px] z-30 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/staff/dashboard"
              ? pathname === "/staff/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 transition ${
                isActive
                  ? "bg-[#0C3B2E] text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Staff Portal Content */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">{children}</main>

      {/* Staff Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#E6E2D8] px-3 py-2 z-40 flex items-center justify-around shadow-2xl">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/staff/dashboard"
              ? pathname === "/staff/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                isActive ? "text-[#0C3B2E] font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-[#0C3B2E] scale-110" : ""}`} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
