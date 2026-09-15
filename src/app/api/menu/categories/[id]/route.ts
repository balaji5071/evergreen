import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MenuCategory } from "@/lib/models/MenuCategory";
import { MenuItem } from "@/lib/models/MenuItem";
import { requireStaffOrAdminUser } from "@/lib/auth";

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
    const { name, description, imageUrl, active } = body;

    await connectToDatabase();

    const updateFields: any = {};
    if (name !== undefined) updateFields.name = name.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl.trim();
    if (active !== undefined) updateFields.active = Boolean(active);

    const updatedCategory = await MenuCategory.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to update category" }, { status: 500 });
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

    // Check if category has items
    const itemCount = await MenuItem.countDocuments({ categoryId: id });
    if (itemCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete category containing ${itemCount} dish(es). Please delete or reassign dishes first.` },
        { status: 400 }
      );
    }

    const deletedCategory = await MenuCategory.findByIdAndDelete(id);
    if (!deletedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to delete category" }, { status: 500 });
  }
}
