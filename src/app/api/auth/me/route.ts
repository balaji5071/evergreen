import { NextResponse } from "next/server";
import { getSessionUser, requireAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

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

    // Do not return stale JWT authorization data when the database user is missing.
    return NextResponse.json({
      message: "Session is no longer valid",
    }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
