import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { requireAuthUser, comparePassword, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const sessionUser = await requireAuthUser();
    if (!sessionUser) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Both current password and new password are required." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json(
        { message: "New password must be between 8 and 128 characters." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await User.findById(sessionUser._id);
    if (!user) {
      return NextResponse.json({ message: "User account not found." }, { status: 404 });
    }

    // Verify current password
    const isMatch = await comparePassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect." },
        { status: 400 }
      );
    }

    // Hash new password and save
    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully!" });
  } catch (error: any) {
    console.error("POST /api/auth/change-password error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update password." },
      { status: 500 }
    );
  }
}
