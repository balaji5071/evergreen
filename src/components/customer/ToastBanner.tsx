"use client";

import React, { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { Bell, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ToastBanner() {
  const { toast, clearToast } = useSocket();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-gradient-to-r from-[#0C3B2E] to-[#155240] text-white px-4 py-3.5 rounded-3xl shadow-xl flex items-center justify-between gap-3 border border-white/15 backdrop-blur-md animate-bounceIn font-sans">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
          <Bell className="w-4 h-4 text-amber-300 animate-pulse" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-amber-300 truncate">
            {toast.title}
          </h4>
          <p className="text-xs text-emerald-100/90 line-clamp-2 leading-snug">
            {toast.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {(toast.link || toast.orderId) && (
          <Link
            href={toast.link || `/orders/${toast.orderId}`}
            onClick={clearToast}
            className="px-3.5 py-1.5 bg-amber-400 text-[#0C3B2E] rounded-full text-xs font-bold inline-flex items-center gap-1 hover:bg-amber-300 transition shadow-2xs shrink-0"
          >
            <span>View</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
        <button
          onClick={clearToast}
          aria-label="Dismiss notification"
          className="w-7 h-7 rounded-full text-emerald-100/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}