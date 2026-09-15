"use client";

import React, { useEffect, useState } from "react";
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
  MoreHorizontal,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import OrderSoundAlertListener from "@/components/staff/OrderSoundAlertListener";
import NotificationDropdown from "@/components/customer/NotificationDropdown";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "Admin")) {
      router.replace(`/admin-login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  // Hide admin content completely while verifying or if not an Admin
  if (loading || !user || user.role !== "Admin") {
    return null;
  }

  const primaryNavItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Menu", href: "/admin/menu", icon: Utensils },
    { label: "Staff", href: "/admin/users", icon: Users },
    { label: "More", href: "#more", icon: MoreHorizontal },
  ];

  const desktopNavItems = [
    ...primaryNavItems.slice(0, 4),
    { label: "Categories", href: "/admin/categories", icon: Grid },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Banners", href: "/admin/banners", icon: ImageIcon },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const moreItems = [
    { label: "Categories", description: "Organize menu sections", href: "/admin/categories", icon: Grid },
    { label: "Coupons", description: "Create and manage offers", href: "/admin/coupons", icon: Tag },
    { label: "Banners", description: "Update promotional banners", href: "/admin/banners", icon: ImageIcon },
    { label: "Notifications", description: "Broadcast customer updates", href: "/admin/notifications", icon: Bell },
    { label: "Settings", description: "Store rules and pricing", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F6]">
      {/* Real-time Order Bell Chime & Toast Alert for Admin */}
      <OrderSoundAlertListener />

      <div className="w-full min-h-screen bg-[#F5F7F6] relative">
      {/* Compact sticky mobile header */}
      <header className="min-h-16 bg-[#0C3B2E] text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-40 shadow-lg border-b border-emerald-800">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white p-0.5 shrink-0 shadow-md">
            <Image
              src="/logo.png"
              alt="Evergreen Logo"
              width={32}
              height={32}
              className="rounded-[10px] object-contain"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-[0.16em]">Store manager</p>
            <h1 className="font-serif text-base sm:text-lg font-bold truncate">Evergreen Restaurant</h1>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <NotificationDropdown dark />
          <Link href="/admin/settings" aria-label="Open profile and settings" className="w-9 h-9 rounded-full bg-amber-300 text-[#0C3B2E] flex items-center justify-center text-sm font-black border-2 border-white/30">
            {(user.name || "A").charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>

      <nav className="hidden md:flex bg-white border-b border-[#E6E2D8] px-4 lg:px-6 py-2 overflow-x-auto no-scrollbar items-center gap-2 sticky top-16 z-30 shadow-sm">
        {desktopNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition ${
                isActive ? "bg-[#0C3B2E] text-white shadow-md" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Floating mobile navigation */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[398px] bg-white/95 backdrop-blur-xl border border-white rounded-2xl px-2 py-2 z-50 shadow-[0_12px_35px_rgba(12,59,46,0.18)] flex md:hidden items-center justify-between">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isMore = item.href === "#more";
          const isActive = isMore ? moreItems.some((moreItem) => pathname.startsWith(moreItem.href)) : item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

          return isMore ? (
            <button
              key={item.label}
              type="button"
              onClick={() => setMoreOpen(true)}
              className={`min-w-[58px] min-h-[48px] px-1 py-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition ${
                isActive ? "bg-[#EAF5EF] text-[#0C3B2E]" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span>{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className={`min-w-[58px] min-h-[48px] px-1 py-1 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-0.5 transition ${
                isActive
                  ? "bg-[#EAF5EF] text-[#0C3B2E]"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="More admin options">
          <button type="button" aria-label="Close more options" onClick={() => setMoreOpen(false)} className="absolute inset-0 bg-slate-950/30" />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5 pb-8 shadow-2xl animate-fadeIn">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Admin tools</p>
                <h2 className="mt-1 font-serif text-xl font-bold text-[#0C3B2E]">More options</h2>
              </div>
              <button type="button" aria-label="Close more options" onClick={() => setMoreOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className="flex min-h-[82px] flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 text-[#0C3B2E] shadow-sm">
                    <Icon className="h-5 w-5 text-emerald-700" />
                    <span><strong className="block text-xs font-extrabold">{item.label}</strong><small className="mt-0.5 block text-[10px] text-slate-500">{item.description}</small></span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 pb-28 md:pb-8 space-y-6 w-full max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
