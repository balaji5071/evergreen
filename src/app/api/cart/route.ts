import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { requireAuthUser } from "@/lib/auth";
import { normalizeCartItems } from "@/lib/pricing";

export async function GET() {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const cart = await Cart.findOne({ userId: user._id }).populate("items.menuItemId");
    if (!cart) {
      return NextResponse.json({ items: [], total: 0 });
    }

    // Format cart items
    const formattedItems = cart.items
      .map((item: any) => {
        if (!item.menuItemId) return null;
        return {
          menuItemId: item.menuItemId._id.toString(),
          name: item.menuItemId.name,
          price: item.menuItemId.price,
          quantity: item.quantity,
          imageUrl: item.menuItemId.imageUrl,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ items: formattedItems, total: cart.total });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { items } = await req.json();
    await connectToDatabase();
    let normalized;
    try {
      normalized = await normalizeCartItems(items || []);
    } catch (error: any) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formattedDbItems = normalized.items.map((item) => ({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
    }));
    const total = normalized.subtotal;

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        items: formattedDbItems,
        total,
      });
    } else {
      cart.items = formattedDbItems as any;
      cart.total = total;
      await cart.save();
    }

    return NextResponse.json({ message: "Cart saved successfully", total: cart.total });
  } catch (error) {
    return NextResponse.json({ message: "Failed to save cart" }, { status: 500 });
  }
}
