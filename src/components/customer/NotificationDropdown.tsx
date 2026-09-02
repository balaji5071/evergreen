"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Tag, ShoppingBag, ExternalLink, Sparkles } from "lucide-react";
import { useSocket, INotificationItem } from "@/context/SocketContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAllRead, markSingleRead } = useSocket();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif: INotificationItem) => {
    if (!notif.read) {
      await markSingleRead(notif._id);
    }
    setOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getIconForNotification = (title: string) => {
    if (title.includes("Coupon") || title.includes("Offer")) {
      return <Tag className="w-4 h-4 text-amber-500" />;
    }
    if (title.includes("Banner")) {
      return <Sparkles className="w-4 h-4 text-emerald-500" />;
    }
    return <ShoppingBag className="w-4 h-4 text-[#0C3B2E]" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-[#0C3B2E] hover:bg-[#EAF5EF] transition-all focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E6E2D8] z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-4 py-3 bg-[#0C3B2E] text-white flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-amber-300" />
              <h3 className="font-serif font-bold text-sm text-amber-100">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[11px] font-semibold text-emerald-200 hover:text-white flex items-center space-x-1 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                <p className="font-semibold">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Live order status, coupon & banner updates will appear here automatically!
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 cursor-pointer transition flex items-start space-x-3 hover:bg-slate-50 ${
                    !notif.read ? "bg-amber-50/50" : ""
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                    {getIconForNotification(notif.title)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#0C3B2E] truncate">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] font-semibold text-slate-400 mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {notif.link && (
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
