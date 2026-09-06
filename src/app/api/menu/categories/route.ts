import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MenuCategory } from "@/lib/models/MenuCategory";
import { requireStaffOrAdminUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const includeAll = searchParams.get("all") === "true";

    await connectToDatabase();
    let query: any = {};
    if (!includeAll) {
      query.active = true;
    }

    const categories = await MenuCategory.find(query).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireStaffOrAdminUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized. Admin or Staff access required." }, { status: 403 });
    }

    const { name, description, imageUrl, active } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    await connectToDatabase();
    const newCategory = await MenuCategory.create({
      name: name.trim(),
      description: description ? description.trim() : "",
      imageUrl: imageUrl ? imageUrl.trim() : "",
      active: active !== undefined ? Boolean(active) : true,
    });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || "Failed to create category" }, { status: 500 });
  }
}
