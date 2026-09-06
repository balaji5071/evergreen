"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import { subscribeUserToPush } from "@/lib/pushClient";

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  orderId?: string;
  link?: string;
}

export interface INotificationItem {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

interface SocketContextType {
  toast: ToastNotification | null;
  notifications: INotificationItem[];
  unreadCount: number;
  clearToast: () => void;
  fetchNotifications: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markSingleRead: (notificationId: string) => Promise<void>;
  emitOrderStatusUpdate: (orderId: string, orderStatus: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [toast, setToast] = useState<ToastNotification | null>(null);
  const [notifications, setNotifications] = useState<INotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef<boolean>(true);

  // Synthesize Web Audio chime for instant notification sound
  const playAudioNotification = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  // Attempt automatic web push subscription in background when user is logged in
  useEffect(() => {
    if (user) {
      subscribeUserToPush().catch(() => {});
    }
  }, [user]);

  // Fetch in-app notifications from API safely
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Skip polling if document tab is currently hidden/inactive
    if (typeof document !== "undefined" && document.hidden) {
      return;
    }

    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;

      const data = await res.json();
      const fetched: INotificationItem[] = data.notifications || [];
      setUnreadCount(data.unreadCount || 0);
      setNotifications(fetched);

      // Check for newly arrived unread notifications
      let hasNewNotification = false;
      let latestNewNotification: INotificationItem | null = null;

      for (const notif of fetched) {
        if (!knownNotificationIds.current.has(notif._id)) {
          knownNotificationIds.current.add(notif._id);
          if (!initialLoadRef.current && !notif.read) {
            hasNewNotification = true;
            latestNewNotification = notif;
          }
        }
      }

      if (initialLoadRef.current) {
        initialLoadRef.current = false;
      }

      if (hasNewNotification && latestNewNotification) {
        playAudioNotification();
        setToast({
          id: latestNewNotification._id,
          title: latestNewNotification.title,
          message: latestNewNotification.message,
          link: latestNewNotification.link || "/",
        });
      }
    } catch (e: any) {
      // Ignore routine network polling drops or tab switches safely
      if (e?.name === "AbortError" || e?.message?.includes("Failed to fetch")) {
        return;
      }
      console.warn("Notification polling warning:", e?.message || e);
    }
  };

  // Mark all notifications as read
  const markAllRead = async () => {
    try {
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (e) {
      // Ignore network errors
    }
  };

  // Mark single notification as read
  const markSingleRead = async (notificationId: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
    } catch (e) {
      // Ignore network errors
    }
  };

  // Auto-polling interval every 6 seconds for logged in user when tab is visible
  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 6000);

    return () => clearInterval(interval);
  }, [user]);

  // Socket listener for real-time customer updates
  useEffect(() => {
    const socket = getSocket();

    const handleOrderUpdated = (data: { orderId: string; orderStatus: string; message?: string }) => {
      const statusTitleMap: Record<string, string> = {
        Accepted: "Order Accepted 🟢",
        Preparing: "Meal Being Prepared 👨‍🍳",
        Ready: "Order Ready 📦",
        "Out for Delivery": "Out for Delivery 🛵",
        Delivered: "Order Delivered 🎉",
        Cancelled: "Order Cancelled 🔴",
      };

      const defaultMsgMap: Record<string, string> = {
        Accepted: "Your order has been accepted by Evergreen Cafe!",
        Preparing: "Your meal is being prepared.",
        Ready: "Your order is ready & packed for delivery!",
        "Out for Delivery": "Your order is out for delivery! Contact delivery partner.",
        Delivered: "Your order has been delivered! Enjoy your meal 🌿",
        Cancelled: "Your order has been cancelled.",
      };

      playAudioNotification();
      setToast({
        id: Date.now().toString(),
        title: statusTitleMap[data.orderStatus] || `Order ${data.orderStatus}`,
        message: data.message || defaultMsgMap[data.orderStatus] || `Your order status is now ${data.orderStatus}`,
        link: `/orders/${data.orderId}`,
        orderId: data.orderId,
      });

      fetchNotifications();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("order_updated", { detail: data }));
      }
    };

    const handleNewNotification = (data: { title: string; message: string; link?: string }) => {
      playAudioNotification();
      setToast({
        id: Date.now().toString(),
        title: data.title || "New Notification",
        message: data.message || "",
        link: data.link || "/",
      });
      fetchNotifications();
    };

    const handleCouponPublished = (coupon: any) => {
      playAudioNotification();
      setToast({
        id: Date.now().toString(),
        title: `🎉 New Coupon: ${coupon.code}`,
        message: coupon.description || `Discount code ${coupon.code} is now live!`,
        link: "/cart",
      });
      fetchNotifications();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("coupon_published", { detail: coupon }));
      }
    };

    const handleBannerPublished = (banner: any) => {
      playAudioNotification();
      setToast({
        id: Date.now().toString(),
        title: "🖼️ New Offer Banner!",
        message: banner.title || "Check out our newest deal!",
        link: "/",
      });
      fetchNotifications();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("banner_published", { detail: banner }));
      }
    };

    socket.on("order_updated", handleOrderUpdated);
    socket.on("new_notification", handleNewNotification);
    socket.on("coupon_published", handleCouponPublished);
    socket.on("banner_published", handleBannerPublished);

    return () => {
      socket.off("order_updated", handleOrderUpdated);
      socket.off("new_notification", handleNewNotification);
      socket.off("coupon_published", handleCouponPublished);
      socket.off("banner_published", handleBannerPublished);
    };
  }, []);

  const clearToast = () => setToast(null);

  const emitOrderStatusUpdate = (orderId: string, orderStatus: string) => {
    const socket = getSocket();
    socket.emit("update_order_status", { orderId, orderStatus });
  };

  return (
    <SocketContext.Provider
      value={{
        toast,
        notifications,
        unreadCount,
        clearToast,
        fetchNotifications,
        markAllRead,
        markSingleRead,
        emitOrderStatusUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
