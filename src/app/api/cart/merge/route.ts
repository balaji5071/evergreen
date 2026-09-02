import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { requireAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { guestItems } = await req.json();
    if (!guestItems || !Array.isArray(guestItems) || guestItems.length === 0) {
      return NextResponse.json({ message: "No guest items to merge" });
    }

    await connectToDatabase();

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        items: guestItems.map((item: any) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        total: guestItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      });
    } else {
      const existingItemsMap = new Map();
      cart.items.forEach((item: any) => {
        existingItemsMap.set(item.menuItemId.toString(), item.quantity);
      });

      guestItems.forEach((gItem: any) => {
        const id = gItem.menuItemId;
        if (existingItemsMap.has(id)) {
          existingItemsMap.set(id, existingItemsMap.get(id) + gItem.quantity);
        } else {
          existingItemsMap.set(id, gItem.quantity);
        }
      });

      const mergedItems = Array.from(existingItemsMap.entries()).map(([menuItemId, quantity]) => ({
        menuItemId,
        quantity,
      }));

      cart.items = mergedItems as any;
      await cart.save();
    }

    return NextResponse.json({ message: "Cart merged successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to merge cart" }, { status: 500 });
  }
}
