"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, MapPin, Search, Check } from "lucide-react";

interface LocationMapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  onConfirmLocation: (address: string, lat: number, lng: number) => void;
}

export default function LocationMapPicker({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialAddress,
  onConfirmLocation,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Default to Kalasalingam University / Krishnankoil TN (9.5303, 77.6775) if not provided
  const [lat, setLat] = useState<number>(initialLat || 9.5303);
  const [lng, setLng] = useState<number>(initialLng || 77.6775);
  const [address, setAddress] = useState<string>(initialAddress || "");
  const [houseDetail, setHouseDetail] = useState<string>("");
  const [geocoding, setGeocoding] = useState<boolean>(false);

  // Search autocomplete
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState<boolean>(false);

  // Load Leaflet dynamically
  useEffect(() => {
    if (!isOpen) return;

    // Check if Leaflet CSS is already injected
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      if (!mapContainerRef.current) return;
      const L = (window as any).L;
      if (!L) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map dragging end -> Reverse Geocode
      map.on("moveend", () => {
        const center = map.getCenter();
        const currentLat = center.lat;
        const currentLng = center.lng;
        setLat(currentLat);
        setLng(currentLng);
        reverseGeocode(currentLat, currentLng);
      });

      // Initial Reverse Geocode if no address set
      if (!address) {
        reverseGeocode(lat, lng);
      }
    };

    if ((window as any).L) {
      setTimeout(initMap, 100);
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setTimeout(initMap, 100);
      document.body.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
      }
    } catch (e) {
      setAddress(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=in&limit=5`
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const selectedLat = parseFloat(result.lat);
    const selectedLng = parseFloat(result.lon);

    setLat(selectedLat);
    setLng(selectedLng);
    setAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery("");

    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedLat, selectedLng], 17);
    }
  };

  const handleConfirm = () => {
    const fullAddress = houseDetail.trim()
      ? `${houseDetail.trim()}, ${address}`
      : address;
    onConfirmLocation(fullAddress, lat, lng);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Bar Header */}
      <div className="bg-white p-4 border-b border-[#E6E2D8] flex items-center justify-between z-20 shadow-md">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-[#EAF5EF] rounded-xl text-[#0C3B2E]">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-[#0C3B2E]">
              Select Delivery Location
            </h2>
            <p className="text-[11px] text-slate-500">Drag map to position pin directly</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 bg-slate-100 overflow-hidden">
        {/* Search Overlay Input */}
        <div className="absolute top-4 left-4 right-4 z-20 max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-[#E6E2D8] p-2 flex items-center space-x-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search college, landmark or city (e.g. Kalasalingam)"
              className="flex-1 bg-transparent text-xs font-medium text-[#0C3B2E] focus:outline-none"
            />
          </div>

          {/* Search Dropdown */}
          {searching && (
            <div className="mt-1 bg-white p-3 rounded-xl border border-[#E6E2D8] shadow-lg text-xs text-slate-500">
              Searching map locations...
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="mt-1 bg-white rounded-2xl border border-[#E6E2D8] shadow-2xl overflow-hidden divide-y max-h-48 overflow-y-auto">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left p-3 hover:bg-emerald-50 text-xs font-medium text-[#0C3B2E] flex items-start space-x-2 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{res.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Leaflet Map DOM Container */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Swiggy/Zomato Center Pin Overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none flex flex-col items-center">
          <div className="bg-[#0C3B2E] text-amber-300 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-xl border border-amber-300/40 whitespace-nowrap mb-1 animate-bounce">
            ORDER DELIVERING HERE
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-[#0C3B2E]/20 animate-ping absolute" />
            <MapPin className="w-10 h-10 text-[#0C3B2E] fill-amber-400 drop-shadow-md relative z-10" />
          </div>
          <div className="w-3 h-1.5 bg-black/40 rounded-full blur-[1px] mt-0.5" />
        </div>
      </div>

      {/* Bottom Sheet Address Confirmation Box */}
      <div className="bg-white p-4 sm:p-5 border-t border-[#E6E2D8] z-20 space-y-3 shadow-2xl rounded-t-3xl">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 bg-[#EAF5EF] text-[#0C3B2E] rounded-2xl shrink-0 mt-0.5">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Selected Location
              </span>
              {geocoding && (
                <span className="text-[10px] text-slate-400 animate-pulse">
                  Updating address...
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-[#0C3B2E] mt-1 line-clamp-2 leading-relaxed">
              {address || "Loading location details..."}
            </p>
          </div>
        </div>

        {/* House / Flat / Landmark input */}
        <input
          type="text"
          value={houseDetail}
          onChange={(e) => setHouseDetail(e.target.value)}
          placeholder="House / Flat / Hostel No., Floor, Landmark (Optional)"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
        />

        {/* Confirm Location Button */}
        <button
          onClick={handleConfirm}
          disabled={!address || geocoding}
          className="w-full py-3.5 rounded-2xl btn-emerald flex items-center justify-center space-x-2 font-bold text-xs sm:text-sm shadow-lg disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>CONFIRM LOCATION & PROCEED</span>
        </button>
      </div>
    </div>
  );
}
