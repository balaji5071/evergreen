import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { User } from "@/lib/models/User";
import { MenuItem } from "@/lib/models/MenuItem";
import { requireAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    await connectToDatabase();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = await Order.find({ createdAt: { $gte: startOfToday } });
    const todayRevenue = todayOrders
      .filter((o) => o.orderStatus !== "Cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalCustomers = await User.countDocuments({ role: "Customer" });
    const totalStaff = await User.countDocuments({ role: "Staff" });
    const totalMenuItems = await MenuItem.countDocuments({});

    const completedOrdersTillNow = await Order.countDocuments({ orderStatus: "Delivered" });
    const totalCancelledTillNow = await Order.countDocuments({ orderStatus: "Cancelled" });

    // Monthly stats
    const monthlyOrders = await Order.find({ createdAt: { $gte: startOfMonth } });
    const monthlyDeliveredOrders = monthlyOrders.filter((o) => o.orderStatus === "Delivered");
    const monthlyCancelledOrders = monthlyOrders.filter((o) => o.orderStatus === "Cancelled");
    const monthlyRevenue = monthlyDeliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const recentOrders = await Order.find({})
      .populate("userId", "name email phone")
      .populate("deliveredBy", "name email phone role employeeId")
      .sort({ createdAt: -1 })
      .limit(6);

    // Calculate popular items
    const allOrders = await Order.find({ orderStatus: { $ne: "Cancelled" } });
    const itemCounts: Record<string, { name: string; count: number; totalSales: number }> = {};

    allOrders.forEach((order) => {
      order.items.forEach((item: any) => {
        if (!itemCounts[item.name]) {
          itemCounts[item.name] = { name: item.name, count: 0, totalSales: 0 };
        }
        itemCounts[item.name].count += item.quantity;
        itemCounts[item.name].totalSales += item.price * item.quantity;
      });
    });

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      todayOrdersCount: todayOrders.length,
      todayRevenue,
      totalCustomers,
      totalStaff,
      totalMenuItems,
      completedOrdersTillNow,
      totalCancelledTillNow,
      monthlyRevenue,
      monthlyDeliveredCount: monthlyDeliveredOrders.length,
      monthlyCancelledCount: monthlyCancelledOrders.length,
      recentOrders,
      popularItems,
    });
  } catch (error) {
    console.error("Admin metrics error:", error);
    return NextResponse.json({ message: "Failed to fetch metrics" }, { status: 500 });
  }
}
