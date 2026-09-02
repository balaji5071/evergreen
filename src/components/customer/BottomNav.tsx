"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingBag, ClipboardList, User } from "lucide-react";
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
  if (pathname.startsWith("/admin") || pathname.startsWith("/staff") || pathname === "/login" || pathname === "/signup") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E6E2D8] px-2 py-2 flex items-center justify-around shadow-2xl">
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
            className={`flex flex-col items-center justify-center relative py-1 px-3 rounded-full transition-all duration-200 ${
              isActive
                ? "text-[#0C3B2E] font-semibold"
                : "text-slate-500 hover:text-[#0C3B2E]"
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-[#0C3B2E] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
            {isActive && (
              <span className="w-1 h-1 bg-[#0C3B2E] rounded-full mt-0.5 animate-scaleIn" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
