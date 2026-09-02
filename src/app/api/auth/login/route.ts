import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models/User";
import { comparePassword, signToken, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || "admin@evergreen.com").trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const envAdminName = process.env.ADMIN_NAME || "Evergreen Admin";
    const envAdminPhone = process.env.ADMIN_PHONE || "+91 9876543210";

    await connectToDatabase();

    let user = await User.findOne({ email: cleanEmail });

    // Auto-seed/sync Admin account if credentials match environment variables
    if (cleanEmail === envAdminEmail && password === envAdminPassword) {
      if (!user) {
        const passwordHash = await hashPassword(envAdminPassword);
        user = await User.create({
          name: envAdminName,
          email: envAdminEmail,
          phone: envAdminPhone,
          passwordHash: passwordHash,
          role: "Admin",
          notificationEnabled: true,
        });
      } else {
        // Ensure admin role & updated password hash if needed
        let updated = false;
        if (user.role !== "Admin") {
          user.role = "Admin";
          updated = true;
        }
        const isMatch = await comparePassword(password, user.passwordHash);
        if (!isMatch) {
          user.passwordHash = await hashPassword(envAdminPassword);
          updated = true;
        }
        if (updated) {
          await user.save();
        }
      }
    } else {
      // Standard customer / existing user password verification
      if (!user) {
        return NextResponse.json(
          { message: "Invalid email or password." },
          { status: 401 }
        );
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { message: "Invalid email or password." },
          { status: 401 }
        );
      }
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions || [],
    });

    const response = NextResponse.json({
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        permissions: user.permissions || [],
        employeeId: user.employeeId || "",
        dutyStatus: user.dutyStatus || "Available",
        notificationEnabled: user.notificationEnabled ?? true,
      },
    });

    response.cookies.set("evergreen_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
