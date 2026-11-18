"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  HandPlatter,
} from "lucide-react";

const categories = [
  { name: "Breakfast", icon: "🍴", bg: "bg-[#EAF5EF]" },
  { name: "Starters", icon: "🍜", bg: "bg-amber-50" },
  { name: "Main Course", icon: "🍛", bg: "bg-[#EAF5EF]" },
  { name: "Pizza & Pasta", icon: "🍕", bg: "bg-orange-50" },
  { name: "Desserts", icon: "🧁", bg: "bg-amber-50" },
  { name: "Coffee & Beverages", icon: "☕", bg: "bg-[#EAF5EF]" },
  { name: "Fresh & Healthy", icon: "🥗", bg: "bg-emerald-50" },
];

const restaurants = [
  {
    id: 1,
    badge: "Guest Favourite",
    image:
      "https://lh3.googleusercontent.com/_f-ZPZswpxSal2gvNtZbHdhm8W62idYJAIyWXr-uTzcews7ngVdlVCu4P1C7fvI-gAhroze7QTUdtYLDLB3KlLsvMD4=w1600-rw",
  },
  {
    id: 2,
    badge: "Popular Choice",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSt0Fjn8c6BS_U6lxVqU8oeY1rZ7-6rw_14QKqrjwBOJg&s",
  },
  {
    id: 3,
    badge: "Freshly Prepared",
    image:
      "https://dineout-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_600,h_468/v1709128873/7aa3c3ae28467ba68c2c619b77f60fea.jpg",
  },
  {
    id: 4,
    badge: "Made with Care",
    image:
      "https://content.jdmagicbox.com/v2/comp/rajnandgaon/y5/9999p7744.7744.250517061220.q5y5/catalogue/evergreen-restaurant-and-cafe-rajnandgaon-restaurants-fbj1c9yxtk-250.jpg",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/menu");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans">
      {/* Top Hero Wrapper with Warm Botanical Cream & Sage Gradient */}
      <div className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/5">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-white/95 border border-[#0C3B2E]/15 px-3.5 py-1.5 rounded-full shadow-2xs">
              <HandPlatter className="w-3.5 h-3.5 text-[#0C3B2E]" />
              <span className="text-xs font-semibold text-[#0C3B2E]">
                Authentic Flavours &amp; Freshly Prepared
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#0C3B2E] leading-[1.12] tracking-tight">
              Good Food,
              <br />
              Great Coffee &amp;
              <br />
              Beautiful Moments.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-md leading-relaxed">
              Freshly prepared meals, handcrafted beverages, and delicious treats made to bring people together.
            </p>

            {/* Food Search Form */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 max-w-lg"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find your favourite food"
                className="flex-1 bg-white border border-[#0C3B2E]/15 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 shadow-2xs focus:outline-none focus:border-[#0C3B2E]"
              />
              <button
                type="submit"
                className="bg-[#0C3B2E] hover:bg-[#145341] text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-sm transition whitespace-nowrap cursor-pointer"
              >
                Explore Menu
              </button>
            </form>
          </div>

          {/* Right Column - Food Bowl Hero Visual */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
              {/* Decorative Floating Avocado Halves */}
              <img
                src="https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=220&q=80"
                alt="Fresh avocado"
                className="hidden sm:block absolute -top-2 left-4 w-24 h-24 object-cover rounded-full shadow-md -rotate-12 border-4 border-white/90 z-10"
              />
              {/* Main Healthy Bowl */}
              <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-2xl border-8 border-white bg-white ring-1 ring-[#0C3B2E]/10">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80"
                  alt="Healthy meal bowl with avocado, greens, and roasted vegetables"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative Fresh Ingredients Badge */}
              <div className="hidden sm:flex absolute bottom-6 left-10 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-full shadow-md border border-[#0C3B2E]/10 items-center gap-1.5 text-xs font-semibold text-[#0C3B2E]">
                <span>🌱</span> Fresh Ingredients
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0C3B2E]">
            Our Menu
          </h2>
          <div className="flex items-center gap-2">
            <button
              aria-label="Previous categories"
              className="w-8 h-8 rounded-full border border-[#0C3B2E]/15 bg-white flex items-center justify-center text-slate-600 hover:bg-[#EAF5EF] hover:text-[#0C3B2E] transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              aria-label="Next categories"
              className="w-8 h-8 rounded-full border border-[#0C3B2E]/15 bg-white flex items-center justify-center text-slate-600 hover:bg-[#EAF5EF] hover:text-[#0C3B2E] transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/menu?category=${encodeURIComponent(cat.name)}`}
              className="group flex flex-col items-center gap-2.5 focus:outline-none cursor-pointer"
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${cat.bg} border border-[#0C3B2E]/10 flex items-center justify-center text-2xl sm:text-3xl shadow-2xs group-hover:scale-105 group-hover:border-[#0C3B2E]/30 transition-all`}
              >
                {cat.icon}
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-[#0C3B2E] text-center transition">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Chef's Special (Warm Golden Amber) */}
          <div className="bg-gradient-to-br from-amber-300 to-amber-400 rounded-2xl p-6 sm:p-7 flex flex-col justify-between min-h-[190px] relative overflow-hidden shadow-xs">
            <div className="space-y-1.5 z-10 max-w-[200px]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0C3B2E]/80">
                Today&apos;s Special
              </p>
              <h3 className="text-2xl font-extrabold text-[#0C3B2E] leading-tight">
                Chef&apos;s Special
              </h3>
              <p className="text-xs text-[#0C3B2E]/85 font-medium">
                Discover our signature dishes.
              </p>
            </div>
            <div className="pt-4 z-10">
              <Link
                href="/menu"
                className="inline-flex items-center gap-1.5 bg-[#0C3B2E] text-white hover:bg-[#145341] text-xs font-semibold px-4 py-2 rounded-full shadow-2xs transition cursor-pointer"
              >
                <span>Explore Specials</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Coffee & Conversations (Soft Botanical Sage) */}
          <div className="bg-[#EAF5EF] border border-[#0C3B2E]/10 rounded-2xl p-6 sm:p-7 flex items-center justify-between min-h-[190px] relative overflow-hidden shadow-xs">
            <div className="space-y-1.5 z-10 max-w-[175px]">
              <span className="inline-block bg-[#0C3B2E] text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                15% OFF
              </span>
              <h3 className="text-xl font-extrabold text-[#0C3B2E] pt-1 leading-snug">
                Coffee &amp; Conversations
              </h3>
              <p className="text-xs text-slate-600">
                Take a break and enjoy freshly brewed coffee with your favourite treats.
              </p>
              <div className="pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 bg-[#0C3B2E] hover:bg-[#145341] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xs transition cursor-pointer"
                >
                  <span>Explore Beverages</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <img
              src="https://images.openai.com/static-rsc-4/ELRSxPnh4J3uD_f7L_elab69NegUjV7GNxjYcOEYeh9cYmJ2ISakJqF1mDoazNGX1WWfEwU00wdv7ZlCFOvsck6RXWXFuLKAQ00k_TsbcIdR-qPAqMAcA4MQu3iYF2FIjsTvgmQU9Ytf54yZb3VCor2lnvojBvq-jozdTaSbWrTG1QxwbQLv4Nn0wrhzqGSb?purpose=fullsize"
              alt="Freshly brewed coffee and treats"
              className="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-full shadow-md -mr-8 shrink-0 border-4 border-white"
            />
          </div>

          {/* Card 3: Made for Food Lovers (Signature Evergreen Forest) */}
          <div className="bg-gradient-to-br from-[#0C3B2E] to-[#155240] rounded-2xl p-6 sm:p-7 flex items-center justify-between min-h-[190px] relative overflow-hidden shadow-xs text-white">
            <div className="space-y-1.5 z-10 max-w-[175px]">
              <span className="inline-block bg-amber-400 text-[#0C3B2E] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                20% OFF
              </span>
              <h3 className="text-xl font-extrabold text-white pt-1 leading-snug">
                Made for Food Lovers
              </h3>
              <p className="text-xs text-emerald-100/85">
                From comforting classics to irresistible favourites, there&apos;s something for everyone.
              </p>
              <div className="pt-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-[#0C3B2E] text-xs font-bold px-4 py-2 rounded-full shadow-2xs transition cursor-pointer"
                >
                  <span>View Full Menu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
            <img
              src="https://images.openai.com/static-rsc-4/ap4Pqb0IusMLZ2QKiutu8kalnV1HYE6QSmfe52PqGY0vI8CEQZJbOnhGCTvZag80-ntzfzFiC-GcW0Lj552xQSyhEHAGYRThGt80jyg7A08Xzvv0qVxCcSERn8dpZ40H6libnanMdTxLgvO7myAtbNHUVpneD_rytON0ojpeuwu3phxQHuvXnTYvjPTrw3FW?purpose=fullsize"
              alt="Signature dishes"
              className="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-full shadow-md -mr-8 shrink-0 border-4 border-white/20"
            />
          </div>
        </div>
      </section>

      {/* A Glimpse of Evergreen */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white border border-[#0C3B2E]/10 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#0C3B2E]">
              A Glimpse of Evergreen
            </h2>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0C3B2E] hover:underline"
            >
              <span>Explore Our Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {restaurants.map((item) => (
              <div
                key={item.id}
                className="group relative h-44 rounded-2xl overflow-hidden bg-[#EAF5EF] cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.badge}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C3B2E]/40 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 bg-[#0C3B2E] text-amber-300 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}