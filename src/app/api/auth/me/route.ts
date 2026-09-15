import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // Session reads should not wait for MongoDB. The JWT contains the access
    // data needed by the client; database-backed pages validate permissions separately.
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
