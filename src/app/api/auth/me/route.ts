import { NextResponse } from "next/server";
import { getSessionUser, requireAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    try {
      const user = await requireAuthUser();
      if (user) {
        return NextResponse.json({
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
      }
    } catch (e) {
      // Fallback to JWT payload if DB lookup delays
    }

    // Fast instant response from decoded JWT session cookie
    return NextResponse.json({
      user: {
        _id: session.userId,
        name: session.name,
        email: session.email,
        phone: "",
        role: session.role,
        permissions: session.permissions || [],
        notificationEnabled: true,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
