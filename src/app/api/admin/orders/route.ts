import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { requireAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    await connectToDatabase();
    const orders = await Order.find({})
      .populate("userId", "name email phone")
      .populate("deliveredBy", "name email phone role employeeId")
      .populate("cancelledBy.userId", "name email phone role employeeId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ allOrders: orders, orders });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}
