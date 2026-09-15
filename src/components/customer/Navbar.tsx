"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  ClipboardList,
  User,
  HelpCircle,
  ShieldAlert,
  LogOut,
  LogIn,
} from "lucide-react";
import Logo from "./Logo";
import NotificationDropdown from "./NotificationDropdown";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { user, logout } = useAuth();

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const router = useRouter();

  // If a Staff member is logged in on a customer page, automatically redirect to Staff Portal
  useEffect(() => {
    if (user && user.role === "Staff" && !pathname.startsWith("/staff") && !pathname.startsWith("/admin")) {
      router.push("/staff/dashboard");
    }
  }, [user, pathname, router]);

  // Hide main customer navbar on admin pages, staff pages, or auth pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname === "/login" ||
    pathname === "/users" ||
    pathname === "/admin-login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Menu", href: "/menu", icon: UtensilsCrossed },
    { label: "Orders", href: "/orders", icon: ClipboardList },
    { label: "Profile", href: "/profile", icon: User },
    { label: "Help & Support", href: "/help", icon: HelpCircle },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E6E2D8]/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" showText={true} />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all duration-200 ${
                  isActive
                    ? "bg-[#0C3B2E] text-white shadow-sm"
                    : "text-slate-600 hover:text-[#0C3B2E] hover:bg-[#EAF5EF]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Cart Button + User Account */}
        <div className="flex items-center space-x-3">
          {/* Notification Bell Dropdown for Logged-In Users */}
          {user && <NotificationDropdown />}

          {/* Cart Button */}
          <Link
            href="/cart"
            className="relative px-3.5 py-2 rounded-xl bg-[#0C3B2E] text-white text-xs font-bold flex items-center space-x-2 hover:bg-[#07251D] transition-all shadow-sm group"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="bg-white/20 text-amber-200 px-1.5 py-0.5 rounded-md text-[10px]">
                {totalItems}
              </span>
            )}
          </Link>

          {/* Staff / Admin Link */}
          {(user?.role === "Staff" || (user?.role as string) === "Delivery" || user?.role === "Admin") && (
            <Link
              href="/staff/dashboard"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#0C3B2E] text-emerald-200 text-xs font-extrabold hover:bg-emerald-900 transition shadow-sm border border-emerald-700"
            >
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
              <span>Staff Portal</span>
            </Link>
          )}

          {/* Admin Link if User is Admin */}
          {user?.role === "Admin" && (
            <Link
              href="/admin"
              className="hidden lg:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-400 text-slate-900 text-xs font-extrabold hover:bg-amber-500 transition shadow-sm"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Suite</span>
            </Link>
          )}

          {/* User Account Button / Login */}
          {user ? (
            <div className="hidden sm:flex items-center space-x-2 border-l border-[#E6E2D8] pl-3">
              <Link
                href="/profile"
                className="flex items-center space-x-2 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 rounded-full bg-[#0C3B2E] text-amber-300 font-bold text-xs flex items-center justify-center border border-emerald-700 shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-left leading-tight hidden lg:block">
                  <p className="text-xs font-bold text-[#0C3B2E] max-w-[100px] truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500">{user.role || "Customer"}</p>
                </div>
              </Link>

              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#EAF5EF] text-[#0C3B2E] text-xs font-bold hover:bg-[#d5ebd9] transition border border-[#0C3B2E]/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
