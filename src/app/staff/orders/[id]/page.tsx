"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ChefHat,
  PackageCheck,
  Truck,
  DollarSign,
  Printer,
  Receipt,
  User,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { useSocket } from "@/context/SocketContext";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface Order {
  _id: string;
  totalAmount: number;
  orderStatus: "Placed" | "Accepted" | "Preparing" | "Ready" | "Out for Delivery" | "Delivered" | "Cancelled";
  paymentMethod: string;
  paymentStatus: string;
  items: OrderItem[];
  address: { address: string; title?: string };
  userId?: { name: string; phone: string; email: string };
  createdAt: string;
  deliveredAt?: string;
  upiRef?: string;
  cancelledBy?: { name?: string; role?: string };
  cancelledAt?: string;
  cancelReason?: string;
}

export default function StaffOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<"Cash" | "UPI">("Cash");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonInput, setCancelReasonInput] = useState("");
  const [upiRefInput, setUpiRefInput] = useState("");

  const { emitOrderStatusUpdate } = useSocket();

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (res.ok) {
        const data = await res.json();
        const found = (data.orders || []).find((o: Order) => o._id === id);
        setOrder(found || null);
      }
    } catch (e) {
      console.error("Error fetching order details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string, extraData: any = {}) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/staff/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order._id,
          orderStatus: newStatus,
          ...extraData,
        }),
      });

      if (res.ok) {
        emitOrderStatusUpdate(order._id, newStatus);
        fetchOrderDetails();
        setShowPaymentModal(false);
        setShowCancelModal(false);
      } else {
        const err = await res.json();
        alert(`Failed to update order status: ${err.message}`);
      }
    } catch (e: any) {
      alert(`Error updating order: ${e.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#0C3B2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-[#E6E2D8] text-center space-y-4 max-w-xl mx-auto my-10">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="font-serif text-xl font-bold text-slate-700">Order Ticket Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested order ID does not exist or may have been deleted.
        </p>
        <Link
          href="/staff/orders"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl btn-emerald text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Orders Queue</span>
        </Link>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    order.address.address
  )}`;

  const statuses = ["Placed", "Accepted", "Preparing", "Ready", "Out for Delivery", "Delivered"];
  const currentStep = statuses.indexOf(order.orderStatus);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/staff/orders"
          className="inline-flex items-center space-x-2 text-xs font-bold text-[#0C3B2E] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-2xl bg-white border border-[#E6E2D8] text-[#0C3B2E] text-xs font-bold hover:bg-slate-50 transition flex items-center space-x-2 shadow-xs cursor-pointer"
        >
          <Printer className="w-4 h-4 text-emerald-700" />
          <span>Print Thermal Receipt</span>
        </button>
      </div>

      {/* Ticket Card Header */}
      <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8] shadow-card-soft space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E6E2D8] pb-4">
          <div>
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Kitchen Order Ticket
            </span>
            <h2 className="font-mono text-2xl font-black text-[#0C3B2E] mt-0.5">
              #{order._id.slice(-6).toUpperCase()}
            </h2>
            <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Placed at: {new Date(order.createdAt).toLocaleString()}</span>
            </p>
          </div>

          <span
            className={`self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
              order.orderStatus === "Placed"
                ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                : order.orderStatus === "Accepted"
                ? "bg-blue-100 text-blue-900 border-blue-300"
                : order.orderStatus === "Preparing"
                ? "bg-[#EAF5EF] text-[#0C3B2E] border-emerald-300"
                : order.orderStatus === "Ready"
                ? "bg-purple-100 text-purple-900 border-purple-300"
                : order.orderStatus === "Out for Delivery"
                ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                : order.orderStatus === "Cancelled"
                ? "bg-red-100 text-red-900 border-red-300"
                : "bg-slate-100 text-slate-700 border-slate-300"
            }`}
          >
            Status: {order.orderStatus}
          </span>
        </div>

        {/* Cancellation Details Card */}
        {order.orderStatus === "Cancelled" && (
          <div className="bg-red-50 p-5 rounded-2xl border border-red-200 space-y-2 text-xs text-red-900">
            <div className="flex items-center space-x-2 font-black uppercase text-xs text-red-800">
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Order Cancelled Log</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-medium pl-6">
              <p>
                <strong>Cancelled By:</strong>{" "}
                <span className="font-bold text-red-900">
                  {order.cancelledBy?.name || "Staff / Admin"} ({order.cancelledBy?.role || "Staff"})
                </span>
              </p>
              {order.cancelledAt && (
                <p>
                  <strong>Cancelled Time:</strong> {new Date(order.cancelledAt).toLocaleString()}
                </p>
              )}
              {order.cancelReason && (
                <p className="col-span-full">
                  <strong>Reason:</strong> {order.cancelReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Live Stepper Workflow Bar */}
        {order.orderStatus !== "Cancelled" && (
          <div className="py-2 overflow-x-auto no-scrollbar">
            <div className="flex items-center min-w-[500px] justify-between">
              {statuses.map((st, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={st} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          isCompleted
                            ? "bg-[#0C3B2E] text-white shadow-sm"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span
                        className={`text-[10px] font-extrabold mt-1 text-center whitespace-nowrap ${
                          isCurrent
                            ? "text-[#0C3B2E]"
                            : isCompleted
                            ? "text-slate-700"
                            : "text-slate-400"
                        }`}
                      >
                        {st}
                      </span>
                    </div>
                    {idx < statuses.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 rounded-full ${
                          idx < currentStep ? "bg-[#0C3B2E]" : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer & Delivery Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E2D8] space-y-2">
            <h4 className="font-bold text-xs text-[#0C3B2E] uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Customer Information</span>
            </h4>
            <p className="font-bold text-sm text-slate-800">{order.userId?.name || "Customer"}</p>
            <p className="text-xs text-slate-600 font-medium">{order.userId?.phone}</p>
            <p className="text-xs text-slate-500">{order.userId?.email}</p>

            <div className="pt-2">
              <a
                href={`tel:${order.userId?.phone}`}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Customer</span>
              </a>
            </div>
          </div>

          <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E2D8] space-y-2">
            <h4 className="font-bold text-xs text-[#0C3B2E] uppercase tracking-wider flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Delivery Address</span>
            </h4>
            <p className="font-bold text-xs text-slate-700">{order.address.title || "Home Address"}</p>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {order.address.address}
            </p>

            <div className="pt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-700 text-white text-xs font-bold hover:bg-indigo-800 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Location in Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-[#0C3B2E] uppercase tracking-wider flex items-center space-x-1.5">
            <Receipt className="w-4 h-4 text-emerald-700" />
            <span>Ordered Items Breakdown</span>
          </h4>

          <div className="border border-[#E6E2D8] rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E6E2D8] text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Item Description</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 font-medium">
                    <td className="p-3 text-slate-800 font-bold">{item.name}</td>
                    <td className="p-3 text-center text-[#0C3B2E] font-black">x{item.quantity}</td>
                    <td className="p-3 text-right text-slate-600">₹{item.price}</td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      ₹{item.price * item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total & Payment Details */}
        <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E6E2D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div>
            <p className="text-slate-500 font-bold uppercase text-[10px]">Payment Information</p>
            <p className="font-extrabold text-sm text-slate-800 mt-0.5">
              Mode: {order.paymentMethod}
            </p>
            <p className="text-xs text-slate-500">
              Status:{" "}
              <strong
                className={order.paymentStatus === "Completed" ? "text-emerald-700" : "text-amber-600"}
              >
                {order.paymentStatus}
              </strong>
            </p>
            {order.upiRef && <p className="text-[11px] text-slate-500 mt-0.5">UPI Ref: {order.upiRef}</p>}
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
            <p className="text-slate-500 font-bold uppercase text-[10px]">Total Order Amount</p>
            <p className="font-serif text-3xl font-extrabold text-[#0C3B2E]">
              ₹{order.totalAmount}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2">
          {order.orderStatus === "Placed" && (
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus("Accepted")}
                className="py-3.5 rounded-2xl btn-emerald text-xs font-extrabold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Accept Order</span>
              </button>

              <button
                disabled={updating}
                onClick={() => setShowCancelModal(true)}
                className="py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-extrabold flex items-center justify-center space-x-2 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject / Cancel Order</span>
              </button>
            </div>
          )}

          {order.orderStatus === "Accepted" && (
            <div className="flex space-x-3">
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus("Preparing")}
                className="flex-1 py-3.5 rounded-2xl bg-[#0C3B2E] hover:bg-[#08281e] text-white text-xs font-extrabold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <ChefHat className="w-4 h-4 text-emerald-400" />
                <span>Start Preparing Meal</span>
              </button>
              <button
                disabled={updating}
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-3.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}

          {order.orderStatus === "Preparing" && (
            <button
              disabled={updating}
              onClick={() => handleUpdateStatus("Ready")}
              className="w-full py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-extrabold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
            >
              <PackageCheck className="w-4 h-4 text-purple-200" />
              <span>Mark Ready for Pickup / Dispatch</span>
            </button>
          )}

          {order.orderStatus === "Ready" && (
            <button
              disabled={updating}
              onClick={() => handleUpdateStatus("Out for Delivery")}
              className="w-full py-3.5 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-extrabold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
            >
              <Truck className="w-4 h-4 text-indigo-200" />
              <span>Start Delivery (Out For Delivery)</span>
            </button>
          )}

          {order.orderStatus === "Out for Delivery" && (
            <button
              disabled={updating}
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-xl"
            >
              <DollarSign className="w-4 h-4 text-yellow-300" />
              <span>Complete Delivery & Collect Payment</span>
            </button>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#E6E2D8]">
            <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-3">
              <h3 className="font-serif text-lg font-bold text-red-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Cancel Order Ticket</span>
              </h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700 uppercase">Reason for Cancellation</label>
              <textarea
                rows={3}
                placeholder="e.g. Item out of stock / Customer requested cancellation..."
                value={cancelReasonInput}
                onChange={(e) => setCancelReasonInput(e.target.value)}
                className="w-full p-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-600 text-xs"
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  handleUpdateStatus("Cancelled", { cancelReason: cancelReasonInput })
                }
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#E6E2D8]">
            <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-3">
              <h3 className="font-serif text-xl font-bold text-[#0C3B2E]">Complete Delivery</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] text-center space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Total Cash to Collect
              </span>
              <p className="font-serif text-3xl font-extrabold text-[#0C3B2E]">
                ₹{order.totalAmount}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice("Cash")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                    paymentMethodChoice === "Cash"
                      ? "bg-[#0C3B2E] text-white border-[#0C3B2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Cash</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice("UPI")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 transition ${
                    paymentMethodChoice === "UPI"
                      ? "bg-[#0C3B2E] text-white border-[#0C3B2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>UPI / QR</span>
                </button>
              </div>
            </div>

            {paymentMethodChoice === "UPI" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">UPI UTR Ref</label>
                <input
                  type="text"
                  placeholder="Optional UTR Ref"
                  value={upiRefInput}
                  onChange={(e) => setUpiRefInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-xs"
                />
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  handleUpdateStatus("Delivered", {
                    paymentMethod: paymentMethodChoice,
                    paymentStatus: "Completed",
                    upiRef: upiRefInput,
                  })
                }
                className="w-2/3 py-3 rounded-2xl btn-emerald text-xs font-bold shadow-lg"
              >
                Confirm Delivery & Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
