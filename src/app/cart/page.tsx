"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Minus, ArrowRight, Tag, ShoppingBag, Check, ChevronRight, Sparkles, Utensils } from "lucide-react";
import BottomNav from "@/components/customer/BottomNav";
import CouponModal from "@/components/customer/CouponModal";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    subtotal,
    packagingFee,
    deliveryFee,
    taxes,
    total,
    appliedCoupon,
    discountAmount,
    removeCoupon,
  } = useCart();

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col pb-36 md:pb-12 bg-[#FAF8F5]">
      {/* Header Container */}
      <header className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#EAF5EF] rounded-2xl text-[#0C3B2E]">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
                Your Cart
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Review items, apply coupons, and checkout
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="hidden sm:flex items-center space-x-2 text-xs font-bold text-[#0C3B2E] bg-[#EAF5EF] px-4 py-2 rounded-full border border-[#0C3B2E]/20">
              <ShoppingBag className="w-4 h-4 text-[#0C3B2E]" />
              <span>{cart.reduce((sum, i) => sum + i.quantity, 0)} Items Selected</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {cart.length === 0 ? (
          <div className="text-center py-24 space-y-4 bg-white rounded-3xl border border-[#E6E2D8] max-w-2xl mx-auto my-8 p-8 shadow-card-soft">
            <div className="w-20 h-20 rounded-full bg-[#EAF5EF] text-[#0C3B2E] flex items-center justify-center mx-auto text-3xl shadow-sm">
              🛒
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#0C3B2E]">Your Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              Looks like you haven't added any delicious meals yet! Browse our handcrafted menu to fill your tray.
            </p>
            <div className="pt-3">
              <Link
                href="/menu"
                className="inline-flex items-center px-8 py-4 rounded-2xl btn-emerald text-sm font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        ) : (
          /* Desktop 2-Column Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items + Coupons (8 Cols on Desktop) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Cart Items Card Container */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4">
                <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3">
                  <h2 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
                    <Utensils className="w-4 h-4 text-amber-600" />
                    <span>Order Items</span>
                  </h2>
                  <span className="text-xs text-slate-400 font-semibold">
                    {cart.length} unique dishes
                  </span>
                </div>

                <div className="divide-y divide-[#E6E2D8]/50">
                  {cart.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="py-4 flex items-center space-x-4 first:pt-0 last:pb-0"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-[#E6E2D8]/60 shadow-xs"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-[#0C3B2E] truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs font-extrabold text-[#0C3B2E] mt-1">
                          ₹{item.price}{" "}
                          <span className="text-slate-400 font-normal">
                            x {item.quantity} = ₹{item.price * item.quantity}
                          </span>
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-[#EAF5EF] rounded-xl px-2.5 py-1.5 border border-emerald-200">
                          <button
                            onClick={() => updateQuantity(item.menuItemId, -1)}
                            className="w-7 h-7 rounded-lg bg-white text-[#0C3B2E] flex items-center justify-center text-xs font-bold shadow-xs hover:bg-slate-100 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-extrabold text-[#0C3B2E] w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, 1)}
                            className="w-7 h-7 rounded-lg bg-[#0C3B2E] text-white flex items-center justify-center text-xs font-bold shadow-xs hover:bg-[#082920] transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.menuItemId)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon Launcher Box */}
              <div className="bg-white p-5 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-3">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-extrabold text-emerald-900 flex items-center space-x-1.5 text-sm">
                          <span>Coupon '{appliedCoupon}' Active</span>
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        </p>
                        <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                          {discountAmount > 0
                            ? `Awesome! You save ₹${discountAmount} on this order!`
                            : "Coupon code applied to order"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-2 rounded-xl border border-red-200 bg-white text-red-600 font-bold text-xs hover:bg-red-50 transition cursor-pointer shadow-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCouponModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-amber-50/70 to-emerald-50/70 rounded-2xl border border-dashed border-[#0C3B2E]/30 hover:border-[#0C3B2E] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-[#0C3B2E] text-amber-300 flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                        🎟️
                      </div>
                      <div className="text-left">
                        <p className="font-extrabold text-sm text-[#0C3B2E] flex items-center space-x-1">
                          <span>APPLY RESTAURANT COUPON</span>
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Save more with active discount promo codes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-xs font-extrabold text-[#0C3B2E] group-hover:translate-x-1 transition-transform">
                      <span>View Offers</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Order Summary & Checkout (5 Cols on Desktop) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#0C3B2E] border-b border-[#E6E2D8]/60 pb-3">
                  Bill Summary
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-bold text-slate-800">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging Charge</span>
                    <span className="font-bold text-slate-800">₹{packagingFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-bold text-slate-800">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees (5%)</span>
                    <span className="font-bold text-slate-800">₹{taxes}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                      <span className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span>Coupon Discount</span>
                      </span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="border-t border-[#E6E2D8] pt-4 flex justify-between items-center text-base font-extrabold text-[#0C3B2E]">
                    <span>To Pay</span>
                    <span className="text-xl text-[#0C3B2E]">₹{total}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full py-4 rounded-2xl btn-emerald flex items-center justify-center space-x-2 text-base font-extrabold shadow-lg hover:shadow-xl transition-all cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
      />

      <BottomNav />
    </div>
  );
}
