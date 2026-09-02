import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/lib/models/Notification";
import { requireAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId: user._id, read: false });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { notificationId, markAll } = await req.json();

    if (markAll) {
      await Notification.updateMany({ userId: user._id, read: false }, { read: true });
      return NextResponse.json({ success: true, message: "All notifications marked as read" });
    }

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to update notification" }, { status: 500 });
  }
}
