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

export async function PUT(req: Request) {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { addressId, title, address, latitude, longitude } = await req.json();
    if (!addressId) {
      return NextResponse.json({ message: "Address ID is required" }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ message: "Address string is required" }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId: user._id },
      { title: title || "Home", address, latitude, longitude },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get("id");
    if (!addressId) {
      return NextResponse.json({ message: "Address ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Address.findOneAndDelete({ _id: addressId, userId: user._id });
    if (!deleted) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete address" }, { status: 500 });
  }
}
