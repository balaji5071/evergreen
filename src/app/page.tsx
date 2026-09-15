"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Utensils,
  Truck,
  Banknote,
  MapPin,
  Sparkles,
  Clock,
  Star,
  Plus,
  Minus,
  Zap,
  Flame,
  Leaf,
  CheckCircle2,
  ShieldCheck,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import BottomNav from "@/components/customer/BottomNav";
import PushNotificationPrompt from "@/components/customer/PushNotificationPrompt";
import SwiggyBannerCarousel from "@/components/customer/SwiggyBannerCarousel";
import SwiggyMenuSearch from "@/components/customer/SwiggyMenuSearch";
import { useCart } from "@/context/CartContext";

const CATEGORY_COLLECTIONS = [
  {
    name: "Biryani",
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=200&q=80",
    tag: "Rich & Aromatic",
  },
  {
    name: "Starters",
    img: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=200&q=80",
    tag: "Crispy & Crunchy",
  },
  {
    name: "Paneer",
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=200&q=80",
    tag: "Cottage Cheese Specials",
  },
  {
    name: "Burger",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80",
    tag: "Juicy & Cheesy",
  },
  {
    name: "Pizza",
    img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=80",
    tag: "Loaded Toppings",
  },
  {
    name: "Fried Rice",
    img: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=200&q=80",
    tag: "Wok Tossed",
  },
  {
    name: "Noodles",
    img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=200&q=80",
    tag: "Desi Chinese",
  },
  {
    name: "Desserts",
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=200&q=80",
    tag: "Sweet Treats",
  },
  {
    name: "Chai & Tea",
    img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=200&q=80",
    tag: "Freshly Brewed",
  },
];

export default function HomePage() {
  const { cart, addToCart, updateQuantity } = useCart();
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  useEffect(() => {
    // Fetch featured items for trending section
    fetch("/api/menu?limit=6")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFeaturedItems(data.slice(0, 6));
        } else {
          setFeaturedItems([]);
        }
        setLoadingItems(false);
      })
      .catch(() => {
        setFeaturedItems([]);
        setLoadingItems(false);
      });
  }, []);

  const getItemQty = (id: string) => {
    if (!Array.isArray(cart)) return 0;
    const found = cart.find((c) => c && c.menuItemId === id);
    return found ? found.quantity : 0;
  };

  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // Auto-move animation refs
  const isUserInteractingRef = useRef<boolean>(false);
  const autoMoveTimerRef = useRef<any>(null);
  const autoMoveDirectionRef = useRef<number>(1);
  const autoMovePauseRef = useRef<boolean>(false);

  const pauseAutoMoveTemporarily = (durationMs = 2500) => {
    isUserInteractingRef.current = true;
    if (autoMoveTimerRef.current) clearTimeout(autoMoveTimerRef.current);
    autoMoveTimerRef.current = setTimeout(() => {
      isUserInteractingRef.current = false;
    }, durationMs);
  };

  const updateScrollArrows = () => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  // Continuous auto-move loop for categories
  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (
        !isUserInteractingRef.current &&
        !autoMovePauseRef.current &&
        el.scrollWidth > el.clientWidth + 10
      ) {
        const stepAmount = (36 / 1000) * Math.min(delta, 64);
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (autoMoveDirectionRef.current === 1) {
          if (el.scrollLeft >= maxScroll - 2) {
            autoMovePauseRef.current = true;
            setTimeout(() => {
              autoMoveDirectionRef.current = -1;
              autoMovePauseRef.current = false;
            }, 1800);
          } else {
            el.scrollLeft += stepAmount;
          }
        } else {
          if (el.scrollLeft <= 2) {
            autoMovePauseRef.current = true;
            setTimeout(() => {
              autoMoveDirectionRef.current = 1;
              autoMovePauseRef.current = false;
            }, 1800);
          } else {
            el.scrollLeft -= stepAmount;
          }
        }
        updateScrollArrows();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (autoMoveTimerRef.current) clearTimeout(autoMoveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = categoryScrollRef.current;
    if (!el) return;

    const onScroll = () => updateScrollArrows();
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        pauseAutoMoveTemporarily(2000);
        el.scrollLeft += e.deltaY;
        updateScrollArrows();
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("wheel", onWheel, { passive: false });

    updateScrollArrows();
    const timer = setTimeout(updateScrollArrows, 300);
    window.addEventListener("resize", updateScrollArrows);

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
      clearTimeout(timer);
      window.removeEventListener("resize", updateScrollArrows);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = categoryScrollRef.current;
    if (!el) return;
    isUserInteractingRef.current = true;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = categoryScrollRef.current;
    if (!isDraggingRef.current || !el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 6) {
      hasDraggedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - walk;
    updateScrollArrows();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    pauseAutoMoveTemporarily(2500);
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 100);
  };

  const scrollCategory = (direction: "left" | "right") => {
    if (!categoryScrollRef.current) return;
    pauseAutoMoveTemporarily(3000);
    const scrollAmount = direction === "left" ? -240 : 240;
    categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Quick Filter Badges auto-move & scroll refs
  const filterBadgesScrollRef = useRef<HTMLDivElement>(null);
  const isFilterInteractingRef = useRef<boolean>(false);
  const filterAutoMoveTimerRef = useRef<any>(null);
  const filterAutoMoveDirectionRef = useRef<number>(1);
  const filterAutoMovePauseRef = useRef<boolean>(false);
  const isFilterDraggingRef = useRef<boolean>(false);
  const filterStartXRef = useRef<number>(0);
  const filterScrollLeftRef = useRef<number>(0);
  const filterHasDraggedRef = useRef<boolean>(false);

  const pauseFilterAutoMove = (durationMs = 2500) => {
    isFilterInteractingRef.current = true;
    if (filterAutoMoveTimerRef.current) clearTimeout(filterAutoMoveTimerRef.current);
    filterAutoMoveTimerRef.current = setTimeout(() => {
      isFilterInteractingRef.current = false;
    }, durationMs);
  };

  useEffect(() => {
    const el = filterBadgesScrollRef.current;
    if (!el) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (
        !isFilterInteractingRef.current &&
        !filterAutoMovePauseRef.current &&
        el.scrollWidth > el.clientWidth + 5
      ) {
        const stepAmount = (32 / 1000) * Math.min(delta, 64);
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (filterAutoMoveDirectionRef.current === 1) {
          if (el.scrollLeft >= maxScroll - 2) {
            filterAutoMovePauseRef.current = true;
            setTimeout(() => {
              filterAutoMoveDirectionRef.current = -1;
              filterAutoMovePauseRef.current = false;
            }, 1800);
          } else {
            el.scrollLeft += stepAmount;
          }
        } else {
          if (el.scrollLeft <= 2) {
            filterAutoMovePauseRef.current = true;
            setTimeout(() => {
              filterAutoMoveDirectionRef.current = 1;
              filterAutoMovePauseRef.current = false;
            }, 1800);
          } else {
            el.scrollLeft -= stepAmount;
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (filterAutoMoveTimerRef.current) clearTimeout(filterAutoMoveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const el = filterBadgesScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
        e.preventDefault();
        pauseFilterAutoMove(2000);
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  const handleFilterMouseDown = (e: React.MouseEvent) => {
    const el = filterBadgesScrollRef.current;
    if (!el) return;
    isFilterInteractingRef.current = true;
    isFilterDraggingRef.current = true;
    filterHasDraggedRef.current = false;
    filterStartXRef.current = e.pageX - el.offsetLeft;
    filterScrollLeftRef.current = el.scrollLeft;
  };

  const handleFilterMouseMove = (e: React.MouseEvent) => {
    const el = filterBadgesScrollRef.current;
    if (!isFilterDraggingRef.current || !el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - filterStartXRef.current) * 1.5;
    if (Math.abs(walk) > 6) {
      filterHasDraggedRef.current = true;
    }
    el.scrollLeft = filterScrollLeftRef.current - walk;
  };

  const handleFilterMouseUpOrLeave = () => {
    isFilterDraggingRef.current = false;
    pauseFilterAutoMove(2500);
    setTimeout(() => {
      filterHasDraggedRef.current = false;
    }, 100);
  };

  return (
    <div className="flex-1 flex flex-col pb-36 md:pb-16 bg-[#FAF8F5]">
      {/* Dynamic Zomato Top Header Strip */}
      <header className="bg-white border-b border-[#E6E2D8] sticky top-[64px] z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          {/* Location Badge */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xs text-[#0C3B2E] truncate">
                  Ambedkar Chowk
                </span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                Evergreen Cafe • 20-30 Mins Express Delivery
              </p>
            </div>
          </div>

          {/* Zomato Gold Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1 rounded-full text-[11px] font-extrabold shadow-sm">
            <Award className="w-3.5 h-3.5" />
            <span>EVERGREEN PRIORITY</span>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 space-y-7">
        {/* Banner Slider */}
        <section>
          <SwiggyBannerCarousel />
        </section>

        {/* Quick Search Bar */}
        <section className="max-w-3xl mx-auto w-full">
          <SwiggyMenuSearch />
        </section>

        {/* Zomato "What's on your mind?" Categories */}
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#0C3B2E] flex items-center space-x-2">
                <span>What&apos;s on your mind?</span>
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              </h2>
              <p className="text-xs text-slate-500">Explore handcrafted dishes by cravings</p>
            </div>
            <Link
              href="/menu"
              className="text-xs font-extrabold text-[#0C3B2E] hover:underline flex items-center space-x-1 group"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Horizontal Scroll Grid of Circular Food Cards */}
          <div className="relative group/catrow select-none">
            {/* Left Arrow Button */}
            {showLeftArrow && (
              <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-1 bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent pr-4 pointer-events-none">
                <button
                  type="button"
                  onClick={() => scrollCategory("left")}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-md border border-slate-200 text-[#0C3B2E] flex items-center justify-center pointer-events-auto hover:bg-[#0C3B2E] hover:text-white transition-all transform hover:scale-105 active:scale-95"
                  aria-label="Scroll categories left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Right Arrow Button */}
            {showRightArrow && (
              <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center pr-1 bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent pl-4 pointer-events-none">
                <button
                  type="button"
                  onClick={() => scrollCategory("right")}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-md border border-slate-200 text-[#0C3B2E] flex items-center justify-center pointer-events-auto hover:bg-[#0C3B2E] hover:text-white transition-all transform hover:scale-105 active:scale-95"
                  aria-label="Scroll categories right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div
              ref={categoryScrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={() => {
                isUserInteractingRef.current = true;
              }}
              onTouchEnd={() => {
                pauseAutoMoveTemporarily(2500);
              }}
              onMouseEnter={() => {
                isUserInteractingRef.current = true;
              }}
              className="flex items-center space-x-4 overflow-x-auto no-scrollbar py-2 px-1 cursor-grab active:cursor-grabbing touch-pan-x"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-x",
                overscrollBehaviorX: "contain",
              }}
            >
              {CATEGORY_COLLECTIONS.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/menu?category=${encodeURIComponent(cat.name)}`}
                  onClick={(e) => {
                    if (hasDraggedRef.current) e.preventDefault();
                  }}
                  className="flex flex-col items-center space-y-2 shrink-0 group focus:outline-none cursor-pointer select-none"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 border-2 border-slate-200 group-hover:border-[#0C3B2E] group-hover:scale-105 transition-all duration-300 shadow-sm bg-white relative pointer-events-none">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        draggable={false}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 select-none pointer-events-none"
                      />
                    </div>
                  </div>
                  <div className="text-center pointer-events-none select-none">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-[#0C3B2E] transition-colors">
                      {cat.name}
                    </p>
                    <p className="text-[9px] text-slate-400 font-semibold">{cat.tag}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Filter Badges with Auto-Move */}
        <section className="relative select-none">
          <div
            ref={filterBadgesScrollRef}
            onMouseDown={handleFilterMouseDown}
            onMouseMove={handleFilterMouseMove}
            onMouseUp={handleFilterMouseUpOrLeave}
            onMouseLeave={handleFilterMouseUpOrLeave}
            onTouchStart={() => {
              isFilterInteractingRef.current = true;
            }}
            onTouchEnd={() => {
              pauseFilterAutoMove(2500);
            }}
            onMouseEnter={() => {
              isFilterInteractingRef.current = true;
            }}
            className="flex items-center space-x-2.5 overflow-x-auto no-scrollbar py-1 cursor-grab active:cursor-grabbing select-none touch-pan-x"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x",
              overscrollBehaviorX: "contain",
            }}
          >
            <Link
              href="/menu"
              onClick={(e) => {
                if (filterHasDraggedRef.current) e.preventDefault();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shrink-0 hover:bg-emerald-100 transition shadow-2xs hover:scale-102 select-none"
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
              <span>Pure Veg</span>
            </Link>
            <Link
              href="/menu"
              onClick={(e) => {
                if (filterHasDraggedRef.current) e.preventDefault();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shrink-0 hover:bg-amber-100 transition shadow-2xs hover:scale-102 select-none"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Bestsellers</span>
            </Link>
            <Link
              href="/menu"
              onClick={(e) => {
                if (filterHasDraggedRef.current) e.preventDefault();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-sky-50 border border-sky-300 text-sky-900 text-xs font-bold shrink-0 hover:bg-sky-100 transition shadow-2xs hover:scale-102 select-none"
            >
              <Zap className="w-3.5 h-3.5 text-sky-600 fill-sky-500" />
              <span>Under 30 Mins</span>
            </Link>
            <Link
              href="/menu"
              onClick={(e) => {
                if (filterHasDraggedRef.current) e.preventDefault();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold shrink-0 hover:bg-rose-100 transition shadow-2xs hover:scale-102 select-none"
            >
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>4.5+ Top Rated</span>
            </Link>
            <Link
              href="/menu"
              onClick={(e) => {
                if (filterHasDraggedRef.current) e.preventDefault();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-purple-50 border border-purple-300 text-purple-900 text-xs font-bold shrink-0 hover:bg-purple-100 transition shadow-2xs hover:scale-102 select-none"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 fill-purple-400" />
              <span>Special Offers</span>
            </Link>
            <Link
              href="/menu"
              onClick={(e) => {
                if (filterHasDraggedRef.current) e.preventDefault();
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-teal-50 border border-teal-300 text-teal-900 text-xs font-bold shrink-0 hover:bg-teal-100 transition shadow-2xs hover:scale-102 select-none"
            >
              <Award className="w-3.5 h-3.5 text-teal-600 fill-teal-400" />
              <span>Chef Special</span>
            </Link>
          </div>
        </section>

        {/* Trending & Popular Dishes Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#0C3B2E] flex items-center space-x-2">
                <Flame className="w-5 h-5 text-rose-500 fill-rose-500" />
                <span>Trending Dishes Near You</span>
              </h2>
              <p className="text-xs text-slate-500">Most ordered by local food lovers</p>
            </div>
            <Link
              href="/menu"
              className="text-xs font-extrabold text-[#0C3B2E] hover:underline flex items-center space-x-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingItems ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-32 bg-white rounded-3xl animate-pulse border border-slate-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredItems.map((item) => {
                const qty = getItemQty(item._id);

                return (
                  <div
                    key={item._id}
                    className="bg-white p-4 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft hover:shadow-xl transition-all duration-300 flex space-x-4 items-center group relative overflow-hidden"
                  >
                    {/* Dish Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-100 border border-[#E6E2D8]/60 relative group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-full text-[10px] font-black text-amber-700 flex items-center space-x-0.5 shadow-2xs">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                        <span>4.8</span>
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-3 h-3 rounded-sm border border-emerald-600 p-0.5 flex items-center justify-center shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        </span>
                        <h3 className="font-bold text-sm text-[#0C3B2E] truncate group-hover:text-amber-700 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                        {item.description || "Handcrafted fresh to order"}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="font-extrabold text-sm text-[#0C3B2E]">
                          ₹{item.price}
                        </span>

                        {/* Add to Cart Button */}
                        {qty === 0 ? (
                          <button
                            onClick={() =>
                              addToCart({
                                _id: item._id,
                                name: item.name,
                                price: item.price,
                                imageUrl: item.imageUrl,
                              })
                            }
                            className="px-4 py-1.5 rounded-xl bg-emerald-50 text-[#0C3B2E] border border-emerald-300 hover:bg-[#0C3B2E] hover:text-white transition-all text-xs font-black shadow-2xs cursor-pointer"
                          >
                            ADD +
                          </button>
                        ) : (
                          <div className="flex items-center space-x-2 bg-[#0C3B2E] text-white px-2.5 py-1 rounded-xl shadow-xs">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              className="p-0.5 hover:text-amber-300 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black min-w-[14px] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              className="p-0.5 hover:text-amber-300 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Push Notification Banner Prompt */}
        <section>
          <PushNotificationPrompt />
        </section>

        {/* Evergreen Perks & Promises */}
        <section className="bg-white rounded-3xl p-6 border border-[#E6E2D8]/80 shadow-card-soft space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#0C3B2E] text-center">
            Why Order From Evergreen?
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 space-y-1 rounded-2xl bg-amber-50/50 border border-amber-100">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-lg">
                🚀
              </div>
              <h4 className="text-xs font-bold text-[#0C3B2E]">Fast Dispatch</h4>
              <p className="text-[10px] text-slate-500">Cooked fresh & dispatched immediately</p>
            </div>

            <div className="p-3 space-y-1 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-lg">
                🧼
              </div>
              <h4 className="text-xs font-bold text-[#0C3B2E]">100% Hygienic</h4>
              <p className="text-[10px] text-slate-500">Sanitized kitchen & safe packaging</p>
            </div>

            <div className="p-3 space-y-1 rounded-2xl bg-sky-50/50 border border-sky-100">
              <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center mx-auto text-lg">
                💵
              </div>
              <h4 className="text-xs font-bold text-[#0C3B2E]">Pay COD / UPI</h4>
              <p className="text-[10px] text-slate-500">Flexible payment on delivery</p>
            </div>

            <div className="p-3 space-y-1 rounded-2xl bg-purple-50/50 border border-purple-100">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mx-auto text-lg">
                📍
              </div>
              <h4 className="text-xs font-bold text-[#0C3B2E]">Live Order Track</h4>
              <p className="text-[10px] text-slate-500">Real-time status updates</p>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
