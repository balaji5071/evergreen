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

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  All: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=200&q=80",
  Biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80",
  Burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80",
  Pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80",
  "Fried Rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=200&q=80",
  Noodles: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=200&q=80",
  "Chai & Tea": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=200&q=80",
  Beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=200&q=80",
  Paneer: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=200&q=80",
  Starters: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=200&q=80",
  "South Indian": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=80",
  Desserts: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=200&q=80",
};

const getCategoryImg = (catName: string, customImg?: string) => {
  if (customImg && customImg.trim()) return customImg;
  for (const key in DEFAULT_CATEGORY_IMAGES) {
    if (catName.toLowerCase().includes(key.toLowerCase())) {
      return DEFAULT_CATEGORY_IMAGES[key];
    }
  }
  return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80";
};

export default function MenuPage() {
  const { cart, addToCart, updateQuantity } = useCart();

  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const itemsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch categories safely
    fetch("/api/menu/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories([{ _id: "All", name: "All" }, ...data]);
        } else {
          setCategories([{ _id: "All", name: "All" }]);
        }
      })
      .catch(() => setCategories([{ _id: "All", name: "All" }]));
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
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setItems([]);
        setLoading(false);
      });
  }, [selectedCategory, searchQuery]);

  const getItemQuantity = (id: string) => {
    if (!Array.isArray(cart)) return 0;
    const found = cart.find((c) => c && c.menuItemId === id);
    return found ? found.quantity : 0;
  };

  const isCategorySwitched = useRef(false);

  useEffect(() => {
    // Scroll smoothly to top of page when changing category so all content & 1st item are in full view
    if (!loading && items.length > 0 && isCategorySwitched.current) {
      isCategorySwitched.current = false;
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [loading, items]);

  const handleCategoryClick = (catId: string) => {
    isCategorySwitched.current = true;
    setSelectedCategory(catId);
    setSearchQuery("");
  };

  return (
    <div className="flex-1 flex flex-col pb-36 md:pb-16 bg-[#FAF8F5]">
      {/* Top Banner Carousel right after Navbar */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
        <SwiggyBannerCarousel />
      </div>

      {/* Main Header (Title & Search - scrolls naturally) */}
      <div className="bg-white mt-2 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
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
        </div>
      </div>

      {/* Zomato-Style Sticky Circular Category Selector Bar */}
      <div className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center space-x-3.5 sm:space-x-5 overflow-x-auto no-scrollbar py-1 px-1">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat._id;
              const catImage = getCategoryImg(cat.name, cat.imageUrl);

              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryClick(cat._id)}
                  className="flex flex-col items-center space-y-1.5 shrink-0 group focus:outline-none cursor-pointer"
                >
                  {/* Round Image Ring Container */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 transition-all duration-300 ${
                      isSelected
                        ? "ring-3 ring-[#0C3B2E] ring-offset-2 scale-105 shadow-md bg-[#0C3B2E]"
                        : "border-2 border-slate-200 group-hover:border-[#0C3B2E]/50 group-hover:scale-102 bg-white"
                    }`}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden relative border border-white/60">
                      <img
                        src={catImage}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Category Name Label */}
                  <span
                    className={`text-[11px] sm:text-xs font-bold transition-all text-center max-w-[65px] sm:max-w-[80px] truncate ${
                      isSelected
                        ? "text-[#0C3B2E] font-extrabold underline decoration-2 underline-offset-4"
                        : "text-slate-600 group-hover:text-[#0C3B2E]"
                    }`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Container - Max 7xl on desktop */}
      <main ref={itemsSectionRef} className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
              {items.map((item, index) => {
                const qty = getItemQuantity(item._id);

                return (
                  <div
                    key={item._id}
                    id={index === 0 ? "first-menu-item" : undefined}
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
