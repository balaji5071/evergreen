"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerItem {
  _id: string;
  title: string;
  imageUrl: string;
  active: boolean;
}

export default function SwiggyBannerCarousel() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<any>(null);

  const fetchBanners = () => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBanners(data.filter((b) => b.active));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchBanners();

    const handleBannerEvent = () => fetchBanners();

    if (typeof window !== "undefined") {
      window.addEventListener("banner_published", handleBannerEvent);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("banner_published", handleBannerEvent);
      }
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    startAutoSlide();
    return () => stopAutoSlide();
  }, [currentIndex, banners.length]);

  const startAutoSlide = () => {
    stopAutoSlide();
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
  };

  const stopAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // If no active database banners exist, return null (do not show fake banners)
  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full space-y-2 select-none">
      {/* Banner Carousel Box */}
      <div className="relative overflow-hidden rounded-3xl shadow-lg border border-[#E6E2D8]/60">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <div
              key={banner._id}
              className="w-full shrink-0 relative min-h-[160px] sm:min-h-[180px] bg-slate-900 overflow-hidden flex items-center"
            >
              {/* Real Banner Image */}
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover absolute inset-0"
              />

              {/* Title Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-tight drop-shadow-md">
                  {banner.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Prev / Next Buttons */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => {
                stopAutoSlide();
                setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/60 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                stopAutoSlide();
                setCurrentIndex((prev) => (prev + 1) % banners.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center backdrop-blur-md hover:bg-black/60 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Indicator Dots */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center space-x-1.5 pt-1">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                stopAutoSlide();
                setCurrentIndex(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentIndex === idx ? "w-6 bg-[#0C3B2E]" : "w-1.5 bg-[#E6E2D8]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
