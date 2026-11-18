import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { Cart } from "@/lib/models/Cart";
import { requireAuthUser } from "@/lib/auth";
import { notifyAdminsAndStaffNewOrder } from "@/lib/orderNotifications";
import { Address } from "@/lib/models/Address";
import { Server } from "socket.io";
import mongoose from "mongoose";
import { getServerCart, calculateCheckoutTotal } from "@/lib/pricing";

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

    const {
      totalAmount: ignoredClientTotal,
      orderType,
      address,
      latitude,
      longitude,
      couponCode,
    } = await req.json();

    // Validate order type
    if (!["Delivery", "Takeaway"].includes(orderType)) {
      return NextResponse.json(
        { message: "Invalid order type" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const serverCart = await getServerCart(user._id);
    if (serverCart.items.length === 0) {
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );
    }

    // Require address ONLY for Delivery
    if (
      orderType === "Delivery" &&
      (!address || !address.address?.trim())
    ) {
      return NextResponse.json(
        { message: "Delivery address is required" },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (couponCode) {
      const Coupon = (await import("@/lib/models/Coupon")).Coupon;
      const coupon = await Coupon.findOne({
        code: String(couponCode).toUpperCase().trim(),
        active: true,
        $or: [{ validTill: { $exists: false } }, { validTill: { $gt: new Date() } }],
      });
      if (!coupon) {
        return NextResponse.json({ message: "Invalid or inactive coupon code" }, { status: 400 });
      }
      if (serverCart.subtotal < coupon.minOrderAmount) {
        return NextResponse.json({ message: "Coupon minimum order amount is not met" }, { status: 400 });
      }
      const value = coupon.discountValue !== undefined ? coupon.discountValue : coupon.discount || 0;
      discountAmount =
        coupon.discountType === "flat"
          ? value
          : Math.round((serverCart.subtotal * value) / 100);
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    }

    const itemCount = serverCart.items.reduce((sum, item) => sum + item.quantity, 0);
    const pricing = await calculateCheckoutTotal(
      serverCart.subtotal,
      orderType,
      discountAmount,
      itemCount
    );

    const newOrder = await Order.create({
      userId: user._id,
      items: serverCart.items,
      totalAmount: pricing.total,
      orderType,
      paymentMethod: "Cash On Delivery",
      paymentStatus: "Pending",
      orderStatus: "Placed",
      address: orderType === "Delivery" ? address : null,
      latitude: orderType === "Delivery" ? latitude : undefined,
      longitude: orderType === "Delivery" ? longitude : undefined,
    });

    // Clear user DB cart
    await Cart.findOneAndUpdate(
      { userId: user._id },
      { items: [], total: 0 }
    );

    // Auto-save address ONLY for Delivery
    if (orderType === "Delivery" && address?.address) {
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
          existingAddress.updatedAt = new Date();
          await existingAddress.save();
        }
      } catch (addrErr) {
        console.error("Auto-save address error:", addrErr);
      }
    }

    // Notify admins and staff
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

    notifyAdminsAndStaffNewOrder(
      newOrder,
      user.name || "Customer"
    ).catch((err) => {
      console.error("Order notification dispatch error:", err);
    });

    return NextResponse.json(newOrder, { status: 201 });

  } catch (error: any) {
    console.error("Place order error:", error);

    return NextResponse.json(
      { message: "Failed to place order" },
      { status: 500 }
    );
  }
}
