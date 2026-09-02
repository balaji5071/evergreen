import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { uploadImageToCloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ message: "Image base64 string is required" }, { status: 400 });
    }

    const imageUrl = await uploadImageToCloudinary(image);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    return NextResponse.json({ message: "Failed to upload image" }, { status: 500 });
  }
}
