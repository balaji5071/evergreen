"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  RotateCcw,
  ChevronRight,
  PackageCheck,
  ClipboardList,
  Receipt,
} from "lucide-react";
import BottomNav from "@/components/customer/BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import InvoiceModal from "@/components/customer/InvoiceModal";
import { getSocket } from "@/lib/socket";

export default function OrdersPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setActiveOrders(data.activeOrders || []);
        setPastOrders(data.pastOrders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const socket = getSocket();
    const handleUpdate = () => loadOrders();

    socket.on("order_updated", handleUpdate);
    socket.on("new_order", handleUpdate);

    const interval = setInterval(loadOrders, 6000);

    return () => {
      socket.off("order_updated", handleUpdate);
      socket.off("new_order", handleUpdate);
      clearInterval(interval);
    };
  }, [user]);

  const handleReorder = (items: any[]) => {
    items.forEach((item) => {
      addToCart({
        _id: item.menuItemId,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
      });
    });
  };

  if (!user) {
    return (
      <div className="flex-1 flex flex-col pb-24 md:pb-12 bg-[#FAF8F5] text-slate-900 font-sans">
        <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
              Your Orders
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 px-6 space-y-4 bg-white rounded-3xl border border-[#0C3B2E]/10 max-w-lg mx-auto shadow-xs">
            <div className="w-20 h-20 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/10 text-[#0C3B2E] flex items-center justify-center mx-auto text-3xl shadow-2xs">
              📋
            </div>
            <h2 className="text-2xl font-bold text-[#0C3B2E]">
              Sign in to view orders
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xs mx-auto leading-relaxed">
              Log in to view active order status tracking and past order history.
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-3.5 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white text-sm font-semibold shadow-sm transition"
              >
                <span>Sign In Now</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-36 md:pb-12 bg-[#FAF8F5] text-slate-900 font-sans">
      {/* Header Container matching Evergreen Botanical Sage & Cream Hero */}
      <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center shadow-2xs shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
                Your Orders
              </h1>
              <p className="text-xs text-slate-600">
                Track live active meals and view complete order history
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-44 bg-white animate-pulse rounded-3xl border border-[#0C3B2E]/10"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Active Orders Section */}
            <section className="space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-amber-300/35 border border-amber-400/50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-[#0C3B2E]" />
                </span>
                <h2 className="text-xl font-bold text-[#0C3B2E]">
                  Active Orders ({activeOrders.length})
                </h2>
              </div>

              {activeOrders.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-[#0C3B2E]/10 text-center shadow-2xs">
                  <p className="text-xs sm:text-sm text-slate-500">
                    No active orders right now.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs hover:shadow-md hover:border-[#0C3B2E]/25 space-y-4 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between border-b border-[#0C3B2E]/10 pb-3.5">
                        <div>
                          <p className="font-bold text-sm text-[#0C3B2E]">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <span className="px-3.5 py-1 rounded-full bg-amber-300/40 text-[#0C3B2E] text-xs font-bold animate-pulse border border-amber-400/60">
                          {order.orderStatus}...
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-600 space-y-1.5">
                        <p className="font-semibold text-slate-800">
                          {order.items
                            .map((i: any) => `${i.quantity}x ${i.name}`)
                            .join(", ")}
                        </p>
                        <p className="font-extrabold text-[#0C3B2E] text-base">
                          ₹{order.totalAmount}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-2.5">
                        <Link
                          href={`/orders/${order._id}`}
                          className="flex-1 py-2.5 px-4 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white text-xs sm:text-sm font-semibold text-center flex items-center justify-center gap-1.5 transition shadow-2xs"
                        >
                          <span>Track Live Order</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-4 py-2.5 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 text-[#0C3B2E] hover:bg-[#dceee4] transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          title="View Order Receipt"
                        >
                          <Receipt className="w-4 h-4 text-[#0C3B2E]" />
                          <span className="hidden sm:inline">Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Orders Section */}
            <section className="space-y-5 pt-2">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 flex items-center justify-center">
                  <PackageCheck className="w-4 h-4 text-[#0C3B2E]" />
                </span>
                <h2 className="text-xl font-bold text-[#0C3B2E]">
                  Past Orders ({pastOrders.length})
                </h2>
              </div>

              {pastOrders.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-[#0C3B2E]/10 text-center shadow-2xs">
                  <p className="text-xs sm:text-sm text-slate-500">
                    No past order history found.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs hover:shadow-md hover:border-[#0C3B2E]/25 space-y-4 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between border-b border-[#0C3B2E]/10 pb-3.5">
                        <div>
                          <p className="font-bold text-sm text-[#0C3B2E]">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <span
                          className={`px-3.5 py-1 rounded-full text-xs font-bold ${
                            order.orderStatus === "Delivered"
                              ? "bg-[#EAF5EF] text-[#0C3B2E] border border-[#0C3B2E]/20"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-600 space-y-1.5">
                        <p className="text-slate-700 font-medium">
                          {order.items
                            .map((i: any) => `${i.quantity}x ${i.name}`)
                            .join(", ")}
                        </p>
                        <p className="font-extrabold text-[#0C3B2E] text-base">
                          ₹{order.totalAmount}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#0C3B2E]/10 gap-2">
                        <button
                          onClick={() => handleReorder(order.items)}
                          className="px-4 py-2 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 text-[#0C3B2E] text-xs font-bold flex items-center gap-1.5 hover:bg-[#0C3B2E] hover:text-white transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>

                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-4 py-2 rounded-full bg-white border border-[#0C3B2E]/15 text-[#0C3B2E] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#EAF5EF] transition cursor-pointer shadow-2xs"
                        >
                          <Receipt className="w-3.5 h-3.5 text-[#0C3B2E]" />
                          <span>View Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNav />

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </div>
  );
}