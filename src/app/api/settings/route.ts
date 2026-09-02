import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { StoreSettings } from "@/lib/models/StoreSettings";

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
    await connectToDatabase();
    const body = await req.json();

    let settings = await StoreSettings.findOne();
    if (!settings) {
      settings = new StoreSettings(body);
    } else {
      Object.assign(settings, body);
    }

    await settings.save();
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("PUT /api/settings error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
