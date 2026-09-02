import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Notification } from "@/lib/models/Notification";
import { sendPushNotificationToUser, broadcastPushNotification } from "@/lib/webpush";

export async function notifyCustomerOrderStatus(
  order: any,
  orderStatus: string,
  cancelReason?: string
) {
  try {
    if (!order || !order.userId) return;

    const userIdStr = typeof order.userId === "object" ? (order.userId._id ? order.userId._id.toString() : order.userId.toString()) : order.userId.toString();
    const shortId = order._id ? order._id.toString().slice(-6).toUpperCase() : "ORD";

    const statusTitleMap: Record<string, string> = {
      Accepted: "Order Accepted 🟢",
      Preparing: "Meal Being Prepared 👨‍🍳",
      Ready: "Order Ready 📦",
      "Out for Delivery": "Out for Delivery 🛵",
      Delivered: "Order Delivered 🎉",
      Cancelled: "Order Cancelled 🔴",
    };

    const defaultMsgMap: Record<string, string> = {
      Accepted: `Your order #${shortId} has been accepted by Evergreen Cafe!`,
      Preparing: `Chef is now preparing your delicious meal for order #${shortId}!`,
      Ready: `Your order #${shortId} is ready & packed for delivery!`,
      "Out for Delivery": `Your order #${shortId} is out for delivery! Track your delivery partner live.`,
      Delivered: `Your order #${shortId} has been delivered! Enjoy your meal 🌿`,
      Cancelled: `Your order #${shortId} was cancelled.${cancelReason ? ` Reason: ${cancelReason}` : ""}`,
    };

    const title = statusTitleMap[orderStatus] || `Order Status: ${orderStatus}`;
    const message = defaultMsgMap[orderStatus] || `Your order #${shortId} status is now ${orderStatus}.`;
    const targetUrl = `/orders/${order._id}`;

    await connectToDatabase();

    // 1. Save In-App Notification record for customer
    await Notification.create({
      userId: userIdStr,
      title,
      message,
      read: false,
      link: targetUrl,
    });

    // 2. Dispatch Web Push Notification to Customer's device
    await sendPushNotificationToUser(userIdStr, {
      title,
      body: message,
      url: targetUrl,
    });

    // 3. Emit real-time Socket.IO event to all connected customer clients
    try {
      const io = (globalThis as any).__socketIoServer;
      if (io) {
        io.emit("order_updated", {
          orderId: order._id ? order._id.toString() : order.id,
          userId: userIdStr,
          orderStatus,
          message,
        });
        io.emit("new_notification", {
          userId: userIdStr,
          title,
          message,
          link: targetUrl,
        });
      }
    } catch (sErr) {
      console.error("Socket emit order status error:", sErr);
    }
  } catch (error) {
    console.error("Error notifying customer of order status update:", error);
  }
}

export async function notifyAllUsersNewCoupon(coupon: any) {
  try {
    await connectToDatabase();

    // Get all registered users in database
    const users = await User.find({}).select("_id");
    if (!users || users.length === 0) return;

    const title = `🎉 New Offer: ${coupon.code}`;
    const message = coupon.description
      ? `${coupon.description} — Use code ${coupon.code} on checkout!`
      : `Special discount code ${coupon.code} has been published! Apply now on your order.`;
    const targetUrl = "/cart";

    // 1. Create In-App Notification Records in MongoDB for ALL users
    const notificationDocs = users.map((u) => ({
      userId: u._id,
      title,
      message,
      read: false,
      link: targetUrl,
    }));

    await Notification.insertMany(notificationDocs);

    // 2. Broadcast Native Web Push Notification to ALL devices
    await broadcastPushNotification({
      title,
      body: message,
      url: targetUrl,
    });

    // 3. Emit real-time Socket.IO event for all connected clients
    try {
      const io = (globalThis as any).__socketIoServer;
      if (io) {
        io.emit("new_notification", {
          title,
          message,
          link: targetUrl,
        });
        io.emit("coupon_published", coupon);
      }
    } catch (sErr) {
      console.error("Socket emit new coupon error:", sErr);
    }
  } catch (error) {
    console.error("Failed to broadcast new coupon notification to all users:", error);
  }
}

export async function notifyAllUsersNewBanner(banner: any) {
  try {
    await connectToDatabase();

    const users = await User.find({}).select("_id");
    if (!users || users.length === 0) return;

    const title = `🖼️ New Offer Banner Published!`;
    const message = `${banner.title} — Check out our new promotional deal on Evergreen Cafe!`;
    const targetUrl = "/";

    // 1. Create In-App Notification Records in MongoDB for ALL users
    const notificationDocs = users.map((u) => ({
      userId: u._id,
      title,
      message,
      read: false,
      link: targetUrl,
    }));

    await Notification.insertMany(notificationDocs);

    // 2. Broadcast Native Web Push Notification to ALL devices
    await broadcastPushNotification({
      title,
      body: message,
      url: targetUrl,
    });

    // 3. Emit real-time Socket.IO event for all connected clients
    try {
      const io = (globalThis as any).__socketIoServer;
      if (io) {
        io.emit("new_notification", {
          title,
          message,
          link: targetUrl,
        });
        io.emit("banner_published", banner);
      }
    } catch (sErr) {
      console.error("Socket emit new banner error:", sErr);
    }
  } catch (error) {
    console.error("Failed to broadcast new banner notification to all users:", error);
  }
}
