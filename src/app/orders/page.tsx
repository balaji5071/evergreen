"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, CheckCircle2, RotateCcw, ChevronRight, PackageCheck, ClipboardList, Receipt } from "lucide-react";
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
      <div className="flex-1 flex flex-col pb-24 md:pb-12 bg-[#FAF8F5]">
        <header className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">Your Orders</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20 px-6 space-y-4 bg-white rounded-3xl border border-[#E6E2D8] max-w-lg mx-auto shadow-card-soft">
            <div className="w-20 h-20 rounded-full bg-[#EAF5EF] text-[#0C3B2E] flex items-center justify-center mx-auto text-3xl shadow-sm">
              📋
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#0C3B2E]">Sign in to view orders</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Log in to view active order status tracking and past order history.
            </p>
            <div className="pt-2">
              <Link
                href="/users"
                className="inline-flex items-center px-8 py-3.5 rounded-2xl btn-emerald text-sm font-bold shadow-lg hover:shadow-xl transition"
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
    <div className="flex-1 flex flex-col pb-36 md:pb-12 bg-[#FAF8F5]">
      {/* Header Container */}
      <header className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#EAF5EF] rounded-2xl text-[#0C3B2E]">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
                Your Orders
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Track live active meals and view complete order history
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-40 bg-white/80 animate-pulse rounded-3xl border border-[#E6E2D8]"
              />
            ))}
          </div>
        ) : (
          <>
            {/* Active Orders Section */}
            <section className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="font-serif text-xl font-bold text-[#0C3B2E]">
                  Active Orders ({activeOrders.length})
                </h2>
              </div>

              {activeOrders.length === 0 ? (
                <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 text-center space-y-1">
                  <p className="text-xs sm:text-sm text-slate-500">No active orders right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3">
                        <div>
                          <p className="font-extrabold text-sm text-[#0C3B2E]">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>

                        <span className="px-3.5 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold animate-pulse border border-amber-300">
                          {order.orderStatus}...
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-600 space-y-1.5">
                        <p className="font-semibold text-slate-800">
                          {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                        <p className="font-extrabold text-[#0C3B2E] text-base">₹{order.totalAmount}</p>
                      </div>

                      <div className="pt-2 flex items-center space-x-2">
                        <Link
                          href={`/orders/${order._id}`}
                          className="flex-1 py-3 rounded-2xl bg-[#0C3B2E] text-white text-xs sm:text-sm font-bold text-center flex items-center justify-center space-x-1.5 hover:bg-[#07251D] transition shadow-md"
                        >
                          <span>Track Live Order</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-3.5 py-3 rounded-2xl bg-white border border-[#E6E2D8] text-[#0C3B2E] hover:bg-[#EAF5EF] transition text-xs font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
                          title="View Order Receipt"
                        >
                          <Receipt className="w-4 h-4 text-emerald-700" />
                          <span className="hidden sm:inline">Invoice</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Orders Section */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <PackageCheck className="w-5 h-5 text-emerald-700" />
                <h2 className="font-serif text-xl font-bold text-[#0C3B2E]">
                  Past Orders ({pastOrders.length})
                </h2>
              </div>

              {pastOrders.length === 0 ? (
                <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 text-center space-y-1">
                  <p className="text-xs sm:text-sm text-slate-500">No past order history found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastOrders.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3">
                        <div>
                          <p className="font-extrabold text-sm text-[#0C3B2E]">
                            Order #{order._id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        <span
                          className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
                            order.orderStatus === "Delivered"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : "bg-red-100 text-red-700 border border-red-300"
                          }`}
                        >
                          {order.orderStatus}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-slate-600 space-y-1.5">
                        <p className="text-slate-700">
                          {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                        </p>
                        <p className="font-extrabold text-[#0C3B2E] text-base">₹{order.totalAmount}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                        <button
                          onClick={() => handleReorder(order.items)}
                          className="px-3.5 py-2.5 rounded-xl bg-[#EAF5EF] text-[#0C3B2E] text-xs font-bold flex items-center space-x-1.5 hover:bg-[#0C3B2E] hover:text-white transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder</span>
                        </button>

                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E6E2D8] text-[#0C3B2E] text-xs font-bold flex items-center space-x-1.5 hover:bg-[#EAF5EF] transition cursor-pointer shadow-xs"
                        >
                          <Receipt className="w-3.5 h-3.5 text-emerald-700" />
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
