"use client";

import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";
import { playKitchenOrderBellSound } from "@/lib/soundAlerts";
import { Bell, ArrowRight, X } from "lucide-react";
import Link from "next/link";

interface NewOrderToast {
  orderId: string;
  shortId: string;
  totalAmount?: number;
  customerName?: string;
}

export default function OrderSoundAlertListener() {
  const [toast, setToast] = useState<NewOrderToast | null>(null);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef<boolean>(true);

  const checkNewOrders = async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (!res.ok) return;

      const data = await res.json();
      const orders = data.orders || [];

      let newlyPlacedOrder: any = null;

      for (const order of orders) {
        if (!knownOrderIds.current.has(order._id)) {
          knownOrderIds.current.add(order._id);

          // If not initial load and order is Placed, mark as newly arrived
          if (!initialLoadRef.current && order.orderStatus === "Placed") {
            newlyPlacedOrder = order;
          }
        }
      }

      if (initialLoadRef.current) {
        initialLoadRef.current = false;
      }

      if (newlyPlacedOrder) {
        triggerOrderAlert(
          newlyPlacedOrder._id,
          newlyPlacedOrder.totalAmount,
          newlyPlacedOrder.userId?.name
        );
      }
    } catch (e) {
      console.error("OrderSoundAlertListener check error:", e);
    }
  };

  const triggerOrderAlert = (
    orderId: string,
    totalAmount?: number,
    customerName?: string
  ) => {
    // 1. Play loud kitchen counter order bell chime
    playKitchenOrderBellSound();

    // 2. Show floating visual toast for staff / admin
    const shortId = orderId.slice(-6).toUpperCase();
    setToast({
      orderId,
      shortId,
      totalAmount,
      customerName: customerName || "Customer",
    });

    // 3. Native browser notification if permitted
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("🔔 New Order Received!", {
          body: `Order #${shortId} placed by ${customerName || "Customer"} (${totalAmount ? `₹${totalAmount}` : ""})`,
          icon: "/logo.png",
        });
      } catch (err) {}
    }
  };

  useEffect(() => {
    // Initial fetch to load existing IDs   
    checkNewOrders();

    // Polling interval every 7 seconds
    const interval = setInterval(checkNewOrders, 7000);

    // Socket real-time listener
    const socket = getSocket();

    const handleSocketNewOrder = (data: { orderId: string; totalAmount?: number; customerName?: string }) => {
      if (data && data.orderId) {
        knownOrderIds.current.add(data.orderId);
        triggerOrderAlert(data.orderId, data.totalAmount, data.customerName);
      } else {
        checkNewOrders();
      }
    };

    socket.on("new_order", handleSocketNewOrder);

    return () => {
      clearInterval(interval);
      socket.off("new_order", handleSocketNewOrder);
    };
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 animate-bounceIn">
      <div className="bg-amber-400 text-slate-950 p-4 rounded-2xl shadow-2xl border-2 border-amber-500 flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-slate-950 text-amber-400 shrink-0 animate-pulse">
            <Bell className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-950 flex items-center space-x-1">
              <span>🔔 New Order Received!</span>
            </h4>
            <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
              Ticket #{toast.shortId} • {toast.customerName}
            </p>
            {toast.totalAmount && (
              <p className="text-[11px] font-extrabold text-emerald-950">
                Amount: ₹{toast.totalAmount}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <Link
            href={`/staff/orders/${toast.orderId}`}
            onClick={() => setToast(null)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 text-white text-xs font-extrabold hover:bg-slate-900 transition flex items-center space-x-1"
          >
            <span>View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setToast(null)}
            className="p-1 text-slate-800 hover:text-slate-950"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
