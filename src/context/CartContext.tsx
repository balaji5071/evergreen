"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface CouponData {
  code: string;
  discountAmount: number;
  discountType?: "percentage" | "flat";
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  description?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: { _id: string; name: string; price: number; imageUrl: string }) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  packagingFee: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  appliedCoupon: string | null;
  couponData: CouponData | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load guest cart from localStorage or DB on mount
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            const dbCart = data.items || [];

            const localCartStr = localStorage.getItem("evergreen_guest_cart");
            if (localCartStr) {
              const guestCart: CartItem[] = JSON.parse(localCartStr);
              if (guestCart.length > 0) {
                await fetch("/api/cart/merge", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ guestItems: guestCart }),
                });
                localStorage.removeItem("evergreen_guest_cart");

                const mergedRes = await fetch("/api/cart");
                if (mergedRes.ok) {
                  const mergedData = await mergedRes.json();
                  setCart(mergedData.items || []);
                  setIsLoaded(true);
                  return;
                }
              }
            }
            setCart(dbCart);
          }
        } catch (e) {
          console.error("Failed to load user cart:", e);
        }
      } else {
        const localCartStr = localStorage.getItem("evergreen_guest_cart");
        if (localCartStr) {
          try {
            setCart(JSON.parse(localCartStr));
          } catch (e) {
            setCart([]);
          }
        }
      }
      setIsLoaded(true);
    };

    loadCart();
  }, [user]);

  // Sync guest cart changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      localStorage.setItem("evergreen_guest_cart", JSON.stringify(cart));
    }
  }, [cart, user, isLoaded]);

  const saveDBCart = async (updatedCart: CartItem[]) => {
    if (!user) return;
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updatedCart }),
      });
    } catch (e) {
      console.error("Failed to save cart to DB:", e);
    }
  };

  const addToCart = (item: { _id: string; name: string; price: number; imageUrl: string }) => {
    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.menuItemId === item._id);
      let newCart: CartItem[];
      if (existing) {
        newCart = prevCart.map((c) =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      } else {
        newCart = [
          ...prevCart,
          {
            menuItemId: item._id,
            name: item.name,
            price: item.price,
            quantity: 1,
            imageUrl: item.imageUrl,
          },
        ];
      }
      if (user) saveDBCart(newCart);
      return newCart;
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((c) => c.menuItemId !== menuItemId);
      if (user) saveDBCart(newCart);
      return newCart;
    });
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prevCart) => {
      const newCart = prevCart
        .map((c) => {
          if (c.menuItemId === menuItemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CartItem[];
      if (user) saveDBCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setCouponData(null);
    if (!user) {
      localStorage.removeItem("evergreen_guest_cart");
    } else {
      saveDBCart([]);
    }
  };

  const [storeSettings, setStoreSettings] = useState({
    taxEnabled: false,
    taxPercentage: 5,
    packagingEnabled: true,
    packagingChargeType: "whole_order",
    packagingFee: 15,
    deliveryEnabled: true,
    deliveryFee: 30,
    freeDeliveryThreshold: 300,
  });

  // Fetch store rules from Admin Store Settings
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.message) {
          setStoreSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.error("CartContext settings load error:", err));
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Dynamic packaging fee calculation (If enabled by admin)
  let packagingFee = 0;
  if (cart.length > 0 && storeSettings.packagingEnabled !== false) {
    if (storeSettings.packagingChargeType === "per_item") {
      packagingFee = totalItemsCount * (storeSettings.packagingFee || 0);
    } else {
      packagingFee = storeSettings.packagingFee || 0;
    }
  }

  // Dynamic delivery fee & free delivery threshold calculation (If enabled by admin)
  let deliveryFee = 0;
  if (cart.length > 0 && storeSettings.deliveryEnabled !== false) {
    if (
      storeSettings.freeDeliveryThreshold > 0 &&
      subtotal >= storeSettings.freeDeliveryThreshold
    ) {
      deliveryFee = 0;
    } else {
      deliveryFee = storeSettings.deliveryFee || 0;
    }
  }

  // Dynamic tax calculation (If enabled by admin)
  const rawTaxes =
    storeSettings.taxEnabled && subtotal > 0
      ? Math.round((subtotal * (storeSettings.taxPercentage || 0)) / 100)
      : 0;

  // Recalculate dynamic coupon discount based on current subtotal
  let discountAmount = 0;
  if (couponData) {
    if (couponData.minOrderAmount && subtotal < couponData.minOrderAmount) {
      discountAmount = 0;
    } else if (couponData.discountType === "percentage" && couponData.discountValue) {
      discountAmount = Math.round((subtotal * couponData.discountValue) / 100);
      if (couponData.maxDiscountAmount && couponData.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, couponData.maxDiscountAmount);
      }
    } else if (couponData.discountAmount !== undefined) {
      discountAmount = couponData.discountAmount;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const total = Math.max(0, subtotal + packagingFee + deliveryFee + rawTaxes - discountAmount);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Invalid coupon code" };
      }
      setCouponData({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        description: data.description,
      });
      return { success: true, message: data.message || `Coupon ${data.code} applied!` };
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to apply coupon" };
    }
  };

  const removeCoupon = () => {
    setCouponData(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        packagingFee,
        deliveryFee,
        taxes: rawTaxes,
        total,
        appliedCoupon: couponData ? couponData.code : null,
        couponData,
        discountAmount,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
