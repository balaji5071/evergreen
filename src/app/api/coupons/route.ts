import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Coupon } from "@/lib/models/Coupon";
import { requireAdminUser } from "@/lib/auth";
import { notifyAllUsersNewCoupon } from "@/lib/notificationsHelper";

export async function GET() {
  try {
    await connectToDatabase();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
    
    // Normalize coupons for backward compatibility
    const normalized = coupons.map((c: any) => ({
      ...c,
      discountType: c.discountType || "percentage",
      discountValue: c.discountValue !== undefined ? c.discountValue : c.discount,
      minOrderAmount: c.minOrderAmount || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      discountType = "percentage",
      discountValue,
      discount,
      minOrderAmount = 0,
      maxDiscountAmount = 0,
      description = "",
      terms = "",
      validTill,
      active = true,
    } = body;

    const val = Number(discountValue !== undefined ? discountValue : discount);

    if (!code || isNaN(val) || val <= 0) {
      return NextResponse.json(
        { message: "Valid coupon code and positive discount value are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Generate auto description if not provided
    let autoDesc = description;
    if (!autoDesc) {
      if (discountType === "percentage") {
        autoDesc = `Get ${val}% OFF${
          maxDiscountAmount > 0 ? ` up to ₹${maxDiscountAmount}` : ""
        }${minOrderAmount > 0 ? ` on orders above ₹${minOrderAmount}` : ""}`;
      } else {
        autoDesc = `Flat ₹${val} OFF${
          minOrderAmount > 0 ? ` on orders above ₹${minOrderAmount}` : ""
        }`;
      }
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: val,
      discount: val, // legacy fallback
      minOrderAmount: Number(minOrderAmount) || 0,
      maxDiscountAmount: Number(maxDiscountAmount) || 0,
      description: autoDesc,
      terms,
      validTill: validTill ? new Date(validTill) : undefined,
      active: Boolean(active),
    });

    if (coupon.active) {
      await notifyAllUsersNewCoupon(coupon);
    }

    return NextResponse.json(coupon, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ message: "Coupon code already exists" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create coupon" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ message: "Coupon ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await Coupon.findByIdAndUpdate(id, updateData, { new: true });

    if (updated && updated.active) {
      await notifyAllUsersNewCoupon(updated);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update coupon" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Coupon ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    await Coupon.findByIdAndDelete(id);
    return NextResponse.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete coupon" }, { status: 500 });
  }
}
