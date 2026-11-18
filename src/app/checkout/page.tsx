"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Banknote,
  AlertCircle,
  ArrowRight,
  Tag,
  ChevronRight,
  Building,
  Home,
  Briefcase,
  Navigation,
  User,
  PlusCircle,
  CheckCircle2,
  Gift,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import CouponModal from "@/components/customer/CouponModal";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    cart,
    subtotal,
    packagingFee,
    deliveryFee,
    taxes,
    total,
    appliedCoupon,
    discountAmount,
    removeCoupon,
    clearCart,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [orderType, setOrderType] = useState<"Delivery" | "Takeaway">("Delivery");
  const [phone, setPhone] = useState("");
  const [addressTitle, setAddressTitle] = useState("Home");

  // Address Selection Mode: "saved" | "new"
  const [addressMode, setAddressMode] = useState<"saved" | "new">("saved");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAllSavedAddresses, setShowAllSavedAddresses] = useState(false);

  // Ordering for Someone Else Feature
  const [isOrderingForSomeoneElse, setIsOrderingForSomeoneElse] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");

  // Explicit Structured Address Fields
  const [houseNo, setHouseNo] = useState("");
  const [streetArea, setStreetArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  // Load user saved addresses & populate initial form
  useEffect(() => {
    if (user) {
      fetch("/api/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setSavedAddresses(data);
            setSelectedAddressId(data[0]._id);
            setAddressTitle(data[0].title || "Home");
            parseAndSetAddress(data[0].address);
          } else {
            setAddressMode("new");
          }
        })
        .catch(() => {
          setAddressMode("new");
        });
    }
  }, [user]);

  // Helper to parse address or set default
  const parseAndSetAddress = (rawAddress: string) => {
    if (!rawAddress) return;
    const parts = rawAddress.split(",").map((p) => p.trim());
    if (parts.length >= 4) {
      setHouseNo(parts[0] || "");
      setStreetArea(parts[1] || "");
      setLandmark(parts[2]?.replace(/^Landmark:\s*/i, "") || "");
      const lastPart = parts[parts.length - 1];
      const pinMatch = lastPart.match(/\d{6}/);
      if (pinMatch) {
        setPincode(pinMatch[0]);
      }
      setCity(parts[parts.length - 2] || "");
      setState(parts[parts.length - 1]?.replace(/\d{6}/, "").trim() || "");
    } else {
      setStreetArea(rawAddress);
    }
  };

  const handleSelectSavedAddress = (addr: any) => {
    setSelectedAddressId(addr._id);
    setAddressTitle(addr.title || "Home");
    parseAndSetAddress(addr.address);
  };

  const handleUseNewAddress = () => {
    setAddressMode("new");
    setSelectedAddressId(null);
    setHouseNo("");
    setStreetArea("");
    setLandmark("");
    setPincode("");
    setCity("");
    setState("");
  };

  // Auto-fetch City & State when 6-digit Pincode is entered
  const handlePincodeChange = async (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 6);
    setPincode(cleaned);

    if (cleaned.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        if (res.ok) {
          const data = await res.json();
          if (
            Array.isArray(data) &&
            data[0]?.Status === "Success" &&
            data[0]?.PostOffice?.length > 0
          ) {
            const po = data[0].PostOffice[0];
            if (!city) setCity(po.District || po.Name);
            if (!state) setState(po.State);
            if (!streetArea) setStreetArea(po.Name);
          }
        }
      } catch (e) {
        console.error("Pincode lookup error:", e);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Guests cannot place orders. Please log in or sign up to complete your order.");
      setTimeout(() => {
        router.push("/login?redirect=checkout");
      }, 2000);
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!phone.trim()) {
      setError("Please provide your contact number.");
      return;
    }

    if (isOrderingForSomeoneElse) {
      if (!recipientName.trim()) {
        setError("Please enter the recipient's name.");
        return;
      }
      if (!recipientPhone.trim()) {
        setError("Please enter the recipient's phone number.");
        return;
      }
    }

    let formattedAddress = "";

    if (orderType === "Delivery") {
      if (addressMode === "saved" && selectedAddressId) {
        const selectedObj = savedAddresses.find((a) => a._id === selectedAddressId);
        if (selectedObj) {
          formattedAddress = selectedObj.address;
        } else {
          formattedAddress = `${houseNo.trim()}, ${streetArea.trim()}, Landmark: ${landmark.trim()}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}`;
        }
      } else {
        if (!houseNo.trim()) {
          setError("Please enter House / Flat Number.");
          return;
        }
        if (!streetArea.trim()) {
          setError("Please enter Street / Area.");
          return;
        }
        if (!landmark.trim()) {
          setError("Please enter Landmark.");
          return;
        }
        if (!pincode.trim() || pincode.length < 6) {
          setError("Please enter a valid 6-digit Pincode.");
          return;
        }
        if (!city.trim()) {
          setError("Please enter City.");
          return;
        }
        if (!state.trim()) {
          setError("Please enter State.");
          return;
        }
        formattedAddress = `${houseNo.trim()}, ${streetArea.trim()}, Landmark: ${landmark.trim()}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}`;
      }
    }

    if (isOrderingForSomeoneElse) {
      formattedAddress = `🎁 RECIPIENT: ${recipientName.trim()} (Ph: ${recipientPhone.trim()}) | ${formattedAddress}`;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  items: cart,
  totalAmount: total,
  orderType: orderType,
        couponCode: appliedCoupon,
  address:
    orderType === "Delivery"
      ? {
          title: isOrderingForSomeoneElse
            ? `${addressTitle} (For ${recipientName.trim()})`
            : addressTitle,
          address: formattedAddress,
        }
      : null,
}),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || "Failed to place order.");
        return;
      }

      clearCart();
      router.push(`/orders/${data._id}`);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Network error. Please try again.");
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#FAF8F5]">
        <div className="w-8 h-8 rounded-full border-2 border-[#0C3B2E] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pb-36 md:pb-16 bg-[#FAF8F5] text-slate-900 font-sans">
      {/* Header Container matching Evergreen Botanical Sage & Cream Hero */}
      <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center gap-4">
          <Link
            href="/cart"
            className="w-10 h-10 rounded-full bg-white border border-[#0C3B2E]/15 text-[#0C3B2E] hover:bg-[#EAF5EF] flex items-center justify-center transition shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
              Checkout Details
            </h1>
           <p className="text-xs text-slate-600">
  Choose delivery or takeaway and complete your order
</p>
          </div>
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5 shadow-2xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Delivery Details & Address Forms (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery / Takeaway Toggle */}
            <div className="p-1.5 bg-[#EAF5EF] rounded-full flex items-center border border-[#0C3B2E]/15">
              <button
                type="button"
                onClick={() => setOrderType("Delivery")}
                className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  orderType === "Delivery"
                    ? "bg-[#0C3B2E] text-white shadow-xs"
                    : "text-[#0C3B2E] hover:bg-white/60"
                }`}
              >
                🛵 Delivery
              </button>
              <button
                type="button"
                onClick={() => setOrderType("Takeaway")}
                className={`flex-1 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  orderType === "Takeaway"
                    ? "bg-[#0C3B2E] text-white shadow-xs"
                    : "text-[#0C3B2E] hover:bg-white/60"
                }`}
              >
                🛍️ Takeaway
              </button>
            </div>

            {/* Contact Number */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-2.5">
              <label className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0C3B2E]" />
                <span>Your Contact Phone Number *</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 90900 10210"
                className="w-full px-4 py-3 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
              />
            </div>

            {/* Feature: Ordering For Someone Else */}
            <div className="bg-gradient-to-br from-amber-300/20 to-[#EAF5EF] p-5 sm:p-6 rounded-3xl border border-amber-400/40 shadow-2xs space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-300 text-[#0C3B2E] flex items-center justify-center shrink-0 shadow-2xs">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0C3B2E]">
                      Ordering for someone else?
                    </h4>
                    <p className="text-xs text-slate-600">
                      Send food directly to a friend, family, or hostel mate!
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOrderingForSomeoneElse(!isOrderingForSomeoneElse)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                    isOrderingForSomeoneElse
                      ? "bg-[#0C3B2E] text-white shadow-xs"
                      : "bg-white text-[#0C3B2E] border border-[#0C3B2E]/20 hover:bg-[#EAF5EF]"
                  }`}
                >
                  {isOrderingForSomeoneElse ? "YES ✓" : "NO"}
                </button>
              </div>

              {/* Recipient Details Inputs */}
              {isOrderingForSomeoneElse && (
                <div className="pt-3 border-t border-amber-400/30 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#0C3B2E]/70" />
                      <span>Recipient Name *</span>
                    </label>
                    <input
                      type="text"
                      required={isOrderingForSomeoneElse}
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#0C3B2E]/15 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0C3B2E]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#0C3B2E]/70" />
                      <span>Recipient Phone Number *</span>
                    </label>
                    <input
                      type="tel"
                      required={isOrderingForSomeoneElse}
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#0C3B2E]/15 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#0C3B2E]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Structured Delivery Address Section */}
            {orderType === "Delivery" && (
              <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#0C3B2E]/10 pb-4 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0C3B2E]">
                      Delivery Address
                    </h3>
                  </div>

                  {/* Saved Address vs New Address Switcher */}
                  <div className="flex space-x-1 bg-[#EAF5EF] p-1 rounded-full border border-[#0C3B2E]/10">
                    {savedAddresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setAddressMode("saved")}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                          addressMode === "saved"
                            ? "bg-[#0C3B2E] text-white shadow-2xs"
                            : "text-[#0C3B2E] hover:bg-white/60"
                        }`}
                      >
                        Saved Addresses
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                        addressMode === "new"
                          ? "bg-[#0C3B2E] text-white shadow-2xs"
                          : "text-[#0C3B2E] hover:bg-white/60"
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Use New Address</span>
                    </button>
                  </div>
                </div>

                {/* Saved Address Cards Grid */}
                {addressMode === "saved" && savedAddresses.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Select Delivery Address:
                      </p>
                      {savedAddresses.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setShowAllSavedAddresses(!showAllSavedAddresses)}
                          className="text-xs font-semibold text-[#0C3B2E] flex items-center gap-1 hover:underline cursor-pointer bg-[#EAF5EF] px-3 py-1 rounded-full border border-[#0C3B2E]/15"
                        >
                          <span>
                            {showAllSavedAddresses
                              ? "Show Less"
                              : `View All (${savedAddresses.length})`}
                          </span>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              showAllSavedAddresses ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(showAllSavedAddresses
                        ? savedAddresses
                        : savedAddresses.slice(0, 1)
                      ).map((addr) => {
                        const isSelected = selectedAddressId === addr._id;

                        return (
                          <div
                            key={addr._id}
                            onClick={() => {
                              setAddressMode("saved");
                              handleSelectSavedAddress(addr);
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                              isSelected
                                ? "bg-[#EAF5EF] border-[#0C3B2E] shadow-2xs"
                                : "bg-[#FAF8F5] border-[#0C3B2E]/10 hover:bg-[#EAF5EF]/50"
                            }`}
                          >
                            <div
                              className={`p-2.5 rounded-xl shrink-0 ${
                                isSelected
                                  ? "bg-[#0C3B2E] text-amber-300"
                                  : "bg-white border border-[#0C3B2E]/10 text-[#0C3B2E]"
                              }`}
                            >
                              {addr.title === "Home" ? (
                                <Home className="w-4 h-4" />
                              ) : addr.title === "Work" ? (
                                <Briefcase className="w-4 h-4" />
                              ) : (
                                <Building className="w-4 h-4" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs sm:text-sm text-[#0C3B2E]">
                                  {addr.title || "Address"}
                                </span>
                                {isSelected && (
                                  <CheckCircle2 className="w-4 h-4 text-[#0C3B2E]" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                                {addr.address}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Address Type Tag (Home / Work / Hostel) */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-500">Tag as:</span>
                  {["Home", "Work", "Hostel", "Other"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setAddressTitle(tag)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        addressTitle === tag
                          ? "bg-[#0C3B2E] text-white shadow-2xs"
                          : "bg-[#EAF5EF] text-[#0C3B2E] hover:bg-[#dceee4]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Grid Inputs for Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 1: House / Flat Number * */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#0C3B2E]/70" />
                      <span>House / Flat Number *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="e.g. Room 302, Hostel B or Flat 12A, Apple Apartments"
                      className="w-full px-4 py-3 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
                    />
                  </div>

                  {/* Field 2: Street / Area * */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-[#0C3B2E]/70" />
                      <span>Street / Area *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={streetArea}
                      onChange={(e) => setStreetArea(e.target.value)}
                      placeholder="e.g. Kalasalingam University Campus or Main Road"
                      className="w-full px-4 py-3 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
                    />
                  </div>

                  {/* Field 3: Landmark * */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0C3B2E]/70" />
                      <span>Landmark *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Central Library / Opposite Admin Block"
                      className="w-full px-4 py-3 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
                    />
                  </div>

                  {/* Pincode & City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
                      Pincode *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => handlePincodeChange(e.target.value)}
                        placeholder="e.g. 626126"
                        className="w-full px-4 py-3 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
                      />
                      {pincodeLoading && (
                        <span className="absolute right-3 top-3 text-[10px] text-[#0C3B2E] font-bold animate-pulse">
                          Locating...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Krishnankoil"
                      className="w-full px-4 py-3 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-4 py-3 rounded-xl border border-[#0C3B2E]/15 bg-[#FAF8F5] text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-[#0C3B2E] transition"
                    />
                  </div>
                </div>
              </div>
            )}
{orderType === "Takeaway" && (
  <div className="bg-[#EAF5EF] p-5 sm:p-6 rounded-3xl border border-[#0C3B2E]/15">
    <h3 className="text-lg font-bold text-[#0C3B2E]">
      Takeaway Pickup
    </h3>
    <p className="text-sm text-slate-600 mt-2">
      Your order will be freshly prepared and ready for
      collection at Evergreen Cafe & Restaurant.
    </p>
  </div>
)}
            {/* Payment Method - COD ONLY */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-3">
              <label className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
                Payment Method
              </label>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#EAF5EF] border border-[#0C3B2E]/20">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#0C3B2E] text-amber-300 flex items-center justify-center shrink-0">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0C3B2E]">
                      Cash On Delivery (COD)
                    </p>
                    <p className="text-xs text-slate-600">
                      Pay cash upon meal arrival
                    </p>
                  </div>
                </div>

                <span className="px-3.5 py-1 rounded-full bg-[#0C3B2E] text-amber-300 text-[11px] font-bold tracking-wider uppercase">
                  Selected
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Order Summary & Action (5 Cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-44 space-y-6">
            {/* Coupons Launcher Bar */}
            <div className="bg-white p-5 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3.5 bg-[#EAF5EF] rounded-2xl border border-[#0C3B2E]/20 text-xs">
                  <div className="flex items-center gap-3">
                    <Tag className="w-4 h-4 text-[#0C3B2E]" />
                    <div>
                      <span className="font-bold text-[#0C3B2E]">
                        Coupon &apos;{appliedCoupon}&apos; Active
                      </span>
                      <span className="text-xs text-slate-600 font-semibold block mt-0.5">
                        Discount Saved: ₹{discountAmount}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-red-600 font-bold text-xs hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(true)}
                  className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] rounded-2xl border border-dashed border-[#0C3B2E]/25 hover:border-[#0C3B2E] transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🎟️</span>
                    <span className="font-bold text-xs sm:text-sm text-[#0C3B2E]">
                      Apply Promo Coupon
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#0C3B2E]" />
                </button>
              )}
            </div>

            {/* Order Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs space-y-4">
              <h3 className="text-lg font-bold text-[#0C3B2E] border-b border-[#0C3B2E]/10 pb-3.5">
                Order Items Summary
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar pr-1">
                {cart.map((item) => (
                  <div
                    key={item.menuItemId}
                    className="flex justify-between items-center text-xs sm:text-sm"
                  >
                    <span className="font-medium text-slate-800 truncate max-w-[70%]">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold text-[#0C3B2E]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#0C3B2E]/10 pt-4 space-y-2.5 text-xs sm:text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{subtotal}
                  </span>
                </div>
                <div className="flex justify-between">
  <span>Packaging &amp; Delivery</span>
  <span className="font-semibold text-slate-900">
    ₹{packagingFee + (orderType === "Delivery" ? deliveryFee : 0)}
  </span>
</div>
                <div className="flex justify-between">
                  <span>Taxes &amp; Fees</span>
                  <span className="font-semibold text-slate-900">₹{taxes}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#0C3B2E] font-bold bg-[#EAF5EF] px-3.5 py-2.5 rounded-2xl border border-[#0C3B2E]/15">
                    <span>Coupon Discount</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="border-t border-[#0C3B2E]/10 pt-4 flex justify-between items-center text-base font-extrabold text-[#0C3B2E]">
                  <span>Total Payable</span>
                  <span className="text-xl text-[#0C3B2E]">₹{total}</span>
                </div>
              </div>

              {/* Place Order CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-full bg-[#0C3B2E] hover:bg-[#145341] disabled:opacity-60 text-white flex items-center justify-center gap-2 text-sm sm:text-base font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <span>{loading ? "Placing Order..." : "PLACE ORDER"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
      />
    </div>
  );
}