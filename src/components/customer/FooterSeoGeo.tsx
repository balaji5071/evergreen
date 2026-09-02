"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Clock,
  Truck,
  ShieldCheck,
  UtensilsCrossed,
  Sparkles,
  Heart,
  Navigation,
} from "lucide-react";
import Logo from "./Logo";

export default function FooterSeoGeo() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay footer render until after page content has hydrated
    const timer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Don't show footer on admin, staff, auth, cart, checkout, profile, order tracking, or menu pages
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/cart" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/menu")
  ) {
    return null;
  }

  // Don't render until mounted (prevents footer flash on page refresh)
  if (!mounted) return null;

  return (
    <footer className="bg-[#0C3B2E] text-white pt-12 pb-24 md:pb-12 border-t border-emerald-800/60 mt-12 relative overflow-hidden animate-in fade-in duration-500">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        {/* Top Grid Section: Brand Info + GEO Location + Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Local Bio (Cols 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Logo />
            </div>

            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-md">
              Evergreen Cafe &amp; Restaurant is Ambagarh Chowki&apos;s premier dining and food delivery destination located at Nisha Complex, Ravan Gali. 
              We craft authentic North Indian, Chinese, Fast Food, and refreshing beverages using fresh ingredients daily.
            </p>

            {/* Quick Geo Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[11px] font-extrabold border border-white/10">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Ambagarh Chowki, CG - 491665</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-[11px] font-extrabold border border-white/10">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open Daily: 10 AM - 10:30 PM</span>
              </span>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-[11px] font-extrabold border border-white/10">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                <span>Free Delivery &gt; ₹300</span>
              </span>
            </div>
          </div>

          {/* Quick Navigation Links (Cols 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-serif text-base font-bold text-amber-300 tracking-wide uppercase">
              Quick Navigation
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-emerald-100/90 font-medium">
              <li>
                <Link href="/" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <span>Home &amp; Highlights</span>
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <span>Explore Menu &amp; Dishes</span>
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <span>Track Active Order</span>
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <span>Help Center &amp; FAQs</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-300 transition-colors flex items-center space-x-2">
                  <span>Customer Login / Signup</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Local GEO & Contact Card (Cols 4) */}
          <div className="lg:col-span-4 space-y-3 bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-md">
            <h3 className="font-serif text-base font-bold text-amber-300 flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>Exact Location &amp; Delivery Zone</span>
            </h3>

            <div className="space-y-2.5 text-xs text-emerald-100/90">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-bold">Restaurant Address:</strong>
                  Ravan Gali, Nisha Complex, Ambagarh Chowki, Rajnandgaon, Chhattisgarh - 491665
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-white font-bold">Hotline:</strong>{" "}
                  <a href="tel:+919876543210" className="hover:underline text-amber-300 font-bold">
                    +91 98765 43210
                  </a>
                </span>
              </div>

              <div className="flex items-start space-x-2.5">
                <Truck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white block font-bold">Serving Local Neighborhoods:</strong>
                  Ambagarh Chowki town, Nisha Complex area, Ravan Gali, Main Market, Rajnandgaon Road, and surrounding 5km radius.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Cuisines & SEO Keywords Cloud */}
        <div className="pt-6 border-t border-emerald-800/80 space-y-3">
          <h4 className="text-[11px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center space-x-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Popular Local Cuisines in Ambagarh Chowki (491665)</span>
          </h4>
          <div className="flex flex-wrap gap-1.5 text-[11px] text-emerald-200/80">
            {[
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
            ].map((keyword, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/50 hover:border-amber-400/40 transition-colors"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Copyright & Geo Meta Footer */}
        <div className="pt-6 border-t border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/70">
          <p>© {new Date().getFullYear()} Evergreen Cafe &amp; Restaurant. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
              <span>for Ambagarh Chowki Food Lovers</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
