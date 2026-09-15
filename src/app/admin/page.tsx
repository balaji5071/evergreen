"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Filter,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

type Order = {
  _id: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  userId?: { name?: string };
  deliveredBy?: { name?: string; employeeId?: string };
};

const statusStyles: Record<string, string> = {
  Placed: "bg-amber-50 text-amber-700",
  Accepted: "bg-blue-50 text-blue-700",
  Preparing: "bg-emerald-50 text-emerald-700",
  Ready: "bg-teal-50 text-teal-700",
  Delivered: "bg-[#0C3B2E] text-white",
  Cancelled: "bg-rose-50 text-rose-700",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [swipedOrder, setSwipedOrder] = useState<string | null>(null);
  const horizontalStart = useRef<number | null>(null);
  const verticalStart = useRef<number | null>(null);

  const fetchMetrics = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await fetch("/api/admin/metrics", { cache: "no-store" });
      if (response.ok) setMetrics(await response.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const orders: Order[] = metrics?.recentOrders || [];
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "All" || order.orderStatus === filter;
    const searchText = `${order._id} ${order.userId?.name || ""}`.toLowerCase();
    return matchesFilter && searchText.includes(query.toLowerCase());
  });

  const handleTouchStart = (event: React.TouchEvent, id: string) => {
    horizontalStart.current = event.touches[0].clientX;
    setSwipedOrder(id);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (horizontalStart.current !== null) {
      const distance = horizontalStart.current - event.changedTouches[0].clientX;
      if (distance < -45) setSwipedOrder(null);
    }
    horizontalStart.current = null;
  };

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="h-8 w-44 rounded-lg bg-slate-200" />
        <div className="h-44 rounded-2xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((n) => <div key={n} className="h-24 rounded-2xl bg-slate-200" />)}</div>
        <div className="h-56 rounded-2xl bg-slate-200" />
      </div>
    );
  }

  const revenue = metrics?.todayRevenue || 0;
  const orderCount = metrics?.todayOrdersCount || 0;

  return (
    <div
      className="space-y-6"
      onTouchStart={(event) => { verticalStart.current = event.touches[0].clientY; }}
      onTouchEnd={(event) => {
        if (verticalStart.current !== null && event.changedTouches[0].clientY - verticalStart.current > 70) fetchMetrics(true);
        verticalStart.current = null;
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Tuesday, 15 September</p>
          <h2 className="mt-1 font-serif text-[27px] font-bold leading-tight text-[#0C3B2E]">Good morning, Admin</h2>
        </div>
        <button onClick={() => fetchMetrics(true)} aria-label="Refresh dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0C3B2E] shadow-sm">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0C3B2E] via-[#12513D] to-[#1B7656] p-5 text-white shadow-[0_14px_30px_rgba(12,59,46,0.2)]">
        <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[22px] border-white/10" />
        <div className="relative">
          <div className="flex items-center justify-between"><p className="text-xs font-semibold text-emerald-100">Today&apos;s overview</p><span className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-emerald-100"><TrendingUp className="h-3 w-3" /> 12.8%</span></div>
          <p className="mt-3 text-3xl font-black tracking-tight">₹{revenue.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-emerald-100">Revenue generated today</p>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/15 pt-4"><div><p className="text-xl font-extrabold">{orderCount}</p><p className="text-[10px] text-emerald-100">Orders received</p></div><div><p className="text-xl font-extrabold">{metrics?.totalStaff || 0}</p><p className="text-[10px] text-emerald-100">Active staff</p></div></div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-extrabold text-[#0C3B2E]">Quick actions</h3><span className="text-[10px] font-bold text-slate-400">Tap to manage</span></div>
        <div className="grid grid-cols-3 gap-2.5">
          <Link href="/admin/orders" className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white text-[10px] font-bold text-[#0C3B2E] shadow-sm"><ShoppingBag className="h-5 w-5 text-emerald-700" />New order</Link>
          <Link href="/admin/menu" className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white text-[10px] font-bold text-[#0C3B2E] shadow-sm"><Plus className="h-5 w-5 text-amber-600" />Add menu item</Link>
          <Link href="/admin/users" className="flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white text-[10px] font-bold text-[#0C3B2E] shadow-sm"><Users className="h-5 w-5 text-teal-700" />Manage staff</Link>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-extrabold text-[#0C3B2E]">Today at a glance</h3><CalendarDays className="h-4 w-4 text-slate-400" /></div>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "Revenue", value: `₹${revenue}`, icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-50" }, { label: "Orders", value: orderCount, icon: ShoppingBag, color: "text-amber-700", bg: "bg-amber-50" }, { label: "Delivered", value: metrics?.completedOrdersTillNow || 0, icon: PackageCheck, color: "text-blue-700", bg: "bg-blue-50" }, { label: "Cancelled", value: metrics?.monthlyCancelledCount || 0, icon: X, color: "text-rose-700", bg: "bg-rose-50" }].map((item) => { const Icon = item.icon; return <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl ${item.bg} ${item.color}`}><Icon className="h-4 w-4" /></div><p className="truncate text-lg font-black text-[#0C3B2E]">{item.value}</p><p className="mt-0.5 text-[10px] font-semibold text-slate-500">{item.label}</p></div>; })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-extrabold text-[#0C3B2E]">Monthly performance</h3><span className="text-[10px] font-bold text-slate-400">September 2026</span></div>
        <div className="space-y-3">
          {[{ label: "Revenue", value: `₹${(metrics?.monthlyRevenue || 0).toLocaleString("en-IN")}`, note: "vs. last month", bars: [4, 7, 5, 9, 8, 11], color: "bg-emerald-500" }, { label: "Delivered", value: metrics?.monthlyDeliveredCount || 0, note: "fulfilled orders", bars: [5, 8, 6, 10, 9, 12], color: "bg-blue-500" }, { label: "Cancelled", value: metrics?.monthlyCancelledCount || 0, note: "cancelled orders", bars: [8, 5, 7, 4, 6, 3], color: "bg-rose-400" }].map((item) => <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"><div><p className="text-[11px] font-bold text-slate-500">{item.label}</p><p className="mt-1 text-xl font-black text-[#0C3B2E]">{item.value}</p><p className="mt-1 text-[10px] font-medium text-slate-400">{item.note}</p></div><div className="flex h-12 items-end gap-1.5">{item.bars.map((height, index) => <span key={index} style={{ height: `${height * 4}px` }} className={`w-2 rounded-full ${item.color} opacity-70`} />)}</div><ArrowUpRight className="h-4 w-4 self-start text-slate-300" /></div>)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-extrabold text-[#0C3B2E]">Recent orders</h3><Link href="/admin/orders" className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-700">View all <ChevronRight className="h-3.5 w-3.5" /></Link></div>
        <div className="mb-3 flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold outline-none focus:border-emerald-600" /></div><button onClick={() => setFilter(filter === "All" ? "Placed" : "All")} className={`flex h-10 items-center gap-1 rounded-xl px-3 text-xs font-bold ${filter !== "All" ? "bg-[#0C3B2E] text-white" : "border border-slate-200 bg-white text-slate-600"}`}><Filter className="h-3.5 w-3.5" />{filter === "All" ? "Filter" : filter}</button></div>
        <div className="space-y-3">
          {filteredOrders.length === 0 ? <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-2 text-xs font-bold text-slate-500">No matching orders</p><p className="mt-1 text-[10px] text-slate-400">New orders will appear here automatically.</p></div> : filteredOrders.slice(0, 5).map((order) => <div key={order._id} onTouchStart={(event) => handleTouchStart(event, order._id)} onTouchEnd={handleTouchEnd} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"><div className={`flex items-center justify-between p-4 transition-transform duration-200 ${swipedOrder === order._id ? "-translate-x-28" : ""}`}><div className="min-w-0"><div className="flex items-center gap-2"><p className="text-xs font-black text-[#0C3B2E]">#{order._id.slice(-6).toUpperCase()}</p><span className={`rounded-full px-2 py-1 text-[9px] font-extrabold ${statusStyles[order.orderStatus] || "bg-slate-100 text-slate-600"}`}>{order.orderStatus}</span></div><p className="mt-2 truncate text-xs font-bold text-slate-700">{order.userId?.name || "Guest customer"}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400"><Clock3 className="h-3 w-3" />{new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{order.deliveredBy?.name ? ` · ${order.deliveredBy.name}` : " · Unassigned"}</p></div><div className="pl-3 text-right"><p className="text-sm font-black text-[#0C3B2E]">₹{order.totalAmount}</p><Link href="/admin/orders" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">Details <ChevronRight className="h-3 w-3" /></Link></div></div><div className="absolute right-0 top-0 flex h-full w-28 items-center justify-center gap-1 bg-[#0C3B2E] text-white"><button aria-label="Accept order" className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500"><Check className="h-4 w-4" /></button><button aria-label="Reject order" className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500"><X className="h-4 w-4" /></button></div></div>)}
        </div>
      </section>

      <button onClick={() => router.push("/admin/orders")} className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-amber-400 text-[#0C3B2E] shadow-[0_8px_20px_rgba(245,158,11,0.35)]" aria-label="Create new order"><Plus className="h-6 w-6" /></button>
    </div>
  );
}
