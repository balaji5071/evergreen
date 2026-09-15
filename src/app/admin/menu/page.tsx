"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  X,
  Utensils,
} from "lucide-react";

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // null = create mode
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [available, setAvailable] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingItem, setSavingItem] = useState(false);

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const [resItems, resCats] = await Promise.all([
        fetch("/api/menu?all=true").then((r) => r.json()),
        fetch("/api/menu/categories?all=true").then((r) => r.json()),
      ]);
      setItems(resItems || []);
      setCategories(resCats || []);
      if (resCats?.length > 0 && !categoryId) setCategoryId(resCats[0]._id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // --- ITEM HANDLERS ---
  const openCreateItemModal = () => {
    setEditingItem(null);
    setName("");
    setDescription("");
    setPrice("");
    if (categories.length > 0) setCategoryId(categories[0]._id);
    setImageUrl("");
    setAvailable(true);
    setShowItemModal(true);
  };

  const openEditItemModal = (item: any) => {
    setEditingItem(item);
    setName(item.name || "");
    setDescription(item.description || "");
    setPrice(item.price?.toString() || "");
    setCategoryId(item.categoryId?._id || item.categoryId || (categories[0]?._id ?? ""));
    setImageUrl(item.imageUrl || "");
    setAvailable(item.available !== false);
    setShowItemModal(true);
  };

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
        alert("Image upload failed");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      alert("Please fill in Dish Name, Price, and Category");
      return;
    }

    setSavingItem(true);
    try {
      const payload = {
        name,
        description,
        price: Number(price),
        categoryId,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
        available,
      };

      let res;
      if (editingItem) {
        res = await fetch(`/api/menu/${editingItem._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowItemModal(false);
        fetchMenuData();
      } else {
        const errData = await res.json();
        alert(errData.message || "Failed to save dish");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while saving");
    } finally {
      setSavingItem(false);
    }
  };

  const handleToggleItemAvailability = async (item: any) => {
    try {
      const updatedStatus = !item.available;
      const res = await fetch(`/api/menu/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: updatedStatus }),
      });

      if (res.ok) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, available: updatedStatus } : i))
        );
      }
    } catch (err) {
      console.error("Failed to toggle item availability:", err);
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/menu/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i._id !== itemId));
      } else {
        alert("Failed to delete menu item");
      }
    } catch (err) {
      console.error("Delete item error:", err);
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "All" ||
      item.categoryId?._id === selectedCategory ||
      item.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#0C3B2E] flex items-center space-x-2">
            <Utensils className="w-6 h-6 text-amber-500" />
            <span>Menu Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Edit dishes, prices, and availability anytime
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openCreateItemModal}
            className="px-5 py-2.5 rounded-2xl btn-emerald text-xs font-extrabold flex items-center space-x-2 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Menu view */}
      <div className="flex items-center space-x-2 border-b border-[#E6E2D8] pb-1">
        <div className="px-5 py-2.5 rounded-2xl bg-[#0C3B2E] text-white shadow-md font-serif text-sm font-bold flex items-center space-x-2">
          <Utensils className="w-4 h-4" />
          <span>Dishes ({items.length})</span>
        </div>
      </div>

      {/* --- TAB 1: DISHES MANAGEMENT --- */}
      <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all 200+ dishes by name or ingredient..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
              <button
                onClick={() => setSelectedCategory("All")}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-[#0C3B2E] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 border border-[#E6E2D8]"
                }`}
              >
                All ({items.length})
              </button>
              {categories.map((c) => {
                const count = items.filter(
                  (i) => i.categoryId?._id === c._id || i.categoryId === c._id
                ).length;
                const isSel = selectedCategory === c._id;
                return (
                  <button
                    key={c._id}
                    onClick={() => setSelectedCategory(c._id)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      isSel
                        ? "bg-[#0C3B2E] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 border border-[#E6E2D8]"
                    }`}
                  >
                    {c.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-36 bg-slate-200 animate-pulse rounded-3xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#E6E2D8] space-y-2">
              <Utensils className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-serif text-lg font-bold text-[#0C3B2E]">No dishes found</p>
              <p className="text-xs text-slate-500">Try adjusting your search query or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className={`bg-white p-4 rounded-3xl border shadow-card-soft flex flex-col justify-between transition-all duration-200 relative ${
                    item.available
                      ? "border-[#E6E2D8]/80 opacity-100"
                      : "border-amber-300 bg-amber-50/20 opacity-80"
                  }`}
                >
                  <div className="flex space-x-3.5 items-start">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-[#E6E2D8]"
                    />
                    <div className="flex-1 min-w-0 pr-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="font-bold text-sm text-[#0C3B2E] truncate">{item.name}</h3>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                            item.available
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {item.available ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                        {item.description}
                      </p>
                      <p className="font-black text-base text-[#0C3B2E]">₹{item.price}</p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleItemAvailability(item)}
                      className={`text-[11px] font-extrabold flex items-center space-x-1 px-3 py-1 rounded-xl transition cursor-pointer ${
                        item.available
                          ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                          : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                      }`}
                    >
                      {item.available ? (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Mark Out of Stock</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark Available</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => openEditItemModal(item)}
                        className="p-2 rounded-xl bg-slate-100 text-[#0C3B2E] hover:bg-[#0C3B2E] hover:text-white transition cursor-pointer"
                        title="Edit Dish Details & Price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id, item.name)}
                        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      {/* --- ITEM EDIT / CREATE MODAL --- */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4 border border-[#E6E2D8] animate-scaleIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#0C3B2E]">
                {editingItem ? "Edit Dish Details" : "Add New Dish"}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Dish Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fresh cottage cheese in creamy tomato butter gravy..."
                  className="w-full p-3 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="180"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-[#E6E2D8]">
                <div>
                  <p className="text-xs font-bold text-[#0C3B2E]">Available for Ordering</p>
                  <p className="text-[10px] text-slate-500">
                    {available ? "Customers can see and order this dish" : "Hidden from customer menu"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAvailable(!available)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    available ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                  }`}
                >
                  {available ? "In Stock" : "Out of Stock"}
                </button>
              </div>

              {/* Image Upload Box */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Food Image</label>
                {imageUrl ? (
                  <div className="relative w-full h-32 rounded-2xl overflow-hidden border border-[#E6E2D8]">
                    <img src={imageUrl} alt="Uploaded" className="w-full h-full object-cover" />
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
                      {uploading ? "Uploading to Cloudinary..." : "Upload Food Image"}
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

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingItem || uploading}
                  className="flex-1 py-3 rounded-xl btn-emerald text-xs font-bold shadow-md cursor-pointer"
                >
                  {savingItem ? "Saving..." : editingItem ? "Update Dish" : "Create Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
