"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  Grid,
  Tag,
  Image as ImageIcon,
  Bell,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import OrderSoundAlertListener from "@/components/staff/OrderSoundAlertListener";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "Admin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Hide admin content completely while verifying or if not an Admin
  if (loading || !user || user.role !== "Admin") {
    return null;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Menu Items", href: "/admin/menu", icon: Utensils },
    { label: "Categories", href: "/admin/categories", icon: Grid },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Users & Staff", href: "/admin/users", icon: Users },
    { label: "Store Rules & Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Real-time Order Bell Chime & Toast Alert for Admin */}
      <OrderSoundAlertListener />

      {/* Top Admin Navigation Header */}
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
            <h1 className="font-serif text-lg font-bold">Evergreen Admin</h1>
            <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-semibold">
              Management Suite
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold hover:bg-white/20 transition flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Store Front</span>
          </Link>

          <button
            onClick={() => logout()}
            className="p-2 rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Module Navigation Bar */}
      <nav className="bg-white border-b border-[#E6E2D8] px-4 py-2 overflow-x-auto no-scrollbar flex items-center space-x-2 sticky top-[65px] z-30 shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3.5 py-[#0C3B2E] rounded-xl text-xs font-bold whitespace-nowrap flex items-center space-x-2 transition ${
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

      {/* Main Admin Body */}
      <main className="flex-1 p-5 space-y-6 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
