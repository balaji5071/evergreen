"use client";

import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      setBanners(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64String }),
        });
        const data = await res.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        alert("Upload failed");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    setSaving(true);
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, imageUrl, active: true }),
      });

      if (res.ok) {
        setTitle("");
        setImageUrl("");
        fetchBanners();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[#0C3B2E]">Promotional Banners</h2>
        <p className="text-xs text-slate-500">Manage hero slider cards & offers</p>
      </div>

      {/* Add Form */}
      <form
        onSubmit={handleAddBanner}
        className="bg-white p-5 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-3"
      >
        <h3 className="font-serif text-base font-bold text-[#0C3B2E]">Add Banner</h3>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Banner Title (e.g. Free Chai Deal)"
          className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
        />

        <div className="space-y-1">
          {imageUrl ? (
            <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-[#E6E2D8]">
              <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-[#E6E2D8] hover:border-[#0C3B2E] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 transition">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-[#0C3B2E]">
                {uploading ? "Uploading Image..." : "Upload Banner Image"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="px-5 py-2.5 rounded-xl btn-emerald text-xs font-bold shadow-md"
        >
          {saving ? "Saving..." : "Create Banner"}
        </button>
      </form>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((b) => (
          <div
            key={b._id}
            className="bg-white p-4 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-2"
          >
            <img src={b.imageUrl} alt={b.title} className="w-full h-32 rounded-2xl object-cover" />
            <h4 className="font-bold text-sm text-[#0C3B2E]">{b.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
}
