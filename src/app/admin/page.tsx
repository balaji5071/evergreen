"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  IndianRupee,
  Users,
  Utensils,
  TrendingUp,
  ArrowRight,
  Truck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#0C3B2E]">Dashboard Overview</h2>
        <p className="text-xs text-slate-500">Real-time store performance & live staff metrics</p>
      </div>

      {/* Primary Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-2">
          <div className="p-2.5 bg-emerald-100 text-[#0C3B2E] rounded-2xl w-fit">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-[#0C3B2E]">{metrics?.todayOrdersCount || 0}</p>
          <p className="text-xs font-semibold text-slate-500">Today's Orders</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-2">
          <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl w-fit">
            <IndianRupee className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-[#0C3B2E]">₹{metrics?.todayRevenue || 0}</p>
          <p className="text-xs font-semibold text-slate-500">Today's Revenue</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-2">
          <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl w-fit">
            <UserCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold text-[#0C3B2E]">{metrics?.totalStaff || 0}</p>
          <p className="text-xs font-semibold text-slate-500">Total Active Staff</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-2">
          <div className="p-2.5 bg-teal-100 text-teal-800 rounded-2xl w-fit">
            <Truck className="w-5 h-5 text-teal-700" />
          </div>
          <p className="text-2xl font-bold text-[#0C3B2E]">{metrics?.completedOrdersTillNow || 0}</p>
          <p className="text-xs font-semibold text-slate-500">Completed Orders (Till Now)</p>
        </div>
      </div>

      {/* Monthly Performance Analytics Section */}
      <div className="bg-gradient-to-br from-[#0C3B2E] to-[#124e3d] text-white p-6 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-serif text-lg font-bold">This Month's Store Performance</h3>
          </div>
          <span className="text-[11px] font-mono bg-emerald-800/70 text-emerald-200 px-3 py-1 rounded-full font-bold">
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Monthly Revenue */}
          <div className="bg-white/10 backdrop-blur-md p-4.5 rounded-2xl border border-white/10 space-y-1">
            <p className="text-xs text-emerald-200 uppercase font-bold tracking-wider">Monthly Revenue</p>
            <p className="text-3xl font-black text-amber-300">₹{metrics?.monthlyRevenue || 0}</p>
            <p className="text-[10px] text-emerald-300 font-medium">Delivered order sales this month</p>
          </div>

          {/* Monthly Delivered */}
          <div className="bg-white/10 backdrop-blur-md p-4.5 rounded-2xl border border-white/10 space-y-1">
            <p className="text-xs text-emerald-200 uppercase font-bold tracking-wider">Monthly Delivered</p>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <p className="text-3xl font-black text-white">{metrics?.monthlyDeliveredCount || 0}</p>
            </div>
            <p className="text-[10px] text-emerald-300 font-medium">Fulfilled order tickets</p>
          </div>

          {/* Monthly Cancelled */}
          <div className="bg-white/10 backdrop-blur-md p-4.5 rounded-2xl border border-white/10 space-y-1">
            <p className="text-xs text-emerald-200 uppercase font-bold tracking-wider">Monthly Cancelled</p>
            <div className="flex items-center space-x-2">
              <XCircle className="w-6 h-6 text-rose-400" />
              <p className="text-3xl font-black text-white">{metrics?.monthlyCancelledCount || 0}</p>
            </div>
            <p className="text-[10px] text-rose-200 font-medium">Cancelled order tickets</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3">
          <h3 className="font-serif text-lg font-bold text-[#0C3B2E]">Recent Orders & Delivery Personnel</h3>
          <Link
            href="/admin/orders"
            className="text-xs text-[#0C3B2E] font-bold flex items-center space-x-1 hover:underline"
          >
            <span>Manage All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#E6E2D8]/50">
          {metrics?.recentOrders?.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent orders.</p>
          ) : (
            metrics?.recentOrders?.map((order: any) => (
              <div key={order._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-[#0C3B2E]">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">Customer: {order.userId?.name || "Customer"}</p>
                  
                  {order.deliveredBy && (
                    <p className="text-[11px] font-bold text-emerald-800 flex items-center space-x-1 mt-0.5">
                      <Truck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Delivered By: {order.deliveredBy.name} ({order.deliveredBy.employeeId || "Staff"})</span>
                    </p>
                  )}
                </div>

                <div className="sm:text-right">
                  <p className="font-bold text-base text-[#0C3B2E]">₹{order.totalAmount}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Popular Dishes */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <span>Top Selling Dishes</span>
        </h3>

        <div className="space-y-3">
          {metrics?.popularItems?.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-[#E6E2D8]/60 text-xs"
            >
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-xl bg-[#0C3B2E] text-amber-300 font-bold flex items-center justify-center text-xs">
                  #{idx + 1}
                </span>
                <span className="font-bold text-[#0C3B2E]">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#0C3B2E]">{item.count} orders</p>
                <p className="text-[10px] text-slate-500">₹{item.totalSales} revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
