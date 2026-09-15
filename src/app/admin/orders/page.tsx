"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  RefreshCw,
  Receipt,
  Truck,
  UserCheck,
  XCircle,
  Award,
  Calendar,
  DollarSign,
  UserPlus,
  Bell,
  Search,
  X,
} from "lucide-react";
import InvoiceModal from "@/components/customer/InvoiceModal";
import { useSocket } from "@/context/SocketContext";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);

  const { emitOrderStatusUpdate } = useSocket();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, staffRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/users"),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.allOrders || data.orders || []);
      }

      if (staffRes.ok) {
        const users = await staffRes.json();
        const staffOnly = (users || []).filter(
          (u: any) => u.role === "Staff" || u.role === "Delivery" || u.role === "Admin"
        );
        setStaffList(staffOnly);
      }
    } catch (e) {
      console.error("Failed to fetch admin orders or staff list:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    let cancelReason = "";
    if (newStatus === "Cancelled") {
      cancelReason = window.prompt("Enter the cancellation reason:")?.trim() || "";
      if (!cancelReason) {
        window.alert("A cancellation reason is required.");
        return;
      }
    }

    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus: newStatus, cancelReason }),
      });

      if (res.ok) {
        emitOrderStatusUpdate(orderId, newStatus);
        fetchData();
      } else {
        const error = await res.json();
        window.alert(error.message || "Failed to update order status.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssignStaff = async (orderId: string, staffId: string, currentStatus: string) => {
    setUpdatingId(orderId);
    try {
      // Automatically accept order if it was placed
      const newStatus = currentStatus === "Placed" ? "Accepted" : currentStatus;

      const res = await fetch(`/api/staff/orders`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
          deliveredBy: staffId,
        }),
      });

      if (res.ok) {
        emitOrderStatusUpdate(orderId, newStatus);
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to assign staff: ${err.message}`);
      }
    } catch (e: any) {
      alert(`Error assigning staff: ${e.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "All" || order.orderStatus === filterStatus;
    const searchableText = [
      order._id,
      order.userId?.name,
      order.userId?.phone,
      order.deliveredBy?.name,
      order.deliveredBy?.employeeId,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesStatus && (!normalizedSearch || searchableText.includes(normalizedSearch));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
            Admin Order Dispatch & Staff Assignment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Accept orders, assign specific delivery staff, send instant notifications & track progress
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-4 py-2.5 rounded-2xl bg-white border border-[#E6E2D8] text-xs font-bold text-[#0C3B2E] flex items-center space-x-2 shadow-xs hover:bg-slate-50 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Search Orders */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search order ID, customer, phone or staff"
          aria-label="Search orders"
          className="h-12 w-full rounded-2xl border border-[#E6E2D8] bg-white pl-10 pr-10 text-sm font-semibold text-[#0C3B2E] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0C3B2E] focus:ring-2 focus:ring-[#0C3B2E]/10"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="Clear order search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
        {["All", "Placed", "Accepted", "Preparing", "Ready", "Out for Delivery", "Delivered", "Cancelled"].map(
          (st) => {
            const count = st === "All" ? orders.length : orders.filter((o) => o.orderStatus === st).length;
            const isSelected = filterStatus === st;

            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer flex items-center space-x-1.5 ${
                  isSelected
                    ? "bg-[#0C3B2E] text-white shadow-md"
                    : "bg-white text-slate-600 border border-[#E6E2D8] hover:bg-slate-50"
                }`}
              >
                <span>{st}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isSelected ? "bg-emerald-800 text-amber-300" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          }
        )}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-slate-200 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl text-center space-y-2 border border-[#E6E2D8]">
          <p className="font-serif text-lg font-bold text-[#0C3B2E]">No orders found</p>
          <p className="text-xs text-slate-500">
            {searchQuery ? "Try a different search or clear the search field." : "There are no orders matching this filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4"
            >
              {/* Header: Order ID, Status, Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#E6E2D8]/60 pb-3 gap-3">
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h3 className="font-mono text-base font-black text-[#0C3B2E]">
                      #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                        order.orderStatus === "Placed"
                          ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                          : order.orderStatus === "Accepted"
                          ? "bg-blue-100 text-blue-900 border-blue-300"
                          : order.orderStatus === "Preparing"
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : order.orderStatus === "Ready"
                          ? "bg-purple-100 text-purple-900 border-purple-300"
                          : order.orderStatus === "Out for Delivery"
                          ? "bg-indigo-100 text-indigo-900 border-indigo-300"
                          : order.orderStatus === "Delivered"
                          ? "bg-emerald-700 text-white border-emerald-800"
                          : "bg-red-100 text-red-900 border-red-300"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {order.userId?.name && (
                    <p className="text-xs text-slate-700 font-bold mt-1">
                      Customer: {order.userId.name} {order.userId.phone ? `(${order.userId.phone})` : ""}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Placed: {new Date(order.createdAt).toLocaleString("en-IN")}</span>
                  </p>
                </div>

                {/* Status Updater Dropdown & Invoice Button */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedInvoiceOrder(order)}
                    className="px-3.5 py-2 rounded-xl bg-[#EAF5EF] border border-emerald-200 text-xs font-bold text-[#0C3B2E] flex items-center space-x-1 hover:bg-[#0C3B2E] hover:text-white transition shadow-xs cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-amber-500" />
                    <span>Receipt</span>
                  </button>

                  <span className="text-xs font-bold text-[#0C3B2E] hidden sm:inline">Status:</span>
                  <select
                    value={order.orderStatus}
                    disabled={updatingId === order._id}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E] cursor-pointer"
                  >
                    <option value="Placed">Placed</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Staff Assignment & Delivery Personnel Selection Section */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 font-bold text-[#0C3B2E] uppercase text-[10px] tracking-wider">
                    <UserPlus className="w-4 h-4 text-emerald-700" />
                    <span>Assign Particular Staff / Delivery Executive</span>
                  </div>

                  {order.deliveredBy && (
                    <div className="flex items-center space-x-1.5 text-emerald-800 text-[11px] font-bold">
                      <Bell className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                      <span>Notification Sent to Assigned Staff</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <select
                    value={order.deliveredBy?._id || order.deliveredBy || ""}
                    disabled={
                      updatingId === order._id ||
                      order.orderStatus === "Cancelled" ||
                      order.orderStatus === "Delivered"
                    }
                    onChange={(e) =>
                      handleAssignStaff(order._id, e.target.value, order.orderStatus)
                    }
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C3B2E] cursor-pointer shadow-xs"
                  >
                    <option value="">-- Choose Particular Staff Member --</option>
                    {staffList.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name} ({st.employeeId || "Staff"}) - {st.role} [{st.dutyStatus || "Available"}]
                      </option>
                    ))}
                  </select>

                  {order.deliveredBy && (
                    <div className="flex items-center space-x-2 bg-emerald-100 text-emerald-900 px-3 py-2 rounded-xl text-xs font-extrabold border border-emerald-300">
                      <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        {order.orderStatus === "Delivered" ? "Delivered by: " : "Assigned: "}
                        {order.deliveredBy.name || "Staff User"} ({order.deliveredBy.employeeId || "EMP"})
                      </span>
                    </div>
                  )}
                </div>
                {order.orderStatus === "Delivered" && (
                  <p className="text-[11px] font-semibold text-emerald-800">
                    Delivery assignment is locked after completion
                    {order.deliveredAt
                      ? ` on ${new Date(order.deliveredAt).toLocaleString("en-IN")}`
                      : ""}
                  </p>
                )}
              </div>

              {(order.orderStatus === "Cancelled" || order.cancelledBy || order.cancelReason) && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs">
                  <p className="font-extrabold uppercase tracking-wider text-rose-800">Cancellation details</p>
                  <p className="mt-1 font-semibold text-rose-900">
                    Cancelled by: {order.cancelledBy?.name || order.cancelledBy?.userId?.name || "Admin"}
                    {order.cancelledAt ? ` · ${new Date(order.cancelledAt).toLocaleString("en-IN")}` : ""}
                  </p>
                  <p className="mt-1 text-rose-800">Reason: {order.cancelReason || "Not provided"}</p>
                </div>
              )}

              {/* Items & Address Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <p className="font-bold text-[#0C3B2E] uppercase text-[10px] tracking-wider">
                    Ordered Items:
                  </p>
                  <ul className="space-y-1.5 text-slate-700 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    {order.items?.map((i: any, idx: number) => (
                      <li key={idx} className="flex justify-between">
                        <span className="font-bold text-slate-800">
                          {i.quantity}x {i.name}
                        </span>
                        <span className="font-semibold text-slate-700">₹{i.price * i.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 font-bold">
                      Payment: {order.paymentMethod || "COD"} ({order.paymentStatus || "Pending"})
                    </span>
                    <p className="font-serif text-xl font-black text-[#0C3B2E]">
                      Total: ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 bg-[#FAF8F5] p-4 rounded-2xl border border-[#E6E2D8]">
                  <p className="font-bold text-[#0C3B2E] flex items-center space-x-1 uppercase text-[10px]">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Delivery Location:</span>
                  </p>
                  <p className="text-slate-700 font-medium leading-relaxed">{order.address?.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
