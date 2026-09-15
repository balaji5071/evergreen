import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { requireStaffOrAdminUser } from "@/lib/auth";
import { sendPushNotificationToUser } from "@/lib/webpush";
import { notifyCustomerOrderStatus } from "@/lib/notificationsHelper";

export async function GET(req: Request) {
  try {
    const staffUser = await requireStaffOrAdminUser();
    if (!staffUser) {
      return NextResponse.json({ message: "Unauthorized. Staff or Admin access required." }, { status: 403 });
    }

    await connectToDatabase();
    const orders = await Order.find({})
      .populate("userId", "name email phone")
      .populate("deliveredBy", "name phone role employeeId email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("GET /api/staff/orders error:", error);
    return NextResponse.json({ message: "Failed to fetch staff orders" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const staffUser = await requireStaffOrAdminUser();
    if (!staffUser) {
      return NextResponse.json({ message: "Unauthorized. Staff or Admin access required." }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { orderId, orderStatus, paymentMethod, upiRef, paymentStatus, cancelReason, deliveredBy } = body;

    if (!orderId || !orderStatus) {
      return NextResponse.json({ message: "Missing orderId or orderStatus" }, { status: 400 });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (deliveredBy && order.orderStatus === "Delivered") {
      const currentDeliveryPerson = order.deliveredBy?.toString();
      if (currentDeliveryPerson !== deliveredBy) {
        return NextResponse.json(
          { message: "The delivery person cannot be changed after an order is delivered" },
          { status: 409 }
        );
      }
    }

    order.orderStatus = orderStatus;

    if (deliveredBy) {
      order.deliveredBy = deliveredBy;
    } else if ((orderStatus === "Out for Delivery" || orderStatus === "Delivered") && !order.deliveredBy) {
      order.deliveredBy = staffUser._id;
    }

    if (orderStatus === "Delivered") {
      order.paymentStatus = paymentStatus || "Completed";
      if (paymentMethod) order.paymentMethod = paymentMethod;
      if (upiRef) order.upiRef = upiRef;
      order.deliveredAt = new Date();
    }

    if (orderStatus === "Cancelled") {
      if (!cancelReason?.trim()) {
        return NextResponse.json({ message: "A cancellation reason is required" }, { status: 400 });
      }
      order.cancelledBy = {
        userId: staffUser._id,
        name: staffUser.name,
        role: staffUser.role,
      };
      order.cancelledAt = new Date();
      order.cancelReason = cancelReason.trim();
    }

    await order.save();

    // Trigger customer notification for status change (Accepted, Preparing, Ready, Out for Delivery, Delivered, Cancelled)
    await notifyCustomerOrderStatus(order, orderStatus, cancelReason);

    // Trigger Web Push Notification to Assigned Staff User if deliveredBy was updated
    if (deliveredBy && deliveredBy !== staffUser._id.toString()) {
      sendPushNotificationToUser(deliveredBy, {
        title: "New Order Delivery Assigned! 🛵",
        body: `Order #${orderId.slice(-6).toUpperCase()} has been assigned to you by Admin.`,
        url: `/staff/orders/${orderId}`,
      });
    }

    const updatedOrder = await Order.findById(orderId)
      .populate("userId", "name email phone")
      .populate("deliveredBy", "name phone role employeeId email")
      .populate("cancelledBy.userId", "name email phone role employeeId");

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("PUT /api/staff/orders error:", error);
    return NextResponse.json({ message: error.message || "Failed to update order" }, { status: 500 });
  }
}
