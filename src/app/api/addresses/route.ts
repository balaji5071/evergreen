import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Address } from "@/lib/models/Address";
import { requireAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const addresses = await Address.find({ userId: user._id }).sort({ createdAt: -1 });
    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { title, address, latitude, longitude } = await req.json();

    if (!address) {
      return NextResponse.json({ message: "Address string is required" }, { status: 400 });
    }

    await connectToDatabase();

    const newAddress = await Address.create({
      userId: user._id,
      title: title || "Home",
      address,
      latitude,
      longitude,
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to save address" }, { status: 500 });
  }
}
