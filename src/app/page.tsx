"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Utensils, Truck, Banknote, MapPin, Sparkles, Clock, ShieldCheck } from "lucide-react";
import BottomNav from "@/components/customer/BottomNav";
import PushNotificationPrompt from "@/components/customer/PushNotificationPrompt";
import Logo from "@/components/customer/Logo";
import SwiggyBannerCarousel from "@/components/customer/SwiggyBannerCarousel";
import SwiggyMenuSearch from "@/components/customer/SwiggyMenuSearch";

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col pb-36 md:pb-12 bg-[#FAF8F5]">


      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Hero Banner Section for Desktop & Mobile */}
        <section className="bg-gradient-to-r from-[#0C3B2E] via-[#154d3d] to-[#0C3B2E] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -top-10 w-60 h-60 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-amber-300 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>AUTHENTIC FLAVORS • FRESHLY PREPARED</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                Delicious Meals Delivered Straight To Your Door
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Handcrafted with passion, served fresh. Enjoy quick delivery, easy payments, and live order tracking from Evergreen Cafe & Restaurant.
              </p>

              {/* Quick Desktop Search Input embedded in Hero */}
              <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                <SwiggyMenuSearch />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/menu"
                  className="px-6 py-3.5 rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold text-sm shadow-lg hover:shadow-amber-400/20 transition flex items-center space-x-2"
                >
                  <span>Explore Full Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/orders"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition flex items-center space-x-2"
                >
                  <Clock className="w-4 h-4 text-amber-300" />
                  <span>Track Active Order</span>
                </Link>
              </div>
            </div>

            {/* Hero Right Visual Banner */}
            <div className="lg:col-span-5">
              <SwiggyBannerCarousel />
            </div>
          </div>
        </section>

        {/* Push Notification Banner */}
        <section>
          <PushNotificationPrompt />
        </section>

        {/* How it Works Section */}
        <section className="space-y-6 pt-2">
          <div className="text-center space-y-1.5">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#0C3B2E]">
              How It Works
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Simple 4-step process to get fresh food delivered to your home or hostel.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                step: "1",
                icon: Utensils,
                title: "Pick Your Food",
                desc: "Browse our curated fresh menu items.",
              },
              {
                step: "2",
                icon: Truck,
                title: "Choose Delivery",
                desc: "Speedy delivery straight to your doorstep.",
              },
              {
                step: "3",
                icon: Banknote,
                title: "Pay Easily",
                desc: "Cash on Delivery available.",
              },
              {
                step: "4",
                icon: MapPin,
                title: "Track Order",
                desc: "Live order updates on your meal status.",
              },
            ].map((item) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={item.step}
                  className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-5 bg-white rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft hover:shadow-lg transition-all duration-300 group hover:-translate-y-1 text-center sm:text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF5EF] text-[#0C3B2E] flex items-center justify-center shrink-0 group-hover:bg-[#0C3B2E] group-hover:text-amber-300 transition-colors">
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">
                      Step 0{item.step}
                    </div>
                    <h4 className="text-base font-bold text-[#0C3B2E] mt-0.5">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick CTA Card */}
        <section className="bg-[#EAF5EF] p-8 rounded-3xl border border-emerald-200 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0C3B2E]">
              Hungry? Order Your Favorite Meal Now
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Freshly cooked biryani, starters, beverages, and desserts ready for fast dispatch.
            </p>
          </div>

          <Link
            href="/menu"
            className="px-8 py-4 rounded-2xl btn-emerald text-sm font-bold shadow-lg shrink-0 flex items-center space-x-2"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
