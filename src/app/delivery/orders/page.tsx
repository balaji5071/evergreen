"use client";

import React, { useEffect, useState } from "react";
import {
  Truck,
  Phone,
  MapPin,
  CheckCircle2,
  Navigation,
  RefreshCw,
  Receipt,
  Search,
  Clock,
  ExternalLink,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import InvoiceModal from "@/components/customer/InvoiceModal";

export default function DeliveryDashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("Active");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch delivery orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const handleMarkDelivered = async (orderId: string) => {
    if (!confirm("Confirm order has been handed over to customer & payment collected?")) {
      return;
    }
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus: "Delivered",
          paymentStatus: "Completed",
        }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to mark delivered:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
        }),
      });

      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter orders
  const activeOrders = orders.filter((o) => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled");
  const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered");

  const displayedOrders = filterStatus === "Active" ? activeOrders : deliveredOrders;

  return (
    <div className="min-h-screen bg-[#F7F5EE] pb-24 text-slate-800">
      {/* Top Delivery Header */}
      <header className="bg-[#0C3B2E] text-white p-4 sm:p-6 shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-700/80 rounded-2xl border border-emerald-500/30">
              <Truck className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-extrabold text-amber-300">
                Delivery Agent Portal
              </h1>
              <p className="text-xs text-emerald-200">Evergreen Cafe • Live Dispatch Console</p>
            </div>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Status Filter Tabs */}
        <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-[#E6E2D8] shadow-xs">
          <button
            onClick={() => setFilterStatus("Active")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center space-x-2 ${
              filterStatus === "Active"
                ? "bg-[#0C3B2E] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Active Deliveries</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-amber-300 text-[10px]">
              {activeOrders.length}
            </span>
          </button>

          <button
            onClick={() => setFilterStatus("Delivered")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center justify-center space-x-2 ${
              filterStatus === "Delivered"
                ? "bg-[#0C3B2E] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>Completed Orders</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {deliveredOrders.length}
            </span>
          </button>
        </div>

        {/* Orders List */}
        {loading && orders.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-40 bg-white animate-pulse rounded-3xl border border-[#E6E2D8]" />
            ))}
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E6E2D8] p-6 shadow-card-soft">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-[#0C3B2E]">
              {filterStatus === "Active" ? "No Active Deliveries" : "No Completed Deliveries Yet"}
            </h3>
            <p className="text-xs text-slate-500">New orders will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedOrders.map((order) => {
              const isDelivered = order.orderStatus === "Delivered";
              const isOutForDelivery = order.orderStatus === "Ready";

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-3xl border border-[#E6E2D8] p-5 shadow-card-soft space-y-4 hover:shadow-md transition"
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Order #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <h4 className="font-extrabold text-base text-[#0C3B2E]">
                        ₹{order.totalAmount} • {order.paymentMethod || "COD"}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                          isDelivered
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                        title="View Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start space-x-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#0C3B2E] block">
                          Delivery Address ({order.address?.title || "Home"}):
                        </span>
                        <p className="text-slate-600 leading-relaxed font-medium mt-0.5">
                          {order.address?.address || "Address details unavailable"}
                        </p>
                      </div>
                    </div>

                    {order.userId?.phone && (
                      <div className="flex items-center justify-between pt-1">
                        <span className="font-bold text-slate-500">Customer Contact:</span>
                        <a
                          href={`tel:${order.userId?.phone}`}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 hover:bg-emerald-100 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {order.userId?.phone}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Items Brief */}
                  <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1">
                    <p className="font-bold text-slate-500 uppercase text-[10px]">Order Items:</p>
                    {order.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between font-medium text-slate-700">
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Actions */}
                  {!isDelivered && (
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      {order.address?.address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            order.address.address
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-extrabold hover:bg-slate-200 transition flex items-center justify-center space-x-2"
                        >
                          <Navigation className="w-4 h-4 text-emerald-700" />
                          <span>Navigate Map</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      )}

                      <button
                        onClick={() => handleMarkDelivered(order._id)}
                        disabled={updatingId === order._id}
                        className="flex-1 py-3.5 rounded-xl btn-emerald text-xs font-extrabold shadow-lg flex items-center justify-center space-x-2 hover:scale-[1.01] cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {updatingId === order._id
                            ? "Updating..."
                            : `Mark Delivered & Collect ₹${order.totalAmount}`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Receipt Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
