"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Plus,
  Trash2,
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

    if (!houseNo.trim() || !streetArea.trim() || !landmark.trim() || !pincode.trim() || !city.trim() || !state.trim()) {
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

  return (
    <div className="flex-1 flex flex-col pb-44 md:pb-32 bg-[#FAF8F5]">
      {/* Header Container */}
      <header className="bg-white border-b border-[#E6E2D8]/80 sticky top-[64px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className="p-2.5 rounded-2xl bg-white border border-[#E6E2D8] text-[#0C3B2E] hover:bg-slate-50 transition shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0C3B2E]">
                Saved Addresses
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Manage home, hostel, or office delivery destinations
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container - Max 7xl on desktop */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-28 bg-white/80 animate-pulse rounded-3xl border border-[#E6E2D8]"
              />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-20 space-y-3 bg-white rounded-3xl border border-[#E6E2D8] max-w-lg mx-auto shadow-card-soft p-8">
            <div className="w-16 h-16 rounded-full bg-[#EAF5EF] text-[#0C3B2E] flex items-center justify-center mx-auto text-2xl">
              📍
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0C3B2E]">No saved addresses</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Add your home, hostel, or office address for seamless 1-click checkout.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 rounded-2xl btn-emerald text-xs font-bold shadow-md cursor-pointer"
              >
                Add Your First Address
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(showAll ? addresses : addresses.slice(0, 1)).map((addr) => (
                <div
                  key={addr._id}
                  className="bg-white p-5 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft flex items-start justify-between space-x-4 hover:shadow-md transition"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 rounded-2xl bg-[#EAF5EF] text-[#0C3B2E] mt-0.5 shrink-0">
                      {addr.title === "Home" ? (
                        <Home className="w-5 h-5" />
                      ) : addr.title === "Work" ? (
                        <Briefcase className="w-5 h-5" />
                      ) : (
                        <Building className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-[#0C3B2E]">
                        {addr.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {addr.address}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {addresses.length > 1 && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white border border-[#E6E2D8] text-[#0C3B2E] font-bold text-xs shadow-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  <span>{showAll ? "Show Less" : `View All Saved Addresses (${addresses.length})`}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAll ? "rotate-180" : ""}`} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Swiggy/Zomato Style Floating Sticky "+ Add New Address" Button Bar */}
      <div className="fixed bottom-[68px] sm:bottom-6 left-0 right-0 z-30 px-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-lg pointer-events-auto p-2 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E6E2D8] shadow-2xl">
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3.5 rounded-xl btn-emerald flex items-center justify-center space-x-2 text-sm sm:text-base font-extrabold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>+ Add New Address</span>
          </button>
        </div>
      </div>

      {/* Structured Add Address Modal with Pinned Save Button */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-[#E6E2D8] animate-scaleIn max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E6E2D8]/60 pb-3 shrink-0">
              <h3 className="font-serif text-xl font-bold text-[#0C3B2E]">Add New Address</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Container */}
            <form onSubmit={handleSaveAddress} className="flex flex-col flex-1 overflow-hidden mt-4">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 no-scrollbar">
                {/* Address Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#0C3B2E] uppercase">
                    Address Tag
                  </label>
                  <div className="flex space-x-2">
                    {["Home", "Work", "Hostel", "Other"].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTitle(t)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                          title === t
                            ? "bg-[#0C3B2E] text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase flex items-center space-x-1.5">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span>House / Flat Number *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      placeholder="e.g. Room 302, Hostel B or Flat 12A"
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                    />
                  </div>

                  {/* Field 2: Street / Area * */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase flex items-center space-x-1.5">
                      <Navigation className="w-4 h-4 text-slate-400" />
                      <span>Street / Area *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={streetArea}
                      onChange={(e) => setStreetArea(e.target.value)}
                      placeholder="e.g. Kalasalingam University Campus or Main Road"
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                    />
                  </div>

                  {/* Field 3: Landmark * */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Landmark *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Central Library / Opp. Admin Block"
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                    />
                  </div>

                  {/* Pincode & City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase">
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
                        className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                      />
                      {pincodeLoading && (
                        <span className="absolute right-3 top-3 text-[10px] text-emerald-600 font-bold animate-pulse">
                          Fetching...
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Krishnankoil"
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-[#0C3B2E] uppercase">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-4 py-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                    />
                  </div>
                </div>
              </div>

              {/* Pinned Sticky Save Button Footer inside Modal (Swiggy/Zomato style) */}
              <div className="pt-3 border-t border-[#E6E2D8] flex space-x-3 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-2xl btn-emerald text-xs font-extrabold shadow-md cursor-pointer"
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
