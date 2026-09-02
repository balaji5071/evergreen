"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle2, Clock, MapPin, Receipt } from "lucide-react";
import Logo from "@/components/customer/Logo";

export default function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#FAF8F5]">
        <div className="w-10 h-10 border-4 border-[#0C3B2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF8F5]">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-[#E6E2D8] shadow-card-soft space-y-4">
          <h2 className="font-serif text-2xl font-bold text-[#0C3B2E]">Receipt Not Found</h2>
          <p className="text-xs text-slate-500">Could not locate receipt for order #{id}.</p>
          <Link href="/orders" className="inline-flex items-center px-6 py-3 rounded-full btn-emerald text-xs font-bold shadow-md">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isDelivered =
    order.orderStatus === "Delivered" || order.paymentStatus === "Completed";

  const handlePrint = () => {
    window.print();
  };

  const invoiceNo = `EVG-${order._id ? order._id.slice(-6).toUpperCase() : "0000"}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subtotal = order.items
    ? order.items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0)
    : order.totalAmount;
  
  const deliveryFee = order.totalAmount > 300 ? 0 : 30;

  return (
    <div className="flex-1 flex flex-col py-8 px-4 bg-[#FAF8F5] items-center">
      {/* Top Action Bar (Screen Only) */}
      <div className="w-full max-w-sm mb-4 flex items-center justify-between print:hidden">
        <Link
          href={`/orders/${id}`}
          className="px-3.5 py-2 rounded-xl bg-white border border-[#E6E2D8] text-xs font-bold text-[#0C3B2E] flex items-center space-x-1.5 shadow-xs hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-[#0C3B2E] text-white hover:bg-[#07251D] font-bold text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-amber-300" />
          <span>Print Mini Receipt</span>
        </button>
      </div>

      {/* Mini Thermal Receipt Card */}
      <div className="w-full max-w-sm bg-[#FFFDF9] rounded-3xl border border-[#E6E2D8] shadow-2xl p-6 font-mono text-xs text-slate-800 space-y-4">
        {/* Header Logo & Title */}
        <div className="text-center space-y-1 pb-2 border-b border-dashed border-slate-300">
          <div className="flex justify-center mb-1">
            <Logo size="sm" showText={true} />
          </div>
          <p className="font-sans text-xs font-extrabold text-[#0C3B2E] uppercase tracking-wider">
            Evergreen Cafe & Restaurant
          </p>
          <p className="text-[10px] text-slate-500 font-sans">
            Ravan Gali, Nisha Complex, Ambagarh Chowki
          </p>
          <p className="text-[10px] text-slate-500 font-sans">Ph: +91 98765 43210</p>
        </div>

        {/* Receipt Info */}
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-500">Receipt No:</span>
            <span className="font-bold text-slate-900">{invoiceNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date:</span>
            <span>{orderDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Order Status:</span>
            <span className="font-bold text-emerald-800">{order.orderStatus}</span>
          </div>
        </div>

        {/* Payment Status Banner */}
        <div
          className={`p-2.5 rounded-xl border text-center font-sans space-y-0.5 ${
            isDelivered
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-amber-50 border-amber-300 text-amber-900"
          }`}
        >
          <p className="font-extrabold text-[11px] uppercase tracking-wider">
            {isDelivered ? "✓ PAID IN FULL" : "⏳ PAY ON DELIVERY"}
          </p>
          <p className="text-[10px] text-slate-600">
            {isDelivered
              ? "Cash Collected on Delivery"
              : "Cash to be collected upon Delivery"}
          </p>
        </div>

        {/* Customer Details */}
        <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-[11px] font-sans">
          <p className="font-bold text-[#0C3B2E] uppercase text-[9px] tracking-wider">Customer:</p>
          <p className="font-bold text-slate-800">{order.userId?.name || "Customer"}</p>
          {order.userId?.phone && <p className="text-slate-600">Ph: {order.userId.phone}</p>}
          <p className="text-slate-600 text-[10px] leading-tight pt-0.5">{order.address?.address}</p>
        </div>

        {/* Items List */}
        <div className="pt-2 border-t border-dashed border-slate-300">
          <div className="flex justify-between font-bold text-[10px] uppercase tracking-wider text-slate-500 pb-1">
            <span>Qty x Item</span>
            <span>Amt</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start text-[11px]">
                <span className="pr-2 font-medium">
                  {item.quantity}x {item.name}
                </span>
                <span className="font-bold shrink-0">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="pt-2 border-t-2 border-dashed border-slate-400 space-y-1 text-[11px]">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Delivery Fee:</span>
            <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-[#0C3B2E] border-t border-slate-300 pt-1.5 mt-1 font-sans">
            <span>TOTAL AMOUNT:</span>
            <span>₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-3 border-t border-dashed border-slate-300 space-y-1 font-sans">
          <p className="text-[11px] font-bold text-[#0C3B2E]">Thank You! Visit Again 😊</p>
          <p className="text-[9px] text-slate-400">Evergreen Cafe • Ambagarh Chowki</p>
        </div>
      </div>
    </div>
  );
}
