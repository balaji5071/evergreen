"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  PhoneCall,
  HelpCircle,
  Utensils,
  Receipt,
  XCircle,
  Truck,
  ShieldCheck,
  Phone,
  UserCheck,
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import InvoiceModal from "@/components/customer/InvoiceModal";

const STATUS_STAGES = ["Placed", "Accepted", "Preparing", "Ready", "Out for Delivery", "Delivered"];

export default function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Socket.IO real-time order update listener
    const socket = getSocket();
    const handleSocketUpdate = (data: { orderId?: string; orderStatus?: string }) => {
      if (!data?.orderId || data.orderId === id) {
        fetchOrder();
      }
    };

    const handleCustomWindowUpdate = (e: any) => {
      if (!e?.detail?.orderId || e.detail.orderId === id) {
        fetchOrder();
      }
    };

    socket.on("order_updated", handleSocketUpdate);
    if (typeof window !== "undefined") {
      window.addEventListener("order_updated", handleCustomWindowUpdate);
    }

    const interval = setInterval(fetchOrder, 3000);

    return () => {
      socket.off("order_updated", handleSocketUpdate);
      if (typeof window !== "undefined") {
        window.removeEventListener("order_updated", handleCustomWindowUpdate);
      }
      clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-6 bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-xl mt-4" />
          <div className="h-44 bg-slate-200 animate-pulse rounded-3xl mt-6" />
          <div className="h-64 bg-slate-200 animate-pulse rounded-3xl mt-6" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F5]">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E6E2D8] shadow-card-soft space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#0C3B2E]">Order Not Found</h2>
          <p className="text-xs text-slate-500">The requested order ID does not exist.</p>
          <Link href="/orders" className="inline-flex items-center px-6 py-3 rounded-full btn-emerald text-xs font-bold shadow-md">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = STATUS_STAGES.indexOf(order.orderStatus);

  return (
    <div className="flex-1 flex flex-col pb-12 bg-[#FAF8F5]">
      {/* Header Container */}
      <header className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/orders"
              className="p-2.5 rounded-2xl bg-white border border-[#E6E2D8] text-[#0C3B2E] hover:bg-slate-50 transition shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
                Track Order
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                #{order._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowInvoice(true)}
              className="px-4 py-2 rounded-2xl bg-[#0C3B2E] text-white hover:bg-[#07251D] text-xs font-bold flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
            >
              <Receipt className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">View</span> Invoice
            </button>

            <span
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border ${
                order.orderStatus === "Cancelled"
                  ? "bg-red-100 text-red-800 border-red-300"
                  : "bg-emerald-100 text-emerald-800 border-emerald-300"
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Headline Banner & Live Timeline */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status Headline Banner */}
            <div
              className={`p-6 sm:p-8 rounded-3xl shadow-card relative overflow-hidden space-y-2 text-white ${
                order.orderStatus === "Cancelled" ? "bg-red-900" : "bg-[#0C3B2E]"
              }`}
            >
              <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <p className="text-xs text-amber-300 font-extrabold uppercase tracking-widest">
                Order Live Status
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold">
                {order.orderStatus === "Placed" && "Order Received"}
                {order.orderStatus === "Accepted" && "Order Accepted by Kitchen"}
                {order.orderStatus === "Preparing" && "Chef is Preparing Your Meal"}
                {order.orderStatus === "Ready" && "Ready for Delivery Partner"}
                {order.orderStatus === "Out for Delivery" && "Out for Delivery 🛵"}
                {order.orderStatus === "Delivered" && "Delivered! Bon Appétit"}
                {order.orderStatus === "Cancelled" && "Order Cancelled"}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100 font-light">
                {order.orderStatus === "Delivered"
                  ? "Your order was successfully delivered to your specified address."
                  : order.orderStatus === "Cancelled"
                  ? "This order was cancelled. Please check cancellation details below."
                  : order.orderStatus === "Out for Delivery"
                  ? "Your delivery partner is on the way with your food!"
                  : "Estimated delivery window: 15-25 mins"}
              </p>
            </div>

            {/* Delivery Partner Contact Card (Displayed when Out for Delivery or Delivered) */}
            {(order.orderStatus === "Out for Delivery" || order.orderStatus === "Delivered") && (
              <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-card space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-3">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#0C3B2E]">
                    <Truck className="w-5 h-5 text-emerald-700" />
                    <span>Your Delivery Partner</span>
                  </div>

                  {order.deliveredBy?.employeeId && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-black">
                      {order.deliveredBy.employeeId}
                    </span>
                  )}
                </div>

                {order.deliveredBy ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#0C3B2E] text-amber-300 font-bold text-lg flex items-center justify-center shadow-sm">
                        {order.deliveredBy.name ? order.deliveredBy.name[0].toUpperCase() : "D"}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-[#0C3B2E]">
                          {order.deliveredBy.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {order.deliveredBy.role || "Evergreen Delivery Executive"}
                        </p>
                        {order.deliveredBy.phone && (
                          <p className="text-xs font-bold text-slate-700 mt-0.5">
                            📱 {order.deliveredBy.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {order.orderStatus === "Out for Delivery" && order.deliveredBy.phone ? (
                      <a
                        href={`tel:${order.deliveredBy.phone}`}
                        className="px-5 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg transition transform active:scale-95"
                      >
                        <PhoneCall className="w-4 h-4 text-amber-300 animate-bounce" />
                        <span>Call Delivery Agent</span>
                      </a>
                    ) : order.orderStatus === "Delivered" ? (
                      <span className="px-4 py-2.5 rounded-2xl bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-extrabold flex items-center space-x-1.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Delivered Successfully</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Phone number unavailable
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                    <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Delivery executive assigned. Contact restaurant support if you need assistance.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Cancellation Details Banner */}
            {order.orderStatus === "Cancelled" && (
              <div className="bg-red-50 p-6 rounded-3xl border border-red-200 space-y-2 text-xs text-red-900 shadow-sm">
                <div className="flex items-center space-x-2 font-black uppercase text-sm text-red-800">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>Cancellation Information</span>
                </div>
                <div className="space-y-1 pl-7 text-slate-700 font-medium">
                  <p>
                    <strong>Cancelled By:</strong>{" "}
                    <span className="font-bold text-red-900">
                      {order.cancelledBy?.name || "Restaurant Staff"} ({order.cancelledBy?.role || "Staff"})
                    </span>
                  </p>
                  {order.cancelledAt && (
                    <p>
                      <strong>Cancelled Time:</strong>{" "}
                      {new Date(order.cancelledAt).toLocaleString()}
                    </p>
                  )}
                  {order.cancelReason && (
                    <p>
                      <strong>Reason:</strong> {order.cancelReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Timeline UI */}
            {order.orderStatus !== "Cancelled" && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-6">
                <h3 className="font-serif text-xl font-bold text-[#0C3B2E]">Live Kitchen Timeline</h3>

                <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {[
                    { status: "Placed", label: "Order Placed", desc: "We have received your order details." },
                    { status: "Accepted", label: "Order Accepted", desc: "Evergreen kitchen accepted your order." },
                    { status: "Preparing", label: "Preparing Meal", desc: "Chef is preparing fresh handcrafted ingredients." },
                    { status: "Ready", label: "Ready for Dispatch", desc: "Order is packed and ready." },
                    { status: "Out for Delivery", label: "Out For Delivery", desc: "Delivery partner is on the way to you." },
                    { status: "Delivered", label: "Delivered", desc: "Food delivered at your specified doorstep." },
                  ].map((step, idx) => {
                    const isDone = currentStageIndex >= idx;
                    const isCurrent = currentStageIndex === idx;

                    return (
                      <div key={step.status} className="relative flex items-start space-x-4">
                        <div
                          className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isDone
                              ? "bg-[#0C3B2E] text-white shadow-md"
                              : "bg-slate-200 text-slate-400"
                          } ${isCurrent ? "ring-4 ring-emerald-100 scale-110" : ""}`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-400" />
                          )}
                        </div>

                        <div>
                          <h4
                            className={`text-sm sm:text-base font-bold ${
                              isDone ? "text-[#0C3B2E]" : "text-slate-400"
                            }`}
                          >
                            {step.label}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Address, Order Summary & Help */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Address Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-3">
              <div className="flex items-center space-x-2 text-sm font-bold text-[#0C3B2E]">
                <MapPin className="w-5 h-5 text-emerald-800" />
                <span>Delivery Address</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed font-medium">
                {order.address?.address}
              </p>
            </div>

            {/* Itemized Order Summary Box */}
            <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4">
              <h3 className="font-serif text-xl font-bold text-[#0C3B2E] border-b border-[#E6E2D8]/60 pb-3">
                Itemized Summary
              </h3>

              <div className="space-y-3">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-semibold text-slate-800">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-extrabold text-[#0C3B2E]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}

                <div className="border-t border-[#E6E2D8] pt-4 text-xs sm:text-sm text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="font-bold text-[#0C3B2E]">
                      {order.paymentMethod || "Cash On Delivery (COD)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-base font-extrabold text-[#0C3B2E] pt-2 border-t border-slate-100">
                    <span>Total Amount</span>
                    <span className="text-xl">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help Action */}
            <div className="space-y-3">
              <button
                onClick={() => setShowInvoice(true)}
                className="w-full py-3.5 rounded-2xl bg-white border border-[#0C3B2E] text-[#0C3B2E] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 hover:bg-[#EAF5EF] transition shadow-xs cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>View Receipt / Invoice</span>
              </button>

              <Link
                href="/help"
                className="w-full py-3.5 rounded-2xl bg-[#EAF5EF] text-[#0C3B2E] font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border border-emerald-200 hover:bg-emerald-100 transition shadow-xs"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Need help with this order? Contact Support</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Invoice Modal */}
      {showInvoice && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}
