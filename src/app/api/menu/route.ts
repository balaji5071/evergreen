import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { MenuCategory } from "@/lib/models/MenuCategory";
import { MenuItem } from "@/lib/models/MenuItem";
import { requireAdminUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const includeAll = searchParams.get("all") === "true";

    await connectToDatabase();

    let query: any = {};
    if (!includeAll) {
      query.available = true;
    }

    if (category && category !== "All") {
      query.categoryId = category;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      const matchingCategories = await MenuCategory.find({ name: searchRegex }).select("_id");

      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        ...(matchingCategories.length > 0
          ? [{ categoryId: { $in: matchingCategories.map((category) => category._id) } }]
          : []),
      ];
    }

    const items = await MenuItem.find(query).populate("categoryId", "name").sort({ createdAt: -1 });

    return NextResponse.json(items, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error: any) {
    console.error("Fetch menu items error:", error);
    return NextResponse.json(
      { message: "Failed to fetch menu items" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const { categoryId, name, description, imageUrl, price, available } = body;

    if (!categoryId || !name || !description || price === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();

    const newItem = await MenuItem.create({
      categoryId,
      name,
      description,
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      price: Number(price),
      available: available !== undefined ? available : true,
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: "Failed to create menu item" }, { status: 500 });
  }
}
