import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { requireAuthUser, requireAdminUser } from "@/lib/auth";
import { notifyCustomerOrderStatus } from "@/lib/notificationsHelper";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const order = await Order.findById(id)
      .populate("deliveredBy", "name phone role employeeId email")
      .populate("cancelledBy.userId", "name role");

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Customer can only view their own order (Admin/Staff can view any order)
    if (
      user.role !== "Admin" &&
      user.role !== "Staff" &&
      (user.role as string) !== "Delivery" &&
      order.userId.toString() !== user._id.toString()
    ) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { orderStatus, cancelReason } = await req.json();
    if (!orderStatus) {
      return NextResponse.json({ message: "Order status is required" }, { status: 400 });
    }

    await connectToDatabase();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered") {
      order.paymentStatus = "Completed";
    }

    if (orderStatus === "Cancelled") {
      order.cancelledBy = {
        userId: admin._id,
        name: admin.name,
        role: admin.role,
      };
      order.cancelledAt = new Date();
      if (cancelReason) order.cancelReason = cancelReason;
    }

    await order.save();

    // Send in-app & web push notification to customer for order status change (Accepted, Preparing, Ready, Out for Delivery, Delivered, Cancelled)
    await notifyCustomerOrderStatus(order, orderStatus, cancelReason);

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update order status" }, { status: 500 });
  }
}
