"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  User,
  ShoppingBag,
  ShieldAlert,
  UtensilsCrossed,
  LogOut,
} from "lucide-react";
import Logo from "./Logo";
import NotificationDropdown from "./NotificationDropdown";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  // If a Staff member is logged in on a customer page, automatically redirect to Staff Portal
  useEffect(() => {
    if (
      user &&
      user.role === "Staff" &&
      !pathname.startsWith("/staff") &&
      !pathname.startsWith("/admin")
    ) {
      router.push("/staff/dashboard");
    }
  }, [user, pathname, router]);

  // Hide main customer navbar on admin pages, staff pages, or auth pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Orders", href: "/orders" },
    { label: "Help", href: "/help" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7FBF8]/90 backdrop-blur-md border-b border-[#0C3B2E]/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo (Evergreen Logo component preserved) */}
        <Logo size="md" showText={true} />

        {/* Center Navigation Links (Clean Botanical Minimal Style) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
          {navLinks.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-1 transition-colors ${
                  isActive
                    ? "text-[#0C3B2E] font-bold"
                    : "hover:text-[#0C3B2E]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0C3B2E] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Search + Notifications + Auth/Profile + Cart */}
        <div className="flex items-center gap-3">
          {/* Search Input Pill */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center bg-white border border-[#0C3B2E]/15 rounded-full px-3.5 py-1.5 w-48 xl:w-56 shadow-2xs focus-within:border-[#0C3B2E] focus-within:ring-2 focus-within:ring-[#0C3B2E]/10 transition"
          >
            <Search className="w-4 h-4 text-[#0C3B2E]/50 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              className="bg-transparent text-xs text-slate-700 placeholder-slate-400 focus:outline-none w-full"
            />
          </form>

          {/* Staff / Admin Portal Quick Links */}
          {(user?.role === "Staff" ||
            (user?.role as string) === "Delivery" ||
            user?.role === "Admin") && (
            <Link
              href="/staff/dashboard"
              className="hidden xl:flex items-center gap-1.5 bg-[#EAF5EF] border border-[#0C3B2E]/15 hover:bg-[#dceee4] text-[#0C3B2E] text-xs font-semibold px-3 py-1.5 rounded-full shadow-2xs transition"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#0C3B2E]" />
              <span>Staff</span>
            </Link>
          )}

          {user?.role === "Admin" && (
            <Link
              href="/admin"
              className="hidden xl:flex items-center gap-1.5 bg-amber-300 hover:bg-amber-400 text-[#0C3B2E] text-xs font-bold px-3 py-1.5 rounded-full shadow-2xs transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          )}

          {/* Notification Bell Dropdown for Logged-In Users */}
          {user && <NotificationDropdown />}

          {/* Sign In Pill or Logged-in User Pill */}
          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/profile"
                className="flex items-center gap-2 bg-white border border-[#0C3B2E]/15 hover:bg-[#EAF5EF]/60 text-slate-700 text-xs font-medium pl-1.5 pr-3 py-1 rounded-full shadow-2xs transition"
              >
                <div className="w-6 h-6 rounded-full bg-[#0C3B2E] text-amber-300 font-bold text-[11px] flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline max-w-[90px] truncate font-semibold text-[#0C3B2E]">
                  {user.name}
                </span>
              </Link>

              <button
                onClick={() => logout()}
                title="Sign Out"
                className="p-2 rounded-full text-slate-500 hover:text-red-600 hover:bg-white transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-white border border-[#0C3B2E]/15 hover:bg-[#EAF5EF] text-[#0C3B2E] text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-2xs transition"
            >
              <User className="w-3.5 h-3.5 text-[#0C3B2E]" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Cart Bag Icon with Forest & Amber Badge */}
          <Link
            href="/cart"
            className="relative p-2 rounded-full text-[#0C3B2E] hover:bg-[#EAF5EF] transition"
            aria-label="Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute top-1 right-0.5 w-4 h-4 rounded-full bg-[#0C3B2E] text-amber-300 text-[10px] font-bold flex items-center justify-center shadow-2xs">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}