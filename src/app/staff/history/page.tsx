"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  History,
  Search,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";

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
  address: { address: string };
  userId?: { name: string; phone: string; email: string };
  createdAt: string;
  deliveredAt?: string;
  cancelledBy?: { name?: string; role?: string };
  cancelledAt?: string;
  cancelReason?: string;
}

export default function StaffHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "yesterday" | "week">("all");

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (res.ok) {
        const data = await res.json();
        // History displays Delivered and Cancelled orders
        const historyList = (data.orders || []).filter(
          (o: Order) => o.orderStatus === "Delivered" || o.orderStatus === "Cancelled"
        );
        setOrders(historyList);
      }
    } catch (e) {
      console.error("Failed to fetch order history:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter history by search term and date filter
  const filteredHistory = orders.filter((order) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const orderNo = order._id.slice(-6).toLowerCase();
      const customerName = order.userId?.name?.toLowerCase() || "";
      const phone = order.userId?.phone?.toLowerCase() || "";
      const cancelledBy = order.cancelledBy?.name?.toLowerCase() || "";
      const matches =
        orderNo.includes(term) ||
        customerName.includes(term) ||
        phone.includes(term) ||
        cancelledBy.includes(term);
      if (!matches) return false;
    }

    if (dateFilter === "all") return true;

    const orderDate = new Date(order.deliveredAt || order.cancelledAt || order.createdAt);
    const now = new Date();

    if (dateFilter === "today") {
      return orderDate.toDateString() === now.toDateString();
    }

    if (dateFilter === "yesterday") {
      const yest = new Date();
      yest.setDate(now.getDate() - 1);
      return orderDate.toDateString() === yest.toDateString();
    }

    if (dateFilter === "week") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return orderDate >= sevenDaysAgo;
    }

    return true;
  });

  const totalDeliveredRevenue = filteredHistory
    .filter((o) => o.orderStatus === "Delivered")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E] flex items-center space-x-2">
            <History className="w-7 h-7 text-emerald-700" />
            <span>Staff Order History & Reports</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Archived logs for delivered and cancelled order tickets
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-white border border-[#E6E2D8] text-[#0C3B2E] text-xs font-bold hover:bg-slate-50 transition flex items-center space-x-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
            Total Orders Logged
          </span>
          <p className="text-3xl font-extrabold text-[#0C3B2E] mt-1">{filteredHistory.length}</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft">
          <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wide">
            Delivered Count
          </span>
          <p className="text-3xl font-extrabold text-emerald-700 mt-1">
            {filteredHistory.filter((o) => o.orderStatus === "Delivered").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8] shadow-card-soft">
          <span className="text-xs font-extrabold text-purple-800 uppercase tracking-wide">
            Filtered Total Revenue
          </span>
          <p className="font-serif text-3xl font-extrabold text-[#0C3B2E] mt-1">
            ₹{totalDeliveredRevenue}
          </p>
        </div>
      </div>

      {/* Controls: Date Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-3xl border border-[#E6E2D8] shadow-card-soft space-y-4">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: "All History" },
            { id: "today", label: "Today" },
            { id: "yesterday", label: "Yesterday" },
            { id: "week", label: "Last 7 Days" },
          ].map((tab) => {
            const isActive = dateFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer ${
                  isActive
                    ? "bg-[#0C3B2E] text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search history by order #, customer name, phone, or cancelled by..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
        </div>
      </div>

      {/* History Table / List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#0C3B2E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E6E2D8] text-center space-y-3">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-slate-700">No History Logs Found</h3>
          <p className="text-xs text-slate-400">
            No completed or cancelled orders match your selected filters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-3 md:hidden">
            {filteredHistory.map((order) => {
              const isCancelled = order.orderStatus === "Cancelled";
              const eventDate = order.deliveredAt || order.cancelledAt || order.createdAt;

              return (
                <article key={order._id} className="rounded-2xl border border-[#E6E2D8] bg-white p-4 shadow-card-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-black text-[#0C3B2E]">
                        #{order._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-800">
                        {order.userId?.name || "Customer"}
                      </p>
                      <p className="text-[11px] text-slate-500">{order.userId?.phone || "No phone number"}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase ${
                        isCancelled
                          ? "border-red-300 bg-red-100 text-red-900"
                          : "border-emerald-300 bg-emerald-100 text-emerald-900"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-y border-slate-100 py-3 text-[11px]">
                    <div>
                      <p className="font-bold uppercase tracking-wide text-slate-400">Date & time</p>
                      <p className="mt-1 font-semibold text-slate-700">{new Date(eventDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-wide text-slate-400">Payment</p>
                      <p className="mt-1 font-semibold text-slate-700">{order.paymentMethod || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-wide text-slate-400">Amount</p>
                      <p className="mt-1 font-serif text-base font-extrabold text-[#0C3B2E]">₹{order.totalAmount}</p>
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-wide text-slate-400">Items</p>
                      <p className="mt-1 font-semibold text-slate-700">{order.items?.length || 0} item types</p>
                    </div>
                  </div>

                  {isCancelled ? (
                    <div className="rounded-xl bg-red-50 p-3 text-[11px] text-red-900">
                      <p className="font-extrabold">Cancelled by {order.cancelledBy?.name || "Staff"} ({order.cancelledBy?.role || "Staff"})</p>
                      <p className="mt-1">Reason: {order.cancelReason || "No reason provided"}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-[11px] font-bold text-emerald-900">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      Delivered successfully
                    </div>
                  )}

                  <Link
                    href={`/staff/orders/${order._id}`}
                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-100 text-xs font-extrabold text-[#0C3B2E] transition hover:bg-[#0C3B2E] hover:text-white"
                  >
                    View order details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-[#E6E2D8] bg-white shadow-card-soft md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E6E2D8] text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4 text-center">Payment Method</th>
                  <th className="p-4 text-center">Status / Cancellation Details</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHistory.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 font-medium">
                    <td className="p-4 font-mono font-black text-[#0C3B2E]">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{order.userId?.name || "Customer"}</p>
                      <p className="text-[11px] text-slate-500">{order.userId?.phone}</p>
                    </td>
                    <td className="p-4 text-slate-600">
                      {new Date(order.deliveredAt || order.cancelledAt || order.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-center font-bold text-slate-700">
                      {order.paymentMethod}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            order.orderStatus === "Delivered"
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : "bg-red-100 text-red-900 border-red-300"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                        {order.orderStatus === "Cancelled" && (
                          <span className="text-[10px] text-red-800 font-bold">
                            By: {order.cancelledBy?.name || "Staff"} ({order.cancelledBy?.role || "Staff"})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right font-serif font-extrabold text-sm text-[#0C3B2E]">
                      ₹{order.totalAmount}
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/staff/orders/${order._id}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-[#0C3B2E] hover:text-white transition inline-flex items-center text-slate-700"
                        title="View Details"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
