"use client";

import React, { useEffect, useState, useRef } from "react";
import { Plus, Minus, ShoppingBag, Sparkles, Search, Utensils } from "lucide-react";
import BottomNav from "@/components/customer/BottomNav";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import SwiggyBannerCarousel from "@/components/customer/SwiggyBannerCarousel";
import SwiggyMenuSearch from "@/components/customer/SwiggyMenuSearch";

interface MenuItemType {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId?: { _id: string; name: string };
  available: boolean;
  isVeg?: boolean;
}

export default function MenuPage() {
  const { cart, addToCart, updateQuantity } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const itemsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch categories
    fetch("/api/menu/categories")
      .then((res) => res.json())
      .then((data) => setCategories([{ _id: "All", name: "All" }, ...data]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = "/api/menu";
    const params = new URLSearchParams();
    if (selectedCategory !== "All") {
      params.append("category", selectedCategory);
    }
    if (searchQuery) {
      params.append("search", searchQuery);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, searchQuery]);

  const getItemQuantity = (id: string) => {
    const found = cart.find((c) => c.menuItemId === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="flex-1 flex flex-col pb-36 md:pb-16 bg-[#FAF8F5]">
      {/* Header Container */}
      <header className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
                Our Menu
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Fresh, handcrafted dishes cooked to order
              </p>
            </div>

            <div className="w-full sm:w-auto max-w-md">
              <SwiggyMenuSearch
                onSelectTag={(tag) => {
                  setSearchQuery(tag);
                }}
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat._id;
              return (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat._id);
                    setSearchQuery("");
                    // Scroll items section back to top on category switch
                    setTimeout(() => {
                      itemsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 50);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#0C3B2E] text-white shadow-md scale-105"
                      : "bg-slate-100 text-slate-600 border border-[#E6E2D8] hover:bg-slate-200 hover:text-[#0C3B2E]"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main ref={itemsSectionRef} className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Carousel */}
        <SwiggyBannerCarousel />

        {/* Menu Items Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-36 bg-white/80 animate-pulse rounded-3xl border border-[#E6E2D8]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-white rounded-3xl border border-[#E6E2D8]">
            <div className="w-16 h-16 rounded-full bg-[#EAF5EF] text-[#0C3B2E] flex items-center justify-center mx-auto text-2xl">
              🍲
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0C3B2E]">No dishes found</h3>
            <p className="text-xs text-slate-500">
              Try searching for a different dish name or reset your category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-2 px-5 py-2 rounded-full bg-[#0C3B2E] text-white text-xs font-bold hover:bg-[#082920] transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                <span>
                  {selectedCategory === "All" ? "All Culinary Delights" : "Category Dishes"}
                </span>
              </h3>
              <span className="text-xs font-extrabold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                {items.length} items available
              </span>
            </div>

            {/* Desktop Grid Layout (3 columns on lg, 2 on md, 1 on sm) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const qty = getItemQuantity(item._id);

                return (
                  <div
                    key={item._id}
                    className="bg-white p-4 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
                  >
                    <div className="flex space-x-4 items-start">
                      {/* Food Image */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-[#E6E2D8]/60 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <div
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                              item.isVeg !== false
                                ? "border-emerald-600"
                                : "border-red-600"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.isVeg !== false
                                  ? "bg-emerald-600"
                                  : "bg-red-600"
                              }`}
                            />
                          </div>
                          <h3 className="font-bold text-base text-[#0C3B2E] truncate group-hover:text-amber-600 transition-colors">
                            {item.name}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-2">
                          <span className="font-black text-base text-[#0C3B2E]">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.isVeg !== false ? "Pure Veg" : "Non-Veg"}
                      </span>

                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-5 py-2 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold text-xs hover:bg-[#0C3B2E] hover:text-white transition-all duration-200 flex items-center space-x-1 border border-emerald-300 shadow-sm cursor-pointer"
                        >
                          <span>ADD</span>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2.5 bg-[#0C3B2E] text-white rounded-xl px-2.5 py-1.5 shadow-md">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-extrabold px-1 min-w-[16px] text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Floating Cart Launcher Bar for Desktop & Mobile */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-0 right-0 z-30 max-w-xl mx-auto px-4">
          <Link
            href="/cart"
            className="w-full py-4 px-6 rounded-2xl bg-[#0C3B2E] text-white shadow-2xl flex items-center justify-between border border-emerald-700/60 hover:bg-[#07251D] transition-all transform hover:scale-[1.02]"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </div>
              <div>
                <p className="text-[11px] text-emerald-200 uppercase tracking-wider font-semibold">
                  Items in Cart
                </p>
                <p className="text-base font-extrabold text-amber-300">
                  ₹{cart.reduce((sum, i) => sum + i.price * i.quantity, 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-300 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
              <span>View Cart & Checkout</span>
              <ShoppingBag className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
