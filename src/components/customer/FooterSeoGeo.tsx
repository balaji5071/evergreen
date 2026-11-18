"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  Truck,
  UtensilsCrossed,
  Heart,
  Navigation,
  ArrowUpRight,
} from "lucide-react";
import Logo from "./Logo";

export default function FooterSeoGeo() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Don't show footer on admin, staff, auth, or cart pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/cart" ||
    pathname.startsWith("/checkout")
  ) {
    return null;
  }

  if (!mounted) return null;

  const quickLinks = [
    { label: "Home & Highlights", href: "/" },
    { label: "Explore Menu & Dishes", href: "/menu" },
    { label: "Track Active Order", href: "/orders" },
    { label: "Help Center & FAQs", href: "/help" },
    { label: "Customer Login / Signup", href: "/login" },
  ];

  const popularKeywords = [
    "North Indian Thali",
    "Paneer Butter Masala",
    "Crispy Butter Naan",
    "Chicken Biryani Ambagarh Chowki",
    "Veg Hakka Noodles",
    "Manchurian Dry",
    "Cold Coffee & Shakes",
    "Cheese Burger",
    "Hot Masala Tea",
    "Gulab Jamun",
    "Late Night Delivery Ambagarh Chowki",
    "Best Family Restaurant Rajnandgaon",
  ];

  return (
    <footer className="bg-gradient-to-b from-[#F7FBF8] to-[#E6F2EB] text-slate-800 pt-14 pb-28 md:pb-12 border-t border-[#0C3B2E]/10 mt-16 relative overflow-hidden">
      {/* Subtle Decorative Botanical Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0C3B2E]/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-300/[0.12] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Top Grid Section: Brand Info + Quick Links + Local GEO Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Brand & Local Bio (Cols 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center">
              <Logo size="md" showText={true} />
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
              Evergreen Cafe &amp; Restaurant is Ambagarh Chowki&apos;s premier dining and food delivery destination located at Nisha Complex, Ravan Gali. We craft authentic North Indian, Chinese, Fast Food, and refreshing beverages using fresh ingredients daily.
            </p>

            {/* Quick Geo Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#0C3B2E] text-[11px] font-semibold border border-[#0C3B2E]/15 shadow-2xs">
                <MapPin className="w-3.5 h-3.5 text-[#0C3B2E]" />
                <span>Ambagarh Chowki, CG - 491665</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#0C3B2E] text-[11px] font-semibold border border-[#0C3B2E]/15 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#0C3B2E]" />
                <span>Open Daily: 10 AM - 10:30 PM</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-300/40 text-[#0C3B2E] text-[11px] font-bold border border-amber-400/50">
                <Truck className="w-3.5 h-3.5 text-[#0C3B2E]" />
                <span>Free Delivery &gt; ₹300</span>
              </span>
            </div>
          </div>

          {/* Quick Navigation Links (Cols 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
              Quick Navigation
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 font-medium">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 hover:text-[#0C3B2E] hover:font-semibold transition-all"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all text-[#0C3B2E]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Local GEO & Contact Card (Cols 4) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#EAF5EF] flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4 text-[#0C3B2E]" />
              </div>
              <h3 className="text-sm font-bold text-[#0C3B2E]">
                Exact Location &amp; Delivery Zone
              </h3>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#0C3B2E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 block font-semibold">
                    Restaurant Address:
                  </strong>
                  Ravan Gali, Nisha Complex, Ambagarh Chowki, Rajnandgaon, Chhattisgarh - 491665
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#0C3B2E] shrink-0" />
                <span>
                  <strong className="text-slate-900 font-semibold">Hotline:</strong>{" "}
                  <a
                    href="tel:+919876543210"
                    className="hover:underline text-[#0C3B2E] font-bold"
                  >
                    +91 98765 43210
                  </a>
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-[#0C3B2E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-900 block font-semibold">
                    Serving Local Neighborhoods:
                  </strong>
                  Ambagarh Chowki town, Nisha Complex area, Ravan Gali, Main Market, Rajnandgaon Road, and surrounding 5km radius.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Cuisines & SEO Keywords Cloud */}
        <div className="pt-7 border-t border-[#0C3B2E]/10 space-y-3">
          <h4 className="text-[11px] font-bold text-[#0C3B2E] uppercase tracking-wider flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#0C3B2E]" />
            <span>Popular Local Cuisines in Ambagarh Chowki (491665)</span>
          </h4>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
            {popularKeywords.map((keyword, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-full bg-white border border-[#0C3B2E]/15 hover:border-[#0C3B2E] hover:text-[#0C3B2E] transition-colors shadow-2xs"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Copyright & Geo Meta Footer */}
        <div className="pt-6 border-t border-[#0C3B2E]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Evergreen Cafe &amp; Restaurant. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-[#0C3B2E] fill-[#0C3B2E] inline" />
            <span>for Ambagarh Chowki Food Lovers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}