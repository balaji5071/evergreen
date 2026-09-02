import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Notification } from "@/lib/models/Notification";
import { sendPushNotificationToUser } from "@/lib/webpush";

export function shouldNotifyUserForNewOrder(user: {
  role?: string;
  permissions?: string[];
  notificationEnabled?: boolean;
}) {
  if (!user || user.notificationEnabled === false) return false;

  if (user.role === "Admin") return true;
  if (user.role !== "Staff") return false;

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  if (permissions.length === 0) return true;

  return permissions.includes("orders");
}

export async function notifyAdminsAndStaffNewOrder(order: any, customerName: string) {
  try {
    await connectToDatabase();

    const recipientUsers = await User.find({
      $or: [
        { role: "Admin", notificationEnabled: { $ne: false } },
        { role: "Staff", notificationEnabled: { $ne: false }, permissions: { $exists: false } },
        { role: "Staff", notificationEnabled: { $ne: false }, permissions: { $size: 0 } },
        { role: "Staff", notificationEnabled: { $ne: false }, permissions: { $in: ["orders"] } },
      ],
    }).select("_id name role email permissions notificationEnabled");

    const validRecipients = recipientUsers.filter((user) => shouldNotifyUserForNewOrder(user.toObject()));

    if (!validRecipients || validRecipients.length === 0) return;

    const shortId = order._id ? order._id.toString().slice(-6).toUpperCase() : "NEW";
    const title = `🔔 New Order Placed! (#EVG-${shortId})`;
    const message = `New order of ₹${order.totalAmount} (${order.items?.length || 0} items) placed by ${customerName}. Action required.`;

    const notificationDocs = validRecipients.map((u) => ({
      userId: u._id,
      title,
      message,
      read: false,
    }));

    await Notification.insertMany(notificationDocs);

    const pushPromises = validRecipients.map((u) => {
      const targetUrl = u.role === "Admin" ? "/admin/orders" : "/staff/orders";
      return sendPushNotificationToUser(u._id.toString(), {
        title,
        body: message,
        url: targetUrl,
      });
    });

    await Promise.allSettled(pushPromises);
  } catch (error) {
    console.error("Failed to notify admins and staff of new order:", error);
  }
}
