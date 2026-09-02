import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/lib/models/Coupon";

export async function POST(req: Request) {
  try {
    const { code, subtotal = 0 } = await req.json();
    if (!code) {
      return NextResponse.json({ message: "Coupon code is required" }, { status: 400 });
    }

    await connectToDatabase();
    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      active: true,
    });

    if (!coupon) {
      return NextResponse.json({ message: "Invalid or inactive coupon code" }, { status: 400 });
    }

    // Check expiry date
    if (coupon.validTill && new Date(coupon.validTill) < new Date()) {
      return NextResponse.json({ message: "This coupon code has expired" }, { status: 400 });
    }

    // Check minimum order amount requirement
    if (subtotal < coupon.minOrderAmount) {
      const remaining = Math.round(coupon.minOrderAmount - subtotal);
      return NextResponse.json(
        {
          message: `Add items worth ₹${remaining} more to apply '${coupon.code}' (Min. order ₹${coupon.minOrderAmount})`,
          minOrderAmount: coupon.minOrderAmount,
          remaining,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    const type = coupon.discountType || "percentage";
    const value = coupon.discountValue !== undefined ? coupon.discountValue : (coupon.discount || 0);
    let discountAmount = 0;

    if (type === "percentage") {
      discountAmount = Math.round((subtotal * value) / 100);
      if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = value;
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      code: coupon.code,
      discountAmount,
      discountType: type,
      discountValue: value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      description: coupon.description,
      message: `🎉 '${coupon.code}' applied! You save ₹${discountAmount}`,
    });
  } catch (error) {
    return NextResponse.json({ message: "Failed to validate coupon" }, { status: 500 });
  }
}
