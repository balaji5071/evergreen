import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Order } from "@/lib/models/Order";
import { requireStaffOrAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    const staffUser = await requireStaffOrAdminUser();
    if (!staffUser) {
      return NextResponse.json({ message: "Unauthorized. Staff access required." }, { status: 403 });
    }

    await connectToDatabase();

    const user = await User.findById(staffUser._id);
    if (!user) {
      return NextResponse.json({ message: "Staff user not found" }, { status: 404 });
    }

    // Auto-generate employeeId if missing
    if (!user.employeeId && user.role !== "Customer") {
      const count = await User.countDocuments({ role: { $in: ["Admin", "Staff"] } });
      user.employeeId = `EMP-${1000 + count}`;
      await user.save();
    }

    // Calculate days worked
    const createdAt = new Date(user.createdAt || Date.now());
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdAt.getTime());
    const daysWorked = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Aggregate staff performance metrics
    const deliveredOrders = await Order.find({
      deliveredBy: user._id,
      orderStatus: "Delivered",
    });

    const totalOrdersDelivered = deliveredOrders.length;
    const totalRevenueCollected = deliveredOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const cancelledOrdersCount = await Order.countDocuments({
      "cancelledBy.userId": user._id,
    });

    // Generate detailed Working Days History log (day by day from joining date to today)
    const workHistory = [];
    const currentDate = new Date(createdAt);
    currentDate.setHours(0, 0, 0, 0);

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    while (currentDate <= todayDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const startOfDay = new Date(currentDate);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Orders handled on this specific date
      const dayOrders = deliveredOrders.filter(
        (o) => new Date(o.updatedAt) >= startOfDay && new Date(o.updatedAt) <= endOfDay
      );

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const isToday = currentDate.getTime() === todayDate.getTime();

      workHistory.unshift({
        date: dateStr,
        formattedDate: currentDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status: isToday ? (user.dutyStatus || "Available") : "Shift Completed",
        dutyHours: 8,
        ordersHandled: dayOrders.length,
        revenue: dayRevenue,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      user,
      stats: {
        daysWorked,
        joiningDate: createdAt.toLocaleDateString(),
        totalOrdersDelivered,
        totalRevenueCollected,
        cancelledOrdersCount,
      },
      workHistory,
    });
  } catch (error: any) {
    console.error("GET /api/staff/profile error:", error);
    return NextResponse.json({ message: "Failed to fetch staff profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const staffUser = await requireStaffOrAdminUser();
    if (!staffUser) {
      return NextResponse.json({ message: "Unauthorized. Staff access required." }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const { name, phone, employeeId, dutyStatus } = body;

    const user = await User.findById(staffUser._id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (employeeId) user.employeeId = employeeId;
    if (dutyStatus && ["Available", "Busy", "Offline"].includes(dutyStatus)) {
      user.dutyStatus = dutyStatus;
    }

    await user.save();

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("PUT /api/staff/profile error:", error);
    return NextResponse.json({ message: error.message || "Failed to update profile" }, { status: 500 });
  }
}
