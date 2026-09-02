import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/lib/models/Coupon";

export async function GET() {
  try {
    await connectToDatabase();
    const now = new Date();
    const coupons = await Coupon.find({
      active: true,
      $or: [{ validTill: { $exists: false } }, { validTill: { $gt: now } }],
    }).sort({ createdAt: -1 }).lean();

    const normalized = coupons.map((c: any) => ({
      ...c,
      discountType: c.discountType || "percentage",
      discountValue: c.discountValue !== undefined ? c.discountValue : c.discount,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch available coupons" }, { status: 500 });
  }
}
