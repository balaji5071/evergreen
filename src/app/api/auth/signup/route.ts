import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { message: "All fields (name, email, phone, password) are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    await connectToDatabase();

    // Check if user already exists with email OR phone
    const existingUser = await User.findOne({
      $or: [{ email: cleanEmail }, { phone: cleanPhone }],
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return NextResponse.json(
          { message: "An account with this email address already exists." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: "An account with this phone number already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Public signup ALWAYS creates Customer role
    const newUser = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: "Customer",
      notificationEnabled: true,
    });

    const token = signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const response = NextResponse.json({
      user: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        notificationEnabled: newUser.notificationEnabled,
      },
    });

    response.cookies.set("evergreen_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || "email or phone";
      return NextResponse.json(
        { message: `An account with this ${field} already exists.` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
