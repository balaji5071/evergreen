import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StoreSettings } from "@/lib/models/StoreSettings";
import { requireAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = await StoreSettings.create({
        taxEnabled: false,
        taxPercentage: 5,
        packagingEnabled: true,
        packagingChargeType: "whole_order",
        packagingFee: 15,
        deliveryEnabled: true,
        deliveryFee: 30,
        freeDeliveryThreshold: 300,
        restaurantName: "Evergreen Cafe & Restaurant",
        restaurantPhone: "+91 98765 43210",
        restaurantAddress: "Ravan Gali, Nisha Complex, Ambagarh Chowki, Rajnandgaon, Chhattisgarh - 491665",
      });
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();
    const allowedFields = new Set([
      "taxEnabled",
      "taxPercentage",
      "packagingEnabled",
      "packagingChargeType",
      "packagingFee",
      "deliveryEnabled",
      "deliveryFee",
      "freeDeliveryThreshold",
      "restaurantName",
      "restaurantPhone",
      "restaurantAddress",
    ]);
    const update: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body || {})) {
      if (allowedFields.has(key)) update[key] = value;
    }

    if (
      (typeof update.taxPercentage === "number" && (update.taxPercentage < 0 || update.taxPercentage > 100)) ||
      (typeof update.packagingFee === "number" && update.packagingFee < 0) ||
      (typeof update.deliveryFee === "number" && update.deliveryFee < 0) ||
      (typeof update.freeDeliveryThreshold === "number" && update.freeDeliveryThreshold < 0) ||
      (update.packagingChargeType !== undefined &&
        !["whole_order", "per_item"].includes(String(update.packagingChargeType)))
    ) {
      return NextResponse.json({ message: "Invalid store settings values" }, { status: 400 });
    }

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings(update);
    } else {
      Object.assign(settings, update);
    }

    await settings.save();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
