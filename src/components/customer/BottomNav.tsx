"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  UtensilsCrossed,
  ShoppingBag,
  ClipboardList,
  User,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Menu", href: "/menu", icon: UtensilsCrossed },
    { label: "Cart", href: "/cart", icon: ShoppingBag, badge: totalItems },
    { label: "Orders", href: "/orders", icon: ClipboardList },
    { label: "Profile", href: "/profile", icon: User },
  ];

  // Hide bottom nav on admin routes, staff routes, or auth pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden px-3 pb-3 pt-1 pointer-events-none">
      <nav
        aria-label="Mobile navigation"
        className="pointer-events-auto max-w-md mx-auto bg-white/95 backdrop-blur-lg border border-gray-200/80 rounded-2xl px-2 py-2 flex items-center justify-around shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group flex flex-col items-center justify-center relative py-1.5 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[#E11D2E] bg-red-50/80 font-semibold"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-active:scale-90 ${
                    isActive ? "stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#E11D2E] text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center shadow-2xs ring-2 ring-white">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {item.label}
              </span>

              {isActive && (
                <span className="absolute -bottom-0.5 w-4 h-0.5 bg-[#E11D2E] rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}