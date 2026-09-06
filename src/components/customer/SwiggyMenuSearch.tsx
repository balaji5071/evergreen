"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, Plus, Minus, Flame, Sparkles, Utensils } from "lucide-react";
import { useCart } from "@/context/CartContext";

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

const POPULAR_TAGS = [
  { label: "Biryani", emoji: "🍗" },
  { label: "Burger", emoji: "🍔" },
  { label: "Pizza", emoji: "🍕" },
  { label: "Chai & Tea", emoji: "☕" },
  { label: "Noodles", emoji: "🍜" },
  { label: "Paneer", emoji: "🧀" },
  { label: "Milkshakes", emoji: "🥤" },
];

export default function SwiggyMenuSearch({
  query: controlledQuery,
  onQueryChange,
  onSelectTag,
}: {
  query?: string;
  onQueryChange?: (query: string) => void;
  onSelectTag?: (tag: string) => void;
}) {
  const { cart, addToCart, updateQuantity } = useCart();

  const [localQuery, setLocalQuery] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [filteredResults, setFilteredResults] = useState<MenuItemType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const query = controlledQuery ?? localQuery;

  const updateQuery = (nextQuery: string) => {
    if (controlledQuery === undefined) {
      setLocalQuery(nextQuery);
    }
    onQueryChange?.(nextQuery);
  };

  // Fetch all menu items for instant local searching
  useEffect(() => {
    fetch("/api/menu", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMenuItems(data);
        }
      })
      .catch(() => {});
  }, []);

  // Filter menu items in real-time as user types
  useEffect(() => {
    if (!query.trim()) {
      setFilteredResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const matches = menuItems.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        (typeof item.categoryId === "object" &&
          item.categoryId &&
          typeof item.categoryId.name === "string" &&
          item.categoryId.name.toLowerCase().includes(q))
    );
    setFilteredResults(matches);
  }, [query, menuItems]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getItemQty = (id: string) => {
    const found = cart.find((c) => c.menuItemId === id);
    return found ? found.quantity : 0;
  };

  const handleTagClick = (tagLabel: string) => {
    updateQuery(tagLabel);
    setIsOpen(true);
    if (onSelectTag) onSelectTag(tagLabel);
  };

  return (
    <div ref={searchRef} className="relative w-full space-y-2.5 z-40">
      {/* Search Input Box */}
      <div className="relative">
        <div className="flex items-center space-x-2 bg-white rounded-2xl border border-[#E6E2D8] px-4 py-3 shadow-card-soft focus-within:ring-2 focus-within:ring-[#0C3B2E] focus-within:border-transparent transition-all">
          <Search className="w-4 h-4 text-[#0C3B2E] shrink-0" />
          <input
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              updateQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Search for 'Biryani', 'Burger', 'Chai', 'Pizza'..."
            className="w-full bg-transparent text-xs font-semibold text-[#0C3B2E] placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => {
                updateQuery("");
                setFilteredResults([]);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Search Overlay Results Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl border border-[#E6E2D8] shadow-2xl overflow-hidden z-50 divide-y max-h-[380px] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {query.trim() === "" ? (
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0C3B2E]">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Popular Dishes & Cuisines</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map((tag) => (
                    <button
                      key={tag.label}
                      onClick={() => handleTagClick(tag.label)}
                      className="px-3 py-1.5 rounded-full bg-[#EAF5EF] hover:bg-[#0C3B2E] hover:text-white text-xs font-bold text-[#0C3B2E] transition flex items-center space-x-1 border border-emerald-200/60"
                    >
                      <span>{tag.emoji}</span>
                      <span>{tag.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl">
                  🔍
                </div>
                <p className="text-xs font-bold text-[#0C3B2E]">
                  No dishes found for "{query}"
                </p>
                <p className="text-[11px] text-slate-500">
                  Try searching for Biryani, Pizza, Burger, or Paneer!
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Found {filteredResults.length} dish(es)</span>
                  <span className="text-emerald-700">Swiggy Quick Add</span>
                </div>

                {filteredResults.map((dish) => {
                  const qty = getItemQty(dish._id);

                  return (
                    <div
                      key={dish._id}
                      className="p-2.5 rounded-2xl hover:bg-slate-50 flex items-center space-x-3 transition border border-slate-100"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative border border-slate-200">
                        <img
                          src={dish.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80"}
                          alt={dish.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1.5">
                          {/* Veg / Non-Veg Indicator Dot */}
                          <div
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                              dish.isVeg !== false
                                ? "border-emerald-600"
                                : "border-red-600"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                dish.isVeg !== false
                                  ? "bg-emerald-600"
                                  : "bg-red-600"
                              }`}
                            />
                          </div>
                          <h4 className="text-xs font-bold text-[#0C3B2E] truncate">
                            {dish.name}
                          </h4>
                        </div>

                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {dish.description}
                        </p>
                        <span className="text-xs font-extrabold text-[#0C3B2E]">
                          ₹{dish.price}
                        </span>
                      </div>

                      {/* Swiggy Style Instant Add Button inside search results */}
                      <div className="shrink-0">
                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(dish as any)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs hover:bg-[#0C3B2E] hover:text-white transition shadow-sm"
                          >
                            + ADD
                          </button>
                        ) : (
                          <div className="flex items-center space-x-1.5 bg-[#0C3B2E] text-white rounded-xl px-2 py-1 shadow-sm">
                            <button
                              onClick={() => updateQuantity(dish._id, -1)}
                              className="w-5 h-5 rounded-lg bg-white/20 text-white flex items-center justify-center text-xs font-bold"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-1">{qty}</span>
                            <button
                              onClick={() => updateQuantity(dish._id, 1)}
                              className="w-5 h-5 rounded-lg bg-white/20 text-white flex items-center justify-center text-xs font-bold"
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
            )}
          </div>
        )}
      </div>

      {/* Quick Cuisine Tags bar below search input */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
        {POPULAR_TAGS.map((tag) => (
          <button
            key={tag.label}
            onClick={() => handleTagClick(tag.label)}
            className="px-3 py-1 rounded-full bg-white border border-[#E6E2D8] hover:bg-[#EAF5EF] text-[11px] font-bold text-[#0C3B2E] whitespace-nowrap shadow-sm transition flex items-center space-x-1 shrink-0"
          >
            <span>{tag.emoji}</span>
            <span>{tag.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
