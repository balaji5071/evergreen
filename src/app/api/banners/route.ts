import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Banner } from "@/lib/models/Banner";
import { requireAdminUser } from "@/lib/auth";
import { notifyAllUsersNewBanner } from "@/lib/notificationsHelper";

export async function GET() {
  try {
    await connectToDatabase();
    const banners = await Banner.find({ active: true }).sort({ createdAt: -1 });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { title, imageUrl, active } = await req.json();
    if (!title || !imageUrl) {
      return NextResponse.json({ message: "Title and imageUrl are required" }, { status: 400 });
    }

    await connectToDatabase();
    const isBannerActive = active !== undefined ? Boolean(active) : true;
    const banner = await Banner.create({ title, imageUrl, active: isBannerActive });

    if (banner.active) {
      await notifyAllUsersNewBanner(banner);
    }

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to create banner" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { id, title, imageUrl, active } = await req.json();
    if (!id) {
      return NextResponse.json({ message: "Banner ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await Banner.findByIdAndUpdate(id, { title, imageUrl, active }, { new: true });

    if (updated && updated.active) {
      await notifyAllUsersNewBanner(updated);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update banner" }, { status: 500 });
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
      return NextResponse.json({ message: "Banner ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    await Banner.findByIdAndDelete(id);
    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete banner" }, { status: 500 });
  }
}
