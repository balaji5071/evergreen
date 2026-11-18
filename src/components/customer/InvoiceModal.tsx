"use client";

import React from "react";
import { X, Printer, Receipt } from "lucide-react";
import Logo from "./Logo";

interface InvoiceModalProps {
  order: any;
  onClose: () => void;
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  if (!order) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0C3B2E]/50 backdrop-blur-xs animate-in fade-in duration-200 font-sans">
      {/* Mini Receipt Modal Card */}
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-[#0C3B2E]/15 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Screen Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#0C3B2E] to-[#155240] text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-amber-300" />
            </span>
            <span className="text-sm font-bold tracking-tight">Mini Order Receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-full bg-amber-400 text-[#0C3B2E] hover:bg-amber-300 font-bold text-xs flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Receipt Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-800 space-y-4 bg-[#FAF8F5]">
          {/* Receipt Top Logo & Address */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-[#0C3B2E]/20">
            <div className="flex justify-center mb-1.5">
              <Logo size="sm" showText={true} />
            </div>
            <p className="font-sans text-[11px] font-bold text-[#0C3B2E] uppercase tracking-wider">
              Evergreen Cafe &amp; Restaurant
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
              <span className="font-bold text-[#0C3B2E]">{invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span>{orderDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Order Status:</span>
              <span className="font-bold text-[#0C3B2E]">{order.orderStatus}</span>
            </div>
          </div>

          {/* Payment Status Banner */}
          <div
            className={`p-3 rounded-2xl border text-center font-sans space-y-0.5 ${
              isDelivered
                ? "bg-[#EAF5EF] border-[#0C3B2E]/20 text-[#0C3B2E]"
                : "bg-amber-300/30 border-amber-400/50 text-[#0C3B2E]"
            }`}
          >
            <p className="font-extrabold text-[11px] uppercase tracking-wider">
              {isDelivered ? "✓ PAID IN FULL" : "⏳ PAY ON DELIVERY"}
            </p>
            <p className="text-[10px] text-slate-600 font-medium">
              {isDelivered
                ? "Cash Collected on Delivery"
                : "Cash to be collected upon Delivery"}
            </p>
          </div>

          {/* Customer Info */}
          <div className="pt-2.5 border-t border-dashed border-[#0C3B2E]/20 space-y-1 text-[11px] font-sans">
            <p className="font-bold text-[#0C3B2E] uppercase text-[9px] tracking-wider">
              Customer:
            </p>
            <p className="font-bold text-slate-900">{order.userId?.name || "Customer"}</p>
            {order.userId?.phone && (
              <p className="text-slate-600">Ph: {order.userId.phone}</p>
            )}
            <p className="text-slate-600 text-[10px] leading-snug pt-0.5">
              {order.address?.address}
            </p>
          </div>

          {/* Items Header */}
          <div className="pt-2.5 border-t border-dashed border-[#0C3B2E]/20">
            <div className="flex justify-between font-bold text-[10px] uppercase tracking-wider text-slate-500 pb-1">
              <span>Qty x Item</span>
              <span>Amt</span>
            </div>

            <div className="space-y-1.5 pt-1">
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-start text-[11px]">
                  <span className="pr-2 font-medium text-slate-800">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-bold text-[#0C3B2E] shrink-0">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-2.5 border-t-2 border-dashed border-[#0C3B2E]/25 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-[#0C3B2E] border-t border-[#0C3B2E]/15 pt-2 mt-1.5 font-sans">
              <span>TOTAL AMOUNT:</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          {/* Footer Barcode Touch & Thank You */}
          <div className="text-center pt-3 border-t border-dashed border-[#0C3B2E]/20 space-y-1 font-sans">
            <p className="text-[11px] font-bold text-[#0C3B2E]">
              Thank You! Visit Again 😊
            </p>
            <p className="text-[9px] text-slate-500">
              Evergreen Cafe • Ambagarh Chowki
            </p>
          </div>
        </div>

        {/* Screen Bottom Close */}
        <div className="p-3.5 bg-[#F7FBF8] border-t border-[#0C3B2E]/10 flex justify-center print:hidden">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white font-semibold text-xs transition shadow-2xs cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}