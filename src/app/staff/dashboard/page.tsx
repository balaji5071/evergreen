"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Clock,
  ChefHat,
  PackageCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Phone,
  ShoppingBag,
} from "lucide-react";
import { getSocket } from "@/lib/socket";

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  orderStatus: "Placed" | "Accepted" | "Preparing" | "Ready" | "Out for Delivery" | "Delivered" | "Cancelled";
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  address: { address: string; title?: string };
  userId?: { name: string; phone: string; email: string };
  createdAt: string;
}

export default function StaffDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Failed to fetch staff dashboard orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Socket.IO real-time update
    const socket = getSocket();
    const handleOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order_updated", handleOrderUpdate);
    socket.on("new_order", handleOrderUpdate);

    // Auto-polling every 10 seconds as backup
    const interval = setInterval(fetchOrders, 10000);

    return () => {
      socket.off("order_updated", handleOrderUpdate);
      socket.off("new_order", handleOrderUpdate);
      clearInterval(interval);
    };
  }, []);

  // Compute live order counts
  const newOrdersCount = orders.filter((o) => o.orderStatus === "Placed").length;
  const preparingCount = orders.filter(
    (o) => o.orderStatus === "Accepted" || o.orderStatus === "Preparing"
  ).length;
  const readyCount = orders.filter((o) => o.orderStatus === "Ready").length;
  const outForDeliveryCount = orders.filter((o) => o.orderStatus === "Out for Delivery").length;

  const todayStr = new Date().toDateString();
  const completedTodayCount = orders.filter((o) => {
    if (o.orderStatus !== "Delivered") return false;
    const d = new Date(o.createdAt);
    return d.toDateString() === todayStr;
  }).length;

  const recentOrders = orders.slice(0, 8);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Placed":
        return "bg-amber-100 text-amber-900 border-amber-300 animate-pulse";
      case "Accepted":
        return "bg-blue-100 text-blue-900 border-blue-300";
      case "Preparing":
        return "bg-[#EAF5EF] text-[#0C3B2E] border-emerald-300 font-bold";
      case "Ready":
        return "bg-purple-100 text-purple-900 border-purple-300 font-bold";
      case "Out for Delivery":
        return "bg-indigo-100 text-indigo-900 border-indigo-300 font-bold";
      case "Delivered":
        return "bg-slate-100 text-slate-700 border-slate-300";
      default:
        return "bg-red-100 text-red-900 border-red-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0C3B2E] text-white p-6 rounded-3xl shadow-xl border border-emerald-800">
        <div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Kitchen Operations</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">Staff Operations Control</h2>
          <p className="text-xs text-emerald-200 mt-1">
            Real-time ticket updates via Socket.IO • Last synced at {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchOrders}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition flex items-center space-x-2 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/staff/orders"
            className="px-5 py-3 rounded-2xl bg-[#D4AF37] hover:bg-[#b8972e] text-[#0C3B2E] text-xs font-extrabold shadow-md transition flex items-center space-x-2"
          >
            <span>Manage Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Real-time Order Stage Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. New Orders */}
        <Link
          href="/staff/orders?status=Placed"
          className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft hover:shadow-lg transition group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wide">
              New Orders
            </span>
            <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800 group-hover:scale-110 transition">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0C3B2E] mt-3">
            {newOrdersCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting acceptance</p>
        </Link>

        {/* 2. Preparing Orders */}
        <Link
          href="/staff/orders?status=Preparing"
          className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft hover:shadow-lg transition group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
              Preparing
            </span>
            <div className="p-2.5 rounded-2xl bg-[#EAF5EF] text-[#0C3B2E] group-hover:scale-110 transition">
              <ChefHat className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0C3B2E] mt-3">
            {preparingCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">In kitchen prep</p>
        </Link>

        {/* 3. Ready Orders */}
        <Link
          href="/staff/orders?status=Ready"
          className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft hover:shadow-lg transition group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-purple-800 uppercase tracking-wide">
              Ready
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-100 text-purple-800 group-hover:scale-110 transition">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0C3B2E] mt-3">
            {readyCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Ready for pickup/dispatch</p>
        </Link>

        {/* 4. Out For Delivery */}
        <Link
          href="/staff/orders?status=Out+for+Delivery"
          className="bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft hover:shadow-lg transition group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-indigo-800 uppercase tracking-wide">
              Out Delivery
            </span>
            <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-800 group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0C3B2E] mt-3">
            {outForDeliveryCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">En route to customer</p>
        </Link>

        {/* 5. Completed Today */}
        <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wide">
              Completed Today
            </span>
            <div className="p-2.5 rounded-2xl bg-slate-100 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-[#0C3B2E] mt-3">
            {completedTodayCount}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Delivered successfully</p>
        </div>
      </div>

      {/* Recent Live Ticket Feed */}
      <div className="bg-white rounded-3xl border border-[#E6E2D8] shadow-card-soft p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <span>Recent Order Stream</span>
            </h3>
            <p className="text-xs text-slate-500">Live order queue for staff actions</p>
          </div>

          <Link
            href="/staff/orders"
            className="text-xs font-bold text-[#0C3B2E] hover:underline flex items-center space-x-1"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-3 border-[#0C3B2E] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="font-bold text-sm text-slate-600">No active order tickets right now.</p>
            <p className="text-xs mt-1">New incoming orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentOrders.map((order) => (
              <div
                key={order._id}
                className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] hover:border-[#0C3B2E]/40 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-[#0C3B2E]">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {order.userId?.name || "Customer"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <div className="border-t border-[#E6E2D8]/60 pt-2 text-xs text-slate-600 space-y-1">
                  <p className="font-medium text-slate-700">
                    📦 {order.items.reduce((s, i) => s + i.quantity, 0)} Items:{" "}
                    {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-extrabold text-[#0C3B2E]">
                      ₹{order.totalAmount} ({order.paymentMethod})
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <a
                    href={`tel:${order.userId?.phone}`}
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center space-x-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{order.userId?.phone || "Call"}</span>
                  </a>

                  <Link
                    href={`/staff/orders/${order._id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0C3B2E] text-white text-xs font-bold hover:bg-[#08281e] transition flex items-center space-x-1"
                  >
                    <span>View Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
