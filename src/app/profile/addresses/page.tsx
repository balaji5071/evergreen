"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Home,
  Briefcase,
  Building,
  Navigation,
  X,
  ChevronDown,
} from "lucide-react";
import BottomNav from "@/components/customer/BottomNav";

export default function SavedAddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form modal & view toggle state
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [title, setTitle] = useState("Home");

  // Structured address fields
  const [houseNo, setHouseNo] = useState("");
  const [streetArea, setStreetArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [saving, setSaving] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

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

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !houseNo.trim() ||
      !streetArea.trim() ||
      !landmark.trim() ||
      !pincode.trim() ||
      !city.trim() ||
      !state.trim()
    ) {
      alert("Please fill in all required address fields.");
      return;
    }

    setSaving(true);
    const formattedAddress = `${houseNo.trim()}, ${streetArea.trim()}, Landmark: ${landmark.trim()}, ${city.trim()}, ${state.trim()} - ${pincode.trim()}`;

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          address: formattedAddress,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        // Reset form
        setHouseNo("");
        setStreetArea("");
        setLandmark("");
        setPincode("");
        setCity("");
        setState("");
        fetchAddresses();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Delete this saved address?")) return;
    try {
      const res = await fetch(`/api/addresses?id=${encodeURIComponent(addressId)}`, {
        method: "DELETE",
      });
      if (res.ok) await fetchAddresses();
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-44 md:pb-32 bg-[#FAF8F5] text-slate-900 font-sans">
      {/* Header Container matching Evergreen Botanical Sage & Cream Theme */}
      <header className="bg-gradient-to-br from-[#F7FBF8] via-[#EFF7F2] to-[#E6F2EB] border-b border-[#0C3B2E]/10 sticky top-20 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Link
              href="/profile"
              className="w-10 h-10 rounded-full bg-white border border-[#0C3B2E]/15 text-[#0C3B2E] hover:bg-[#EAF5EF] flex items-center justify-center transition shadow-2xs shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0C3B2E] tracking-tight">
                Saved Addresses
              </h1>
              <p className="text-xs text-slate-600">
                Manage home, hostel, or office delivery destinations
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-32 bg-white animate-pulse rounded-3xl border border-[#0C3B2E]/10"
              />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-20 space-y-4 bg-white rounded-3xl border border-[#0C3B2E]/10 max-w-lg mx-auto shadow-2xs p-8">
            <div className="w-16 h-16 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/10 text-[#0C3B2E] flex items-center justify-center mx-auto text-2xl">
              📍
            </div>
            <h3 className="text-xl font-bold text-[#0C3B2E]">No saved addresses</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Add your home, hostel, or office address for seamless 1-click checkout.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Add Your First Address
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(showAll ? addresses : addresses.slice(0, 1)).map((addr) => (
                <div
                  key={addr._id}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-[#0C3B2E]/10 shadow-2xs flex items-start justify-between gap-4 hover:shadow-md hover:border-[#0C3B2E]/25 transition-all duration-300"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#EAF5EF] border border-[#0C3B2E]/15 text-[#0C3B2E] flex items-center justify-center mt-0.5 shrink-0">
                      {addr.title === "Home" ? (
                        <Home className="w-5 h-5" />
                      ) : addr.title === "Work" ? (
                        <Briefcase className="w-5 h-5" />
                      ) : (
                        <Building className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <span className="inline-block px-3 py-0.5 rounded-full bg-[#EAF5EF] text-[#0C3B2E] text-xs font-bold border border-[#0C3B2E]/15">
                        {addr.title}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-medium">
                        {addr.address}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr._id)}
                      className="px-3 py-2 rounded-full border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {addresses.length > 1 && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#0C3B2E]/15 text-[#0C3B2E] font-semibold text-xs shadow-2xs hover:bg-[#EAF5EF] transition cursor-pointer"
                >
                  <span>
                    {showAll
                      ? "Show Less"
                      : `View All Saved Addresses (${addresses.length})`}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      showAll ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Sticky "+ Add New Address" Button Bar */}
      <div className="fixed bottom-[76px] sm:bottom-6 left-0 right-0 z-30 px-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto p-2 bg-white/95 backdrop-blur-md rounded-full border border-[#0C3B2E]/15 shadow-xl">
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3.5 px-6 rounded-full bg-[#0C3B2E] hover:bg-[#145341] text-white flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-sm hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add New Address</span>
          </button>
        </div>
      </div>

      {/* Structured Add Address Modal with Pinned Save Button */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#0C3B2E]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#0C3B2E]/15 animate-scaleIn max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#0C3B2E]/10 pb-3.5 shrink-0">
              <h3 className="text-xl font-bold text-[#0C3B2E]">Add New Address</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0C3B2E] hover:bg-[#EAF5EF] flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Container */}
            <form onSubmit={handleSaveAddress} className="flex flex-col flex-1 overflow-hidden mt-4">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 no-scrollbar">
                {/* Address Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0C3B2E] uppercase tracking-wider">
                    Address Tag
                  </label>
                  <div className="flex gap-2">
                    {["Home", "Work", "Hostel", "Other"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTitle(t)}
                        className={`flex-1 py-2.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                          title === t
                            ? "bg-[#0C3B2E] text-white shadow-2xs"
                            : "bg-[#EAF5EF] text-[#0C3B2E] hover:bg-[#dceee4]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid Inputs for Modal */}
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
                      placeholder="e.g. Room 302, Hostel B or Flat 12A"
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
                      placeholder="e.g. Near Central Library / Opp. Admin Block"
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
                          Fetching...
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

              {/* Pinned Sticky Save Button Footer inside Modal */}
              <div className="pt-3.5 border-t border-[#0C3B2E]/10 flex gap-3 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-full bg-[#EAF5EF] text-[#0C3B2E] text-xs font-semibold hover:bg-[#dceee4] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-full bg-[#0C3B2E] hover:bg-[#145341] disabled:opacity-60 text-white text-xs font-bold shadow-2xs transition cursor-pointer"
                >
                  {saving ? "Saving..." : "SAVE ADDRESS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}