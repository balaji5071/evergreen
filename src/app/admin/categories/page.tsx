"use client";

import React, { useEffect, useState } from "react";
import { Plus, Tag, Edit3, Trash2, CheckCircle2, XCircle, Search, X, FolderTree } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCat, setEditingCat] = useState<any>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchCategoriesAndItems = async () => {
    setLoading(true);
    try {
      const [resCats, resItems] = await Promise.all([
        fetch("/api/menu/categories?all=true").then((r) => r.json()),
        fetch("/api/menu?all=true").then((r) => r.json()),
      ]);
      setCategories(resCats || []);
      setItems(resItems || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesAndItems();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/menu/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });

      if (res.ok) {
        setName("");
        setDescription("");
        fetchCategoriesAndItems();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to create category");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (cat: any) => {
    setEditingCat(cat);
    setEditName(cat.name || "");
    setEditDescription(cat.description || "");
    setEditActive(cat.active !== false);
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName || !editName.trim()) return;

    setSavingEdit(true);
    try {
      const res = await fetch(`/api/menu/categories/${editingCat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          description: editDescription,
          active: editActive,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchCategoriesAndItems();
      } else {
        const err = await res.json();
        alert(err.message || "Failed to update category");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update category");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleActive = async (cat: any) => {
    try {
      const updatedStatus = !cat.active;
      const res = await fetch(`/api/menu/categories/${cat._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedStatus }),
      });

      if (res.ok) {
        setCategories((prev) =>
          prev.map((c) => (c._id === cat._id ? { ...c, active: updatedStatus } : c))
        );
      }
    } catch (err) {
      console.error("Failed to toggle category status:", err);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/menu/categories/${catId}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c._id !== catId));
      } else {
        const err = await res.json();
        alert(err.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#0C3B2E] flex items-center space-x-2">
            <FolderTree className="w-6 h-6 text-amber-500" />
            <span>Menu Categories</span>
          </h2>
          <p className="text-xs text-slate-500">Organize dishes into category groupings</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E6E2D8] bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
        </div>
      </div>

      {/* Add New Category Card */}
      <form
        onSubmit={handleAddCategory}
        className="bg-white p-5 rounded-3xl border border-[#E6E2D8]/80 shadow-card-soft space-y-4"
      >
        <h3 className="font-serif text-base font-bold text-[#0C3B2E]">Add New Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category Name (e.g. Desserts)"
            className="px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description..."
            className="px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl btn-emerald text-xs font-extrabold shadow-md cursor-pointer flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{saving ? "Creating..." : "Create Category"}</span>
          </button>
        </div>
      </form>

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-28 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-[#E6E2D8]">
          <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-sm text-[#0C3B2E]">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const itemCount = items.filter(
              (i) => i.categoryId?._id === cat._id || i.categoryId === cat._id
            ).length;

            return (
              <div
                key={cat._id}
                className={`bg-white p-4 rounded-2xl border shadow-card-soft space-y-3 flex flex-col justify-between transition ${
                  cat.active !== false
                    ? "border-[#E6E2D8]/80"
                    : "border-amber-300 bg-amber-50/20"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-base text-[#0C3B2E]">{cat.name}</h4>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        cat.active !== false
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {cat.active !== false ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {cat.description || "No description"}
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400 mt-2">
                    {itemCount} {itemCount === 1 ? "dish" : "dishes"} assigned
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-xl transition cursor-pointer ${
                      cat.active !== false
                        ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                        : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                    }`}
                  >
                    {cat.active !== false ? "Deactivate" : "Activate"}
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg bg-slate-100 text-[#0C3B2E] hover:bg-[#0C3B2E] hover:text-white transition cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 border border-[#E6E2D8] animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-[#0C3B2E]">Edit Category</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Category Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#0C3B2E] uppercase">Description</label>
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Short description..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6E2D8] bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C3B2E]"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-[#E6E2D8]">
                <div>
                  <p className="text-xs font-bold text-[#0C3B2E]">Status</p>
                  <p className="text-[10px] text-slate-500">
                    {editActive ? "Visible on customer menu" : "Hidden from customer menu"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActive(!editActive)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    editActive ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}
                >
                  {editActive ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 rounded-xl btn-emerald text-xs font-bold shadow-md"
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
