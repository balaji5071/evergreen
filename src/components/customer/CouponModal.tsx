"use client";

import React, { useEffect, useState } from "react";
import { X, Tag, Sparkles, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CouponModal({ isOpen, onClose }: CouponModalProps) {
  const { subtotal, applyCoupon, appliedCoupon, removeCoupon } = useCart();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState("");
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      setErrorMsg("");
      setSuccessMsg("");
      fetchCoupons();
    }
  }, [isOpen]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons/available");
      const data = await res.json();
      setCoupons(data || []);
    } catch (e) {
      console.error("Failed to load coupons:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (codeToApply: string) => {
    setApplyingCode(codeToApply);
    setErrorMsg("");
    setSuccessMsg("");

    const res = await applyCoupon(codeToApply);
    setApplyingCode(null);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMsg(res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E6E2D8]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E6E2D8] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#EAF5EF] rounded-xl text-[#0C3B2E]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#0C3B2E]">Apply Coupon</h2>
              <p className="text-[11px] text-slate-500">Cart Total: ₹{subtotal}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* Manual Input Code Box */}
          <div className="bg-white p-3 rounded-2xl border border-[#E6E2D8] shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputCode.trim()) handleApply(inputCode.trim());
              }}
              className="flex space-x-2"
            >
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="ENTER PROMO CODE"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-mono font-bold uppercase tracking-wider text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
              <button
                type="submit"
                disabled={!inputCode.trim() || applyingCode === inputCode}
                className="px-5 py-2.5 rounded-xl bg-[#0C3B2E] text-amber-300 font-bold text-xs hover:bg-[#07251D] disabled:opacity-50 transition"
              >
                {applyingCode === inputCode ? "Validating..." : "APPLY"}
              </button>
            </form>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section Header */}
          <div className="flex items-center space-x-1.5 text-xs font-bold text-[#0C3B2E] uppercase tracking-wider pt-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Available Restaurant Coupons</span>
          </div>

          {/* Coupons Voucher List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-[#E6E2D8] text-xs text-slate-500">
              No coupons currently available. Check back soon!
            </div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => {
                const isApplied = appliedCoupon === coupon.code;
                const minOrder = coupon.minOrderAmount || 0;
                const isEligible = subtotal >= minOrder;
                const remaining = Math.round(minOrder - subtotal);

                // Estimated savings preview
                let estSavings = 0;
                if (coupon.discountType === "percentage") {
                  estSavings = Math.round((subtotal * coupon.discountValue) / 100);
                  if (coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0) {
                    estSavings = Math.min(estSavings, coupon.maxDiscountAmount);
                  }
                } else {
                  estSavings = coupon.discountValue || coupon.discount;
                }

                return (
                  <div
                    key={coupon._id}
                    className={`relative bg-white rounded-2xl border p-4 shadow-sm transition overflow-hidden ${
                      isApplied
                        ? "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20"
                        : "border-[#E6E2D8] hover:border-[#0C3B2E]/40"
                    }`}
                  >
                    {/* Top Tag & Header */}
                    <div className="flex items-start justify-between border-b border-dashed border-slate-200 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-xs tracking-wider px-2.5 py-1 rounded-md bg-[#0C3B2E] text-amber-300 border border-[#0C3B2E]">
                            {coupon.code}
                          </span>
                          {isEligible && estSavings > 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              SAVE ₹{estSavings}
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-[#0C3B2E] pt-1">
                          {coupon.description ||
                            (coupon.discountType === "percentage"
                              ? `${coupon.discountValue}% OFF`
                              : `Flat ₹${coupon.discountValue} OFF`)}
                        </p>
                      </div>

                      {/* CTA Apply / Remove Button */}
                      <div>
                        {isApplied ? (
                          <button
                            onClick={removeCoupon}
                            className="px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition"
                          >
                            Remove
                          </button>
                        ) : isEligible ? (
                          <button
                            onClick={() => handleApply(coupon.code)}
                            disabled={applyingCode === coupon.code}
                            className="px-4 py-1.5 rounded-xl bg-[#0C3B2E] text-white font-bold text-xs hover:bg-[#07251D] shadow-sm transition"
                          >
                            {applyingCode === coupon.code ? "Applying..." : "APPLY"}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 font-bold text-[11px] cursor-not-allowed"
                          >
                            ADD ₹{remaining} MORE
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Terms / Subtext */}
                    <div className="pt-2.5 flex items-center justify-between text-[10px] text-slate-500">
                      <span>
                        {minOrder > 0
                          ? `Valid on orders above ₹${minOrder}`
                          : "No minimum order requirement"}
                      </span>
                      {coupon.maxDiscountAmount > 0 && (
                        <span>Max discount ₹{coupon.maxDiscountAmount}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
