import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PushSubscription } from "@/lib/models/PushSubscription";
import { requireAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subscription = await req.json();
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ message: "Invalid push subscription object" }, { status: 400 });
    }

    await connectToDatabase();

    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        userId: user._id,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: "Push subscription saved successfully" });
  } catch (error) {
    console.error("Save push subscription error:", error);
    return NextResponse.json({ message: "Failed to save push subscription" }, { status: 500 });
  }
}
