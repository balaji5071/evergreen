import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { requireAuthUser } from "@/lib/auth";
import { normalizeCartItems } from "@/lib/pricing";

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
    const existingItems = cart
      ? cart.items.map((item: any) => ({
          menuItemId: item.menuItemId.toString(),
          quantity: item.quantity,
        }))
      : [];
    const mergeItems = [...existingItems, ...guestItems];
    let normalized;
    try {
      normalized = await normalizeCartItems(mergeItems);
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formattedDbItems = normalized.items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    }));

    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        items: formattedDbItems,
        total: normalized.subtotal,
      });
    } else {
      cart.items = formattedDbItems as any;
      cart.total = normalized.subtotal;
      await cart.save();
    }

    return NextResponse.json({ message: "Cart merged successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to merge cart" }, { status: 500 });
  }
}
