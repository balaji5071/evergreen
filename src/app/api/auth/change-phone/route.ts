import { NextRequest, NextResponse } from "next/server";
import { requireAuthUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { newPhone } = await req.json();

    if (!newPhone || newPhone.trim().length < 10) {
      return NextResponse.json(
        { message: "Please enter a valid phone number (minimum 10 digits)." },
        { status: 400 }
      );
    }

    // Sanitize phone: keep only digits
    const sanitized = newPhone.replace(/[^0-9]/g, "");
    if (sanitized.length < 10 || sanitized.length > 13) {
      return NextResponse.json(
        { message: "Phone number must be between 10 and 13 digits." },
        { status: 400 }
      );
    }

    user.phone = sanitized;
    await user.save();

    return NextResponse.json({
      message: "Phone number updated successfully!",
      phone: sanitized,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
