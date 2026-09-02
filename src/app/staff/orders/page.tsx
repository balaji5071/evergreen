"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Bell,
  ChefHat,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  DollarSign,
  QrCode,
  Search,
  Filter,
  RefreshCw,
  ShoppingBag,
  UserCheck,
} from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
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
  deliveredBy?: { _id?: string; name?: string; employeeId?: string; role?: string };
}

export default function StaffOrdersPage() {
  const searchParams = useSearchParams();
  const initialStatusFilter = searchParams.get("status") || "All";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>(initialStatusFilter);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Payment Collection Modal State for Delivery Completion
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<Order | null>(null);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<"Cash" | "UPI">("Cash");
  const [upiRefInput, setUpiRefInput] = useState("");

  const { emitOrderStatusUpdate } = useSocket();
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/staff/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Failed to fetch staff orders:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();
    const handleUpdate = () => fetchOrders();

    socket.on("order_updated", handleUpdate);
    socket.on("new_order", handleUpdate);

    const interval = setInterval(fetchOrders, 10000);

    return () => {
      socket.off("order_updated", handleUpdate);
      socket.off("new_order", handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: string,
    extraData: any = {}
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch("/api/staff/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
          ...extraData,
        }),
      });

      if (res.ok) {
        emitOrderStatusUpdate(orderId, newStatus);
        fetchOrders();
        setSelectedOrderForDelivery(null);
      } else {
        const err = await res.json();
        alert(`Failed to update order: ${err.message}`);
      }
    } catch (e: any) {
      alert(`Error updating order: ${e.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    if (activeTab !== "All" && order.orderStatus !== activeTab) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const orderNo = order._id.slice(-6).toLowerCase();
      const customerName = order.userId?.name?.toLowerCase() || "";
      const customerPhone = order.userId?.phone?.toLowerCase() || "";
      const assignedName = order.deliveredBy?.name?.toLowerCase() || "";
      return (
        orderNo.includes(term) ||
        customerName.includes(term) ||
        customerPhone.includes(term) ||
        assignedName.includes(term)
      );
    }
    return true;
  });

  const getTabCount = (tabName: string) => {
    if (tabName === "All") return orders.length;
    return orders.filter((o) => o.orderStatus === tabName).length;
  };

  const tabs = [
    { id: "All", label: "All Tickets" },
    { id: "Placed", label: "New Orders", icon: Bell },
    { id: "Accepted", label: "Accepted", icon: CheckCircle2 },
    { id: "Preparing", label: "Preparing", icon: ChefHat },
    { id: "Ready", label: "Ready", icon: PackageCheck },
    { id: "Out for Delivery", label: "Out for Delivery", icon: Truck },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
            Kitchen & Staff Order Tickets
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manage preparation workflow, dispatch, and assigned delivery tickets
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-white border border-[#E6E2D8] text-[#0C3B2E] text-xs font-bold hover:bg-slate-50 transition flex items-center space-x-2 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Tickets</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#E6E2D8] shadow-card-soft space-y-4">
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const count = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-2 cursor-pointer ${
                  isActive
                    ? "bg-[#0C3B2E] text-white shadow-md"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by order ID (#XXXXXX), customer name, assigned staff, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-4 border-[#0C3B2E] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#E6E2D8] text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-slate-700">No order tickets found</h3>
          <p className="text-xs text-slate-400">
            {searchTerm
              ? "No orders match your search term."
              : `There are currently no orders in status "${activeTab}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOrders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              order.address.address
            )}`;

            const isAssignedToMe =
              order.deliveredBy?._id === user?._id || order.deliveredBy?.name === user?.name;

            return (
              <div
                key={order._id}
                className={`bg-white p-6 rounded-3xl border shadow-card-soft space-y-4 transition ${
                  isAssignedToMe
                    ? "border-amber-400 ring-2 ring-amber-100"
                    : "border-[#E6E2D8] hover:border-[#0C3B2E]/50"
                }`}
              >
                {/* Top Ticket Header */}
                <div className="flex items-start justify-between border-b border-[#E6E2D8]/80 pb-3">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="font-mono text-sm font-black text-[#0C3B2E]">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-800 mt-1">
                      {order.userId?.name || "Customer"}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">{order.userId?.phone}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
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
                        : "bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                {/* Staff Assignment Pill */}
                {order.deliveredBy && (
                  <div
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${
                      isAssignedToMe
                        ? "bg-amber-50 text-amber-950 border-amber-300"
                        : "bg-emerald-50 text-emerald-900 border-emerald-200"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        Assigned To: <strong>{order.deliveredBy.name}</strong> (
                        {order.deliveredBy.employeeId || "Staff"})
                      </span>
                    </div>
                    {isAssignedToMe && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] uppercase">
                        Assigned To You
                      </span>
                    )}
                  </div>
                )}

                {/* Items Summary */}
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Items Ticket ({itemCount} Items)
                  </p>
                  <ul className="space-y-1 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E6E2D8]/60">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between font-medium text-slate-800">
                        <span>
                          <strong className="text-[#0C3B2E] font-bold">x{item.quantity}</strong>{" "}
                          {item.name}
                        </span>
                        <span>₹{item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Delivery Address & Contact Info */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                  <p className="font-bold text-slate-700 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{order.address.title || "Delivery Address"}:</span>
                  </p>
                  <p className="text-slate-600 font-medium pl-4">{order.address.address}</p>

                  <div className="flex items-center space-x-3 pt-1 pl-4">
                    <a
                      href={`tel:${order.userId?.phone}`}
                      className="text-xs font-bold text-emerald-800 hover:underline flex items-center space-x-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Customer</span>
                    </a>

                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-indigo-700 hover:underline flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Maps</span>
                    </a>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="flex items-center justify-between pt-1 border-t border-[#E6E2D8]/60 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Total Bill: </span>
                    <span className="font-serif text-base font-extrabold text-[#0C3B2E]">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-600 block">
                      {order.paymentMethod}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase ${
                        order.paymentStatus === "Completed" ? "text-emerald-700" : "text-amber-600"
                      }`}
                    >
                      {order.paymentStatus === "Completed" ? "PAID" : "PAYMENT PENDING"}
                    </span>
                  </div>
                </div>

                {/* Workflow Actions Based on Status */}
                <div className="pt-2">
                  {order.orderStatus === "Placed" && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        disabled={updatingId === order._id}
                        onClick={() => handleUpdateStatus(order._id, "Accepted")}
                        className="py-3 rounded-2xl btn-emerald text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Order</span>
                      </button>

                      <button
                        disabled={updatingId === order._id}
                        onClick={() => handleUpdateStatus(order._id, "Cancelled")}
                        className="py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Order</span>
                      </button>
                    </div>
                  )}

                  {order.orderStatus === "Accepted" && (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleUpdateStatus(order._id, "Preparing")}
                      className="w-full py-3 rounded-2xl bg-[#0C3B2E] hover:bg-[#08281e] text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                    >
                      <ChefHat className="w-4 h-4 text-emerald-400" />
                      <span>Start Preparing Meal</span>
                    </button>
                  )}

                  {order.orderStatus === "Preparing" && (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleUpdateStatus(order._id, "Ready")}
                      className="w-full py-3 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                    >
                      <PackageCheck className="w-4 h-4 text-purple-200" />
                      <span>Mark Ready for Pickup / Dispatch</span>
                    </button>
                  )}

                  {order.orderStatus === "Ready" && (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleUpdateStatus(order._id, "Out for Delivery")}
                      className="w-full py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
                    >
                      <Truck className="w-4 h-4 text-indigo-200" />
                      <span>Start Delivery (Out For Delivery)</span>
                    </button>
                  )}

                  {order.orderStatus === "Out for Delivery" && (
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => setSelectedOrderForDelivery(order)}
                      className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer shadow-lg"
                    >
                      <DollarSign className="w-4 h-4 text-yellow-300" />
                      <span>Complete Delivery & Collect Payment</span>
                    </button>
                  )}

                  {order.orderStatus === "Delivered" && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold text-center flex items-center justify-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Order Delivered & Paid</span>
                    </div>
                  )}

                  {order.orderStatus === "Cancelled" && (
                    <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold text-center">
                      Order Cancelled / Rejected
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Collection & Delivery Completion Modal */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#E6E2D8]">
            <div className="flex items-center justify-between border-b border-[#E6E2D8] pb-3">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#0C3B2E]">
                  Complete Delivery & Payment
                </h3>
                <p className="text-xs text-slate-500">
                  Order #{selectedOrderForDelivery._id.slice(-6).toUpperCase()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrderForDelivery(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Total Collectable Amount Display */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] text-center space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Total Cash to Collect
              </span>
              <p className="font-serif text-3xl font-extrabold text-[#0C3B2E]">
                ₹{selectedOrderForDelivery.totalAmount}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                Customer: {selectedOrderForDelivery.userId?.name}
              </p>
            </div>

            {/* Select Payment Method */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Payment Method Collected
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice("Cash")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition ${
                    paymentMethodChoice === "Cash"
                      ? "bg-[#0C3B2E] text-white border-[#0C3B2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Cash Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethodChoice("UPI")}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition ${
                    paymentMethodChoice === "UPI"
                      ? "bg-[#0C3B2E] text-white border-[#0C3B2E]"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>UPI / Online QR</span>
                </button>
              </div>
            </div>

            {/* Optional UPI Ref */}
            {paymentMethodChoice === "UPI" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  UPI Transaction Ref / UTR (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 329104920194"
                  value={upiRefInput}
                  onChange={(e) => setUpiRefInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrderForDelivery(null)}
                className="w-1/3 py-3 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={updatingId === selectedOrderForDelivery._id}
                onClick={() =>
                  handleUpdateStatus(selectedOrderForDelivery._id, "Delivered", {
                    paymentMethod: paymentMethodChoice,
                    paymentStatus: "Completed",
                    upiRef: upiRefInput,
                  })
                }
                className="w-2/3 py-3 rounded-2xl btn-emerald text-xs font-extrabold shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Delivery</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
