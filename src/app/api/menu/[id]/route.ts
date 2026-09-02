import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MenuItem } from "@/lib/models/MenuItem";
import { requireStaffOrAdminUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const item = await MenuItem.findById(id).populate("categoryId", "name");
    if (!item) {
      return NextResponse.json({ message: "Menu item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to fetch menu item" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireStaffOrAdminUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, price, description, categoryId, imageUrl, available } = body;

    await connectToDatabase();

    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      {
        ...(name && { name }),
        ...(price !== undefined && { price: Number(price) }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId }),
        ...(imageUrl && { imageUrl }),
        ...(available !== undefined && { available: Boolean(available) }),
      },
      { new: true }
    ).populate("categoryId", "name");

    if (!updatedItem) {
      return NextResponse.json({ message: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireStaffOrAdminUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    await connectToDatabase();

    const deletedItem = await MenuItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return NextResponse.json({ message: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete menu item" }, { status: 500 });
  }
}
