import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { Cart } from "@/lib/models/Cart";
import { requireAuthUser } from "@/lib/auth";
import { notifyAdminsAndStaffNewOrder } from "@/lib/orderNotifications";
import { Address } from "@/lib/models/Address";
import { Server } from "socket.io";

export async function GET() {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });

    const activeOrders = orders.filter((o) =>
      ["Placed", "Accepted", "Preparing", "Ready", "Out for Delivery"].includes(o.orderStatus)
    );
    const pastOrders = orders.filter((o) =>
      ["Delivered", "Cancelled"].includes(o.orderStatus)
    );

    return NextResponse.json({ activeOrders, pastOrders, allOrders: orders });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required to place an order. Please log in or sign up." },
        { status: 401 }
      );
    }

    const { items, totalAmount, address, latitude, longitude } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    if (!address || !address.address) {
      return NextResponse.json({ message: "Delivery address is required" }, { status: 400 });
    }

    await connectToDatabase();

    const newOrder = await Order.create({
      userId: user._id,
      items,
      totalAmount,
      paymentMethod: "Cash On Delivery",
      paymentStatus: "Pending",
      orderStatus: "Placed",
      address,
      latitude,
      longitude,
    });

    // Clear user DB cart
    await Cart.findOneAndUpdate({ userId: user._id }, { items: [], total: 0 });

    // Auto-save address to user's saved addresses for future order suggestions
    if (address && address.address) {
      try {
        const cleanAddressStr = address.address.trim();
        const existingAddress = await Address.findOne({
          userId: user._id,
          address: cleanAddressStr,
        });

        if (!existingAddress) {
          await Address.create({
            userId: user._id,
            title: address.title || "Home",
            address: cleanAddressStr,
            latitude: latitude || undefined,
            longitude: longitude || undefined,
          });
        } else {
          // Touch updatedAt to ensure it appears as most recent
          existingAddress.updatedAt = new Date();
          await existingAddress.save();
        }
      } catch (addrErr) {
        console.error("Auto-save address error:", addrErr);
      }
    }

    try {
      const io = (globalThis as any).__socketIoServer as Server | undefined;
      if (io) {
        io.emit("new_order", {
          orderId: newOrder._id.toString(),
          orderStatus: newOrder.orderStatus,
          customerName: user.name || "Customer",
          totalAmount: newOrder.totalAmount,
          message: `New order #${newOrder._id.toString().slice(-6).toUpperCase()} received`,
        });
      }
    } catch (socketErr) {
      console.error("Socket emit error for new order:", socketErr);
    }

    // Notify all Admins and Staff with order management permissions
    notifyAdminsAndStaffNewOrder(newOrder, user.name || "Customer").catch((err) => {
      console.error("Order notification dispatch error:", err);
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    console.error("Place order error:", error);
    return NextResponse.json({ message: "Failed to place order" }, { status: 500 });
  }
}
