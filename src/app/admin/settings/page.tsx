"use client";

import React, { useEffect, useState } from "react";
import {
  Store,
  Receipt,
  Package,
  Truck,
  Save,
  CheckCircle2,
  AlertCircle,
  Percent,
  Sliders,
  Phone,
  MapPin,
  HelpCircle,
} from "lucide-react";

function SettingsSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex min-h-11 max-w-full items-center gap-2 rounded-xl px-1.5 py-1 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]/20"
    >
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${
          checked ? "bg-[#0C3B2E]" : "bg-slate-200"
        }`}
      >
        <span
          className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
      <span className="max-w-[150px] text-[10px] font-extrabold leading-tight text-[#0C3B2E] sm:max-w-none sm:text-xs">
        {label}
      </span>
    </button>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    taxEnabled: false,
    taxPercentage: 5,
    packagingEnabled: true,
    packagingChargeType: "whole_order",
    packagingFee: 15,
    deliveryEnabled: true,
    deliveryFee: 30,
    freeDeliveryThreshold: 300,
    restaurantName: "Evergreen Cafe & Restaurant",
    restaurantPhone: "+91 98765 43210",
    restaurantAddress: "Ravan Gali, Nisha Complex, Ambagarh Chowki, Rajnandgaon, Chhattisgarh - 491665",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.message) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Store rules and pricing settings updated successfully!" });
      } else {
        const errData = await res.json();
        setMessage({ type: "error", text: errData.message || "Failed to update settings" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Network error while saving settings" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#0C3B2E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
          Store Rules & Pricing Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Enable or disable Tax, Packaging Fees, Delivery Charges, and update Restaurant Info
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center space-x-3 shadow-xs ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Tax Rules */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-5">
          <div className="flex flex-col gap-3 border-b border-[#E6E2D8]/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-emerald-700" />
              <span>Tax Configuration (GST / Sales Tax)</span>
            </h3>

            {/* Toggle Switch */}
            <SettingsSwitch checked={settings.taxEnabled} label={settings.taxEnabled ? "TAX ENABLED" : "NO TAX (DISABLED)"} onChange={(taxEnabled) => setSettings({ ...settings, taxEnabled })} />
          </div>

          {settings.taxEnabled ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5">
                  <Percent className="w-4 h-4 text-emerald-700" />
                  <span>Tax Rate Percentage (%)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.taxPercentage}
                  onChange={(e) =>
                    setSettings({ ...settings, taxPercentage: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                />
                <p className="text-[11px] text-slate-500">
                  Applied to items subtotal during checkout.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              💡 Tax calculations are currently disabled. Customers will not be charged any GST/Taxes.
            </div>
          )}
        </div>

        {/* Section 2: Packaging Charge Rules */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-5">
          <div className="flex flex-col gap-3 border-b border-[#E6E2D8]/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
              <Package className="w-5 h-5 text-emerald-700" />
              <span>Packaging Charge Rules</span>
            </h3>

            {/* Toggle Switch */}
            <SettingsSwitch checked={settings.packagingEnabled} label={settings.packagingEnabled ? "PACKAGING FEE ENABLED" : "NO PACKAGING FEE (FREE)"} onChange={(packagingEnabled) => setSettings({ ...settings, packagingEnabled })} />
          </div>

          {settings.packagingEnabled ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Packaging Fee Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, packagingChargeType: "whole_order" })}
                    className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition cursor-pointer ${
                      settings.packagingChargeType === "whole_order"
                        ? "bg-[#EAF5EF] border-[#0C3B2E] ring-1 ring-[#0C3B2E]"
                        : "bg-slate-50 border-[#E6E2D8] hover:bg-slate-100"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-[#0C3B2E] text-white shrink-0">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#0C3B2E]">Fixed Per Whole Order</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        One fixed packaging fee applied to the total order regardless of items count.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, packagingChargeType: "per_item" })}
                    className={`p-4 rounded-2xl border text-left flex items-start space-x-3 transition cursor-pointer ${
                      settings.packagingChargeType === "per_item"
                        ? "bg-[#EAF5EF] border-[#0C3B2E] ring-1 ring-[#0C3B2E]"
                        : "bg-slate-50 border-[#E6E2D8] hover:bg-slate-100"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-[#0C3B2E] text-white shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#0C3B2E]">Per Item Packaging Fee</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Packaging fee multiplied by total item quantity ordered.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    Packaging Fee Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={settings.packagingFee}
                      onChange={(e) =>
                        setSettings({ ...settings, packagingFee: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full pl-8 pr-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {settings.packagingChargeType === "whole_order"
                      ? "Flat fee charged once per delivery order."
                      : "Fee charged per individual dish item container."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#EAF5EF] border border-emerald-200 text-emerald-900 text-xs font-medium">
              📦 Packaging charges are disabled. Packaging will be <strong>FREE (₹0)</strong> for all orders.
            </div>
          )}
        </div>

        {/* Section 3: Delivery Fee & Free Delivery Threshold */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-5">
          <div className="flex flex-col gap-3 border-b border-[#E6E2D8]/60 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
              <Truck className="w-5 h-5 text-emerald-700" />
              <span>Delivery Fee & Threshold Rules</span>
            </h3>

            {/* Toggle Switch */}
            <SettingsSwitch checked={settings.deliveryEnabled} label={settings.deliveryEnabled ? "DELIVERY FEE ENABLED" : "NO DELIVERY FEE (FREE DELIVERY)"} onChange={(deliveryEnabled) => setSettings({ ...settings, deliveryEnabled })} />
          </div>

          {settings.deliveryEnabled ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Standard Delivery Charge (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={settings.deliveryFee}
                    onChange={(e) =>
                      setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">Base delivery fee for orders below free threshold.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">
                  Free Delivery Minimum Threshold (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        freeDeliveryThreshold: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Orders with subtotal equal or higher get FREE delivery automatically.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-[#EAF5EF] border border-emerald-200 text-emerald-900 text-xs font-medium">
              🛵 Delivery charges are disabled. All customer orders will get <strong>FREE DELIVERY (₹0)</strong>.
            </div>
          )}
        </div>

        {/* Section 4: Restaurant Information */}
        <div className="bg-white p-6 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-5">
          <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3">
            <h3 className="font-serif text-lg font-bold text-[#0C3B2E] flex items-center space-x-2">
              <Store className="w-5 h-5 text-emerald-700" />
              <span>Restaurant Contact & Receipt Branding</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 uppercase">Restaurant Name</label>
              <input
                type="text"
                required
                value={settings.restaurantName}
                onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Phone / Hotline Number</span>
              </label>
              <input
                type="text"
                required
                value={settings.restaurantPhone}
                onChange={(e) => setSettings({ ...settings, restaurantPhone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Address Line</span>
              </label>
              <input
                type="text"
                required
                value={settings.restaurantAddress}
                onChange={(e) => setSettings({ ...settings, restaurantAddress: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-sm font-bold text-[#0C3B2E] focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-2xl btn-emerald text-sm font-extrabold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition flex items-center space-x-2 cursor-pointer"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Saving Store Rules..." : "Save Store Settings & Rules"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
