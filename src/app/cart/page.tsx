"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShoppingBag,
  ChevronRight,
  Sparkles,
  Utensils,
} from "lucide-react";
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
    <div className="flex-1 flex flex-col pb-36 md:pb-16 bg-[#FAF8F5] text-slate-900 font-sans">
      {/* Header Container matching Evergreen Botanical Sage & Cream Hero */}
      <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center shadow-2xs shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
                Your Cart
              </h1>
              <p className="text-xs text-slate-600">
                Review items, apply coupons, and checkout
              </p>
            </div>
          </div>

          {cart.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#0C3B2E] bg-white border border-[#0C3B2E]/15 px-4 py-2 rounded-full shadow-2xs">
              <ShoppingBag className="w-3.5 h-3.5 text-[#0C3B2E]" />
              <span>
                {cart.reduce((sum, i) => sum + i.quantity, 0)} Items Selected
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-20 px-6 space-y-4 bg-white rounded-3xl border border-[#0C3B2E]/10 max-w-2xl mx-auto my-4 shadow-2xs">
            <div className="w-20 h-20 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/10 text-[#0C3B2E] flex items-center justify-center mx-auto text-3xl shadow-2xs">
              🛒
            </div>
            <h2 className="text-2xl font-bold text-[#0C3B2E]">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              Looks like you haven&apos;t added any delicious meals yet! Browse our handcrafted menu to fill your tray.
            </p>
            <div className="pt-2">
              <Link
                href="/menu"
                className="inline-flex items-center px-8 py-3.5 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white text-sm font-semibold shadow-sm transition"
              >
                <span>Browse Menu</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        ) : (
          /* Desktop 2-Column Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items + Coupons */}
            <div className="lg:col-span-7 space-y-6">
              {/* Cart Items Card Container */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#0C3B2E]/10 pb-3.5">
                  <h2 className="text-lg font-bold text-[#0C3B2E] flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/10 flex items-center justify-center">
                      <Utensils className="w-3.5 h-3.5 text-[#0C3B2E]" />
                    </span>
                    <span>Order Items</span>
                  </h2>
                  <span className="text-xs text-[#0C3B2E] font-semibold bg-[#EAF5EF] px-3 py-1 rounded-full">
                    {cart.length} unique dishes
                  </span>
                </div>

                <div className="divide-y divide-[#0C3B2E]/10">
                  {cart.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="py-4 flex items-center gap-4 first:pt-0 last:pb-0"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 bg-[#EAF5EF] border border-[#0C3B2E]/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm sm:text-base text-[#0C3B2E] truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs font-extrabold text-[#0C3B2E] mt-1">
                          ₹{item.price}{" "}
                          <span className="text-slate-500 font-normal">
                            x {item.quantity} = ₹{item.price * item.quantity}
                          </span>
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-2 bg-[#EAF5EF] rounded-full px-2 py-1 border border-[#0C3B2E]/15">
                          <button
                            onClick={() => updateQuantity(item.menuItemId, -1)}
                            className="w-6 h-6 rounded-full bg-white text-[#0C3B2E] flex items-center justify-center text-xs font-bold shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-[#0C3B2E] w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, 1)}
                            className="w-6 h-6 rounded-full bg-[#0C3B2E] text-white flex items-center justify-center text-xs font-bold shadow-2xs hover:bg-[#145341] transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.menuItemId)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition cursor-pointer"
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
              <div className="bg-white p-5 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-4 bg-[#EAF5EF] rounded-2xl border border-[#0C3B2E]/20 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0C3B2E] text-amber-300 flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0C3B2E] flex items-center gap-1.5 text-sm">
                          <span>Coupon &apos;{appliedCoupon}&apos; Active</span>
                          <Sparkles className="w-4 h-4 text-amber-500" />
                        </p>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {discountAmount > 0
                            ? `Awesome! You save ₹${discountAmount} on this order!`
                            : "Coupon code applied to order"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-2 rounded-full border border-red-200 bg-white text-red-600 font-semibold text-xs hover:bg-red-50 transition cursor-pointer shadow-2xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsCouponModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] rounded-2xl border border-dashed border-[#0C3B2E]/25 hover:border-[#0C3B2E] transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#0C3B2E] text-amber-300 flex items-center justify-center font-bold text-base shadow-2xs group-hover:scale-105 transition-transform">
                        🎟️
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-sm text-[#0C3B2E]">
                          Apply Restaurant Coupon
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Save more with active discount promo codes
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-[#0C3B2E] group-hover:translate-x-1 transition-transform">
                      <span>View Offers</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Order Summary & Checkout */}
            <div className="lg:col-span-5 lg:sticky lg:top-44 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-4">
                <h3 className="text-lg font-bold text-[#0C3B2E] border-b border-[#0C3B2E]/10 pb-3.5">
                  Bill Summary
                </h3>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      ₹{subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging Charge</span>
                    <span className="font-semibold text-slate-900">
                      ₹{packagingFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-slate-900">
                      ₹{deliveryFee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes &amp; Fees (5%)</span>
                    <span className="font-semibold text-slate-900">
                      ₹{taxes}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#0C3B2E] font-bold bg-[#EAF5EF] px-3.5 py-2.5 rounded-2xl border border-[#0C3B2E]/15">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4" />
                        <span>Coupon Discount</span>
                      </span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="border-t border-[#0C3B2E]/10 pt-4 flex justify-between items-center text-base font-extrabold text-[#0C3B2E]">
                    <span>To Pay</span>
                    <span className="text-xl text-[#0C3B2E]">₹{total}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full py-3.5 px-6 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white flex items-center justify-center gap-2 text-sm sm:text-base font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
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