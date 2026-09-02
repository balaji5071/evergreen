import { NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import { broadcastPushNotification } from "@/lib/webpush";

export async function POST(req: Request) {
  try {
    const admin = await requireAdminUser();
    if (!admin) {
      return NextResponse.json({ message: "Unauthorized. Admin required." }, { status: 403 });
    }

    const { title, body, url } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ message: "Title and body are required" }, { status: 400 });
    }

    await broadcastPushNotification({
      title,
      body,
      url: url || "/menu",
    });

    return NextResponse.json({ message: "Marketing notification sent successfully!" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to broadcast notification" }, { status: 500 });
  }
}
