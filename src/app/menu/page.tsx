"use client";

import React, { useEffect, useState, useRef } from "react";
import { Plus, Minus, ShoppingBag, Utensils, HandPlatter } from "lucide-react";
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
    const timeout = setTimeout(() => {
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
    }, 300);
    return () => clearTimeout(timeout);
  }, [selectedCategory, searchQuery]);

  const getItemQuantity = (id: string) => {
    const found = cart.find((c) => c.menuItemId === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="flex-1 flex flex-col pb-36 md:pb-16 bg-[#FAF8F5] text-slate-900 font-sans">
      {/* Header Container matching Evergreen Botanical Sage & Cream Hero */}
      <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 bg-white/95 border border-[#0C3B2E]/15 px-3 py-1 rounded-full shadow-2xs">
                <HandPlatter className="w-3.5 h-3.5 text-[#0C3B2E]" />
                <span className="text-[11px] font-semibold text-[#0C3B2E]">
                  Freshly Prepared &amp; Handcrafted
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
                Our Menu
              </h1>
              <p className="text-xs text-slate-600">
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
                    setTimeout(() => {
                      itemsSectionRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 50);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-[#0C3B2E] text-white shadow-xs"
                      : "bg-white text-slate-700 border border-[#0C3B2E]/15 hover:bg-[#EAF5EF] hover:text-[#0C3B2E]"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main
        ref={itemsSectionRef}
        className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8"
      >
        {/* Banner Carousel */}
        <SwiggyBannerCarousel />

        {/* Menu Items Section */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-40 bg-white animate-pulse rounded-3xl border border-[#0C3B2E]/10"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-white rounded-3xl border border-[#0C3B2E]/10 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#EAF5EF] text-[#0C3B2E] border border-[#0C3B2E]/10 flex items-center justify-center mx-auto text-2xl">
              🍲
            </div>
            <h3 className="text-xl font-bold text-[#0C3B2E]">No dishes found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching for a different dish name or reset your category filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="mt-2 px-5 py-2.5 rounded-full bg-[#0C3B2E] text-white text-xs font-semibold hover:bg-[#145341] transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-[#0C3B2E] flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/10 flex items-center justify-center">
                  <Utensils className="w-4 h-4 text-[#0C3B2E]" />
                </span>
                <span>
                  {selectedCategory === "All"
                    ? "All Culinary Delights"
                    : "Category Dishes"}
                </span>
              </h3>
              <span className="text-xs font-semibold text-[#0C3B2E] bg-[#EAF5EF] border border-[#0C3B2E]/10 px-3.5 py-1.5 rounded-full">
                {items.length} items available
              </span>
            </div>

            {/* Desktop Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const qty = getItemQuantity(item._id);

                return (
                  <div
                    key={item._id}
                    className="bg-white p-5 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs hover:shadow-md hover:border-[#0C3B2E]/25 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
                  >
                    <div className="flex space-x-4 items-start">
                      {/* Food Image */}
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-[#EAF5EF] border border-[#0C3B2E]/10">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1.5">
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
                          <h3 className="font-bold text-base text-[#0C3B2E] truncate">
                            {item.name}
                          </h3>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="pt-1.5">
                          <span className="font-extrabold text-base text-[#0C3B2E]">
                            ₹{item.price}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="pt-4 mt-3 border-t border-[#0C3B2E]/10 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {item.isVeg !== false ? "Pure Veg" : "Non-Veg"}
                      </span>

                      {qty === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-4 py-2 rounded-full bg-[#EAF5EF] text-[#0C3B2E] font-bold text-xs hover:bg-[#0C3B2E] hover:text-white transition-all duration-200 flex items-center gap-1 border border-[#0C3B2E]/15 shadow-2xs cursor-pointer"
                        >
                          <span>Add</span>
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-[#0C3B2E] text-white rounded-full px-2.5 py-1 shadow-xs">
                          <button
                            onClick={() => updateQuantity(item._id, -1)}
                            className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1 min-w-[16px] text-center text-amber-300">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, 1)}
                            className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
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
            className="w-full py-3.5 px-5 rounded-full bg-[#0C3B2E] text-white shadow-xl flex items-center justify-between border border-emerald-800/60 hover:bg-[#145341] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-[#0C3B2E] flex items-center justify-center font-extrabold text-sm shadow-2xs">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </div>
              <div>
                <p className="text-[11px] text-emerald-100/80 uppercase tracking-wider font-semibold">
                  Items in Cart
                </p>
                <p className="text-sm font-extrabold text-amber-300">
                  ₹{cart.reduce((sum, i) => sum + i.price * i.quantity, 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-[#0C3B2E] bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-full transition">
              <span>View Cart &amp; Checkout</span>
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      )}

      <BottomNav />
    </div>
  );
}