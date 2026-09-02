"use client";

import React, { useEffect, useState } from "react";
import { Tag, Plus, CheckCircle, Trash2, Percent, IndianRupee, Info, Sparkles, RefreshCw } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code.trim() || !discountValue) {
      setError("Coupon code and discount value are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: Number(minOrderAmount) || 0,
          maxDiscountAmount: Number(maxDiscountAmount) || 0,
          description: description.trim(),
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        setError(data.message || "Failed to create coupon");
        return;
      }

      setSuccess(`Coupon '${data.code}' created successfully as ${discountType === "percentage" ? "% Percentage" : "₹ Flat"} discount!`);
      setCode("");
      setDiscountValue("");
      setMinOrderAmount("");
      setMaxDiscountAmount("");
      setDescription("");
      fetchCoupons();
    } catch (e: any) {
      setSaving(false);
      setError(e.message || "Failed to create coupon");
    }
  };

  const handleToggleStatus = async (id: string, currentActive: boolean) => {
    try {
      await fetch("/api/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleDiscountType = async (coupon: any) => {
    const newType = coupon.discountType === "percentage" ? "flat" : "percentage";
    const val = coupon.discountValue || coupon.discount;
    const newDesc = newType === "percentage"
      ? `Get ${val}% OFF${coupon.maxDiscountAmount > 0 ? ` up to ₹${coupon.maxDiscountAmount}` : ""}${coupon.minOrderAmount > 0 ? ` on orders above ₹${coupon.minOrderAmount}` : ""}`
      : `Flat ₹${val} OFF${coupon.minOrderAmount > 0 ? ` on orders above ₹${coupon.minOrderAmount}` : ""}`;

    try {
      await fetch("/api/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coupon._id,
          discountType: newType,
          description: newDesc,
        }),
      });
      fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await fetch(`/api/coupons?id=${id}`, {
        method: "DELETE",
      });
      fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#0C3B2E]">Promotional Coupons</h2>
        <p className="text-xs text-slate-500">
          Create & manage Swiggy/Zomato style discount coupons for customer checkout
        </p>
      </div>

      {/* Add New Coupon Form */}
      <form
        onSubmit={handleAddCoupon}
        className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4"
      >
        <div className="flex items-center space-x-2 border-b border-[#E6E2D8]/60 pb-3">
          <div className="p-2 bg-[#EAF5EF] rounded-xl text-[#0C3B2E]">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#0C3B2E]">Create New Coupon</h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Coupon Code */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Coupon Code</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. WELCOME50"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
            />
          </div>

          {/* Discount Type Toggle */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Discount Type</label>
            <div className="p-1 bg-slate-100 rounded-xl flex items-center">
              <button
                type="button"
                onClick={() => setDiscountType("percentage")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  discountType === "percentage"
                    ? "bg-[#0C3B2E] text-amber-300 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Percentage (%)</span>
              </button>
              <button
                type="button"
                onClick={() => setDiscountType("flat")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                  discountType === "flat"
                    ? "bg-[#0C3B2E] text-amber-300 shadow-sm"
                    : "text-slate-600"
                }`}
              >
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Flat Amount (₹)</span>
              </button>
            </div>
          </div>

          {/* Discount Value */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">
              {discountType === "percentage" ? "Discount Percentage (%)" : "Flat Discount Amount (₹)"}
            </label>
            <input
              type="number"
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === "percentage" ? "e.g. 50 (for 50% OFF)" : "e.g. 100 (for ₹100 OFF)"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Min Order Value */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">
              Min Order Amount (₹)
            </label>
            <input
              type="number"
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="e.g. 199 (0 for no limit)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
            />
          </div>

          {/* Max Discount Cap (Only for percentage) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">
              Max Discount Cap (₹)
            </label>
            <input
              type="number"
              disabled={discountType === "flat"}
              value={maxDiscountAmount}
              onChange={(e) => setMaxDiscountAmount(e.target.value)}
              placeholder={discountType === "flat" ? "N/A for flat discount" : "e.g. 120 (0 for uncapped)"}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E] disabled:opacity-50"
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Custom Offer Text</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 50% OFF up to ₹120 on orders above ₹199"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl btn-emerald text-xs font-bold shadow-md"
        >
          {saving ? "Creating Coupon..." : "Create Coupon Code"}
        </button>
      </form>

      {/* Coupons Voucher List */}
      <div className="space-y-3">
        <h3 className="font-serif text-lg font-bold text-[#0C3B2E]">Active & Configured Coupons</h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-32 bg-slate-200 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#E6E2D8] text-center text-xs text-slate-500">
            No coupons configured yet. Create one above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coupons.map((c) => {
              const isPercentage = c.discountType === "percentage";
              const val = c.discountValue !== undefined ? c.discountValue : c.discount;

              return (
                <div
                  key={c._id}
                  className="bg-white p-5 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-[#0C3B2E] bg-[#EAF5EF] px-3 py-1 rounded-xl border border-[#0C3B2E]/20">
                          {c.code}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {c.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="font-bold text-xs text-[#0C3B2E] pt-1">
                        {c.description ||
                          (isPercentage
                            ? `${val}% OFF`
                            : `Flat ₹${val} OFF`)}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteCoupon(c._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition"
                      title="Delete Coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span>Discount Rule:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#0C3B2E]">
                          {isPercentage ? `${val}% OFF` : `Flat ₹${val} OFF`}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleDiscountType(c)}
                          className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center space-x-1 hover:bg-amber-200 transition"
                          title="Switch between Percentage and Flat"
                        >
                          <RefreshCw className="w-2.5 h-2.5" />
                          <span>Switch to {isPercentage ? "Flat ₹" : "Percentage %"}</span>
                        </button>
                      </div>
                    </div>

                    {c.minOrderAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Min Order Amount:</span>
                        <span className="font-semibold text-slate-800">₹{c.minOrderAmount}</span>
                      </div>
                    )}
                    {c.maxDiscountAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Max Discount Cap:</span>
                        <span className="font-semibold text-slate-800">₹{c.maxDiscountAmount}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleToggleStatus(c._id, c.active)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition ${
                        c.active
                          ? "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                          : "bg-[#0C3B2E] text-white border-[#0C3B2E] hover:bg-[#07251D]"
                      }`}
                    >
                      {c.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
