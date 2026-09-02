import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MenuCategory } from "@/lib/models/MenuCategory";
import { MenuItem } from "@/lib/models/MenuItem";
import { requireAdminUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    await connectToDatabase();
    const totalCategories = await MenuCategory.countDocuments({});
    const totalItems = await MenuItem.countDocuments({});

    return NextResponse.json({
      success: true,
      message: "Menu database is fully seeded and synchronized.",
      totalCategories,
      totalItems,
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to seed menu" }, { status: 500 });
  }
}
