import mongoose from "mongoose";
import { Cart } from "@/lib/models/Cart";
import { MenuItem } from "@/lib/models/MenuItem";
import { StoreSettings } from "@/lib/models/StoreSettings";

export interface ServerCartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export async function getServerCart(userId: mongoose.Types.ObjectId | string) {
  const cart = await Cart.findOne({ userId }).populate("items.menuItemId");
  if (!cart) {
    return { items: [] as ServerCartItem[], subtotal: 0 };
  }

  const items: ServerCartItem[] = [];
  for (const cartItem of cart.items as any[]) {
    const menuItem = cartItem.menuItemId;
    if (!menuItem || menuItem.available === false) continue;

    const quantity = Math.floor(Number(cartItem.quantity));
    if (!Number.isInteger(quantity) || quantity < 1) continue;

    items.push({
      menuItemId: menuItem._id.toString(),
      name: menuItem.name,
      price: Number(menuItem.price),
      quantity,
      imageUrl: menuItem.imageUrl || "",
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items, subtotal };
}

export async function normalizeCartItems(items: any[]) {
  if (!Array.isArray(items)) {
    throw new Error("Items must be an array.");
  }
  if (items.length > 100) {
    throw new Error("Cart contains too many distinct items.");
  }

  const merged = new Map<string, number>();
  for (const item of items) {
    if (!item || typeof item.menuItemId !== "string" || !mongoose.isValidObjectId(item.menuItemId)) {
      throw new Error("Cart contains an invalid menu item.");
    }
    const quantity = Math.floor(Number(item.quantity));
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Cart quantities must be whole numbers between 1 and 99.");
    }
    merged.set(item.menuItemId, (merged.get(item.menuItemId) || 0) + quantity);
  }

  const ids = Array.from(merged.keys());
  const menuItems = await MenuItem.find({ _id: { $in: ids }, available: true }).select(
    "_id name price imageUrl"
  );
  const menuById = new Map(menuItems.map((item) => [item._id.toString(), item]));

  if (menuById.size !== merged.size) {
    throw new Error("One or more cart items are unavailable.");
  }

  const normalized: ServerCartItem[] = ids.map((id) => {
    const menuItem = menuById.get(id)!;
    const quantity = Math.min(merged.get(id)!, 99);
    return {
      menuItemId: id,
      name: menuItem.name,
      price: Number(menuItem.price),
      quantity,
      imageUrl: menuItem.imageUrl || "",
    };
  });

  return {
    items: normalized,
    subtotal: normalized.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

export async function getStoreSettings() {
  let settings = await StoreSettings.findOne();
  if (!settings) {
    settings = await StoreSettings.create({});
  }
  return settings;
}

export async function calculateCheckoutTotal(
  subtotal: number,
  orderType: "Delivery" | "Takeaway",
  discountAmount = 0,
  itemCount = 1
) {
  const settings = await getStoreSettings();
  const packagingFee =
    settings.packagingEnabled
      ? settings.packagingChargeType === "per_item"
        ? Number(settings.packagingFee || 0) * itemCount
        : Number(settings.packagingFee || 0)
      : 0;
  const deliveryFee =
    orderType === "Delivery" && settings.deliveryEnabled
      ? subtotal >= Number(settings.freeDeliveryThreshold || 0)
        ? 0
        : Number(settings.deliveryFee || 0)
      : 0;
  const taxes =
    settings.taxEnabled && subtotal > 0
      ? Math.round((subtotal * Number(settings.taxPercentage || 0)) / 100)
      : 0;
  const discount = Math.min(Math.max(0, discountAmount), subtotal);
  const total = Math.max(0, subtotal + packagingFee + deliveryFee + taxes - discount);

  return { subtotal, packagingFee, deliveryFee, taxes, discountAmount: discount, total };
}
