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
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md bg-[#0C3B2E] text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border border-[#439371]/40 animate-bounceIn">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-[#439371]/30 rounded-xl">
          <Bell className="w-5 h-5 text-amber-300 animate-pulse" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-amber-200">{toast.title}</h4>
          <p className="text-xs text-emerald-100">{toast.message}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {(toast.link || toast.orderId) && (
          <Link
            href={toast.link || `/orders/${toast.orderId}`}
            onClick={clearToast}
            className="p-1.5 bg-amber-400 text-slate-900 rounded-lg text-xs font-semibold flex items-center hover:bg-amber-300 transition shrink-0"
          >
            View <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        )}
        <button
          onClick={clearToast}
          className="p-1 text-emerald-200 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
