"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  PhoneCall,
  HelpCircle,
  Receipt,
  XCircle,
  Truck,
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
          <div className="h-10 w-48 bg-white border border-[#0C3B2E]/10 animate-pulse rounded-full mt-4" />
          <div className="h-44 bg-white border border-[#0C3B2E]/10 animate-pulse rounded-3xl mt-6" />
          <div className="h-64 bg-white border border-[#0C3B2E]/10 animate-pulse rounded-3xl mt-6" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F5] text-slate-900 font-sans">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-4">
          <h2 className="text-2xl font-bold text-[#0C3B2E]">Order Not Found</h2>
          <p className="text-xs text-slate-500">The requested order ID does not exist.</p>
          <Link
            href="/orders"
            className="inline-flex items-center px-6 py-3 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white text-xs font-semibold shadow-sm transition"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStageIndex = STATUS_STAGES.indexOf(order.orderStatus);

  return (
    <div className="flex-1 flex flex-col pb-16 bg-[#FAF8F5] text-slate-900 font-sans">
      {/* Header Container matching Evergreen Botanical Sage & Cream Theme */}
      <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Link
              href="/orders"
              className="w-10 h-10 rounded-full bg-white border border-[#0C3B2E]/15 text-[#0C3B2E] hover:bg-[#EAF5EF] flex items-center justify-center transition shadow-2xs shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
                Track Order
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                #{order._id.slice(-6).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowInvoice(true)}
              className="px-4 py-2 rounded-full bg-[#0C3B2E] text-white hover:bg-[#145341] text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">View</span>
              <span>Invoice</span>
            </button>

            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                order.orderStatus === "Cancelled"
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-white text-[#0C3B2E] border-[#0C3B2E]/20 shadow-2xs"
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Headline Banner & Live Timeline */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status Headline Banner */}
            <div
              className={`p-6 sm:p-8 rounded-3xl shadow-xs relative overflow-hidden space-y-2 text-white ${
                order.orderStatus === "Cancelled"
                  ? "bg-gradient-to-br from-red-800 to-red-950"
                  : "bg-gradient-to-br from-[#0C3B2E] to-[#155240]"
              }`}
            >
              <div className="absolute -right-8 -top-8 w-44 h-44 bg-amber-300/10 rounded-full blur-2xl pointer-events-none" />
              <p className="text-[11px] text-amber-300 font-bold uppercase tracking-widest">
                Order Live Status
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {order.orderStatus === "Placed" && "Order Received"}
                {order.orderStatus === "Accepted" && "Order Accepted by Kitchen"}
                {order.orderStatus === "Preparing" && "Chef is Preparing Your Meal"}
                {order.orderStatus === "Ready" && "Ready for Delivery Partner"}
                {order.orderStatus === "Out for Delivery" && "Out for Delivery 🛵"}
                {order.orderStatus === "Delivered" && "Delivered! Bon Appétit"}
                {order.orderStatus === "Cancelled" && "Order Cancelled"}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
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
              <div className="bg-white p-6 rounded-3xl border border-[#0C3B2E]/15 shadow-2xs space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#0C3B2E]/10 pb-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0C3B2E]">
                    <span className="w-7 h-7 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 flex items-center justify-center">
                      <Truck className="w-3.5 h-3.5 text-[#0C3B2E]" />
                    </span>
                    <span>Your Delivery Partner</span>
                  </div>

                  {order.deliveredBy?.employeeId && (
                    <span className="px-3 py-1 rounded-full bg-amber-300/35 text-[#0C3B2E] border border-amber-400/50 font-mono text-[11px] font-bold">
                      {order.deliveredBy.employeeId}
                    </span>
                  )}
                </div>

                {order.deliveredBy ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#0C3B2E] text-amber-300 font-bold text-lg flex items-center justify-center shadow-2xs shrink-0">
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
                          <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            📱 {order.deliveredBy.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    {order.orderStatus === "Out for Delivery" && order.deliveredBy.phone ? (
                      <a
                        href={`tel:${order.deliveredBy.phone}`}
                        className="px-5 py-3 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition transform active:scale-95"
                      >
                        <PhoneCall className="w-4 h-4 text-amber-300 animate-bounce" />
                        <span>Call Delivery Agent</span>
                      </a>
                    ) : order.orderStatus === "Delivered" ? (
                      <span className="px-4 py-2 rounded-full bg-[#EAF5EF] text-[#0C3B2E] border border-[#0C3B2E]/20 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0C3B2E]" />
                        <span>Delivered Successfully</span>
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        Phone number unavailable
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-xs text-slate-600 bg-[#FAF8F5] border border-[#0C3B2E]/10 p-3.5 rounded-2xl">
                    <UserCheck className="w-4 h-4 text-[#0C3B2E] shrink-0" />
                    <span>
                      Delivery executive assigned. Contact restaurant support if you need assistance.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Cancellation Details Banner */}
            {order.orderStatus === "Cancelled" && (
              <div className="bg-red-50/90 p-6 rounded-3xl border border-red-200 space-y-2.5 text-xs text-red-900 shadow-2xs">
                <div className="flex items-center gap-2 font-bold uppercase text-sm text-red-800">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>Cancellation Information</span>
                </div>
                <div className="space-y-1.5 pl-7 text-slate-700 font-medium">
                  <p>
                    <strong className="text-slate-900">Cancelled By:</strong>{" "}
                    <span className="font-bold text-red-800">
                      {order.cancelledBy?.name || "Restaurant Staff"} ({order.cancelledBy?.role || "Staff"})
                    </span>
                  </p>
                  {order.cancelledAt && (
                    <p>
                      <strong className="text-slate-900">Cancelled Time:</strong>{" "}
                      {new Date(order.cancelledAt).toLocaleString()}
                    </p>
                  )}
                  {order.cancelReason && (
                    <p>
                      <strong className="text-slate-900">Reason:</strong> {order.cancelReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Timeline UI */}
            {order.orderStatus !== "Cancelled" && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#0C3B2E]">
                  Live Kitchen Timeline
                </h3>

                <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAF5EF]">
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
                      <div key={step.status} className="relative flex items-start gap-4">
                        <div
                          className={`absolute -left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isDone
                              ? "bg-[#0C3B2E] text-amber-300 shadow-2xs"
                              : "bg-[#EAF5EF] text-slate-400 border border-[#0C3B2E]/10"
                          } ${isCurrent ? "ring-4 ring-[#EAF5EF] scale-110" : ""}`}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-[#0C3B2E]/30" />
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
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {step.desc}
                          </p>
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
            <div className="bg-white p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-3">
              <div className="flex items-center gap-2.5 text-sm font-bold text-[#0C3B2E]">
                <span className="w-8 h-8 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#0C3B2E]" />
                </span>
                <span>Delivery Address</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 pl-10 leading-relaxed font-medium">
                {order.address?.address}
              </p>
            </div>

            {/* Itemized Order Summary Box */}
            <div className="bg-white p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-4">
              <h3 className="text-lg font-bold text-[#0C3B2E] border-b border-[#0C3B2E]/10 pb-3.5">
                Itemized Summary
              </h3>

              <div className="space-y-3">
                {order.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs sm:text-sm">
                    <span className="font-medium text-slate-800">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold text-[#0C3B2E]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}

                <div className="border-t border-[#0C3B2E]/10 pt-4 text-xs sm:text-sm text-slate-600 space-y-2.5">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="font-semibold text-[#0C3B2E]">
                      {order.paymentMethod || "Cash On Delivery (COD)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-base font-extrabold text-[#0C3B2E] pt-3 border-t border-[#0C3B2E]/10">
                    <span>Total Amount</span>
                    <span className="text-xl text-[#0C3B2E]">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Need Help Action */}
            <div className="space-y-3">
              <button
                onClick={() => setShowInvoice(true)}
                className="w-full py-3.5 px-5 rounded-full bg-white border border-[#0C3B2E]/20 text-[#0C3B2E] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#EAF5EF] transition shadow-2xs cursor-pointer"
              >
                <Receipt className="w-4 h-4 text-[#0C3B2E]" />
                <span>View Receipt / Invoice</span>
              </button>

              <Link
                href="/help"
                className="w-full py-3.5 px-5 rounded-full bg-[#EAF5EF] text-[#0C3B2E] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#0C3B2E]/15 hover:bg-[#dceee4] transition shadow-2xs"
              >
                <HelpCircle className="w-4 h-4 text-[#0C3B2E]" />
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