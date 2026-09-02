import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Cart } from "@/lib/models/Cart";
import { requireAuthUser } from "@/lib/auth";

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

    const formattedDbItems = (items || []).map((i: any) => ({
      menuItemId: i.menuItemId,
      quantity: i.quantity,
    }));

    const total = (items || []).reduce(
      (acc: number, i: any) => acc + i.price * i.quantity,
      0
    );

    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = await Cart.create({
        userId: user._id,
        items: formattedDbItems,
        total,
      });
    } else {
      cart.items = formattedDbItems;
      cart.total = total;
      await cart.save();
    }

    return NextResponse.json({ message: "Cart saved successfully", total: cart.total });
  } catch (error) {
    return NextResponse.json({ message: "Failed to save cart" }, { status: 500 });
  }
}
