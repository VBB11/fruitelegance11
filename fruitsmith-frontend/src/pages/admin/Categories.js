// src/pages/admin/Categories.js
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import {
  FaPlus,
  FaTrash,
  FaSpinner,
  FaInfoCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaEye, // New icon for 'Active' status
  FaEyeSlash, // New icon for 'Inactive' status
} from "react-icons/fa";
import config from "../config/config";

// --- Configuration ---
const BG_PRESETS = [
  { name: "Yellow", value: "bg-yellow-100", ring: "ring-yellow-500" },
  { name: "Orange", value: "bg-orange-100", ring: "ring-orange-500" },
  { name: "Amber", value: "bg-amber-100", ring: "ring-amber-500" },
  { name: "Pink", value: "bg-pink-100", ring: "ring-pink-500" },
  { name: "Green", value: "bg-green-100", ring: "ring-green-500" },
  { name: "Purple", value: "bg-purple-100", ring: "ring-purple-500" },
];
const DEFAULT_BG = BG_PRESETS[4]; // Green

function autoSlug(name) {
  return (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// --- Component Start ---
function Categories() {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // Create form initial state
  const initialFormState = {
    name: "",
    slug: "",
    image: "",
    bg: DEFAULT_BG.value,
    active: true,
    sortOrder: "",
  };
  const [form, setForm] = useState(initialFormState);

  // Edit row state
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState(initialFormState);

  // --- Data Fetching ---
  useEffect(() => {
    async function fetchCategories() {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${config.backendUrl}/api/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cats = Array.isArray(res.data) ? res.data : res.data.categories || [];
        const sorted = [...cats].sort(
          (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)
        );
        setCategories(sorted);
      } catch (err) {
        setError(
          "Failed to fetch categories. Please check network, API, and admin permissions."
        );
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, [token]);

  // --- Handlers ---
  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setForm((f) => {
      let nextState = { ...f, [name]: newValue };
      if (name === "name") {
        // Auto-fill slug if user hasn't typed a custom one yet
        if (f.slug === '' || f.slug === autoSlug(f.name)) {
            nextState.slug = autoSlug(value);
        }
      }
      return nextState;
    });
  }
  
  // Create handlers
  async function handleAddCategory(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Category name cannot be empty.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: form.name.trim(),
        slug: (form.slug || autoSlug(form.name)).trim(),
        image: form.image || "",
        bg: form.bg || DEFAULT_BG.value,
        active: !!form.active,
        sortOrder:
          form.sortOrder !== "" && !isNaN(Number(form.sortOrder))
            ? Number(form.sortOrder)
            : categories.length + 1,
      };

      const res = await axios.post(
        `${config.backendUrl}/api/admin/categories`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const saved = res?.data || payload;
      const next = [...categories, saved].sort(
        (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)
      );
      setCategories(next);

      // Reset form
      setForm(initialFormState);
      setError('Category added successfully!');
      setTimeout(() => setError(''), 3000); // Clear success message
      
    } catch (err) {
      setError(
        "Failed to add category. Ensure admin role and API validity."
      );
    } finally {
      setLoading(false);
    }
  }

  // Delete
  async function deleteCategory(id) {
    if (
      !window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }
    setSavingId(id);
    try {
      await axios.delete(`${config.backendUrl}/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((cat) => (cat._id || cat.id) !== id));
      setError("Category deleted successfully!");
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError(
        "Failed to delete category. It might be referenced by products or you lack permissions."
      );
    } finally {
      setSavingId(null);
    }
  }

  // Begin edit
  function startEdit(cat) {
    setEditId(cat._id || cat.id);
    setEdit({
      name: cat.name || "",
      slug: cat.slug || autoSlug(cat.name || ""),
      image: cat.image || "",
      bg: cat.bg || DEFAULT_BG.value,
      active: cat.active !== undefined ? !!cat.active : true,
      sortOrder:
        cat.sortOrder !== undefined && cat.sortOrder !== null
          ? String(cat.sortOrder)
          : "",
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEdit(initialFormState);
  }

  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    
    setEdit((s) => {
      let nextState = { ...s, [name]: newValue };
      if (name === "name") {
        if (s.slug === '' || s.slug === autoSlug(s.name)) {
            nextState.slug = autoSlug(value);
        }
      }
      return nextState;
    });
  }

  // Save edit
  async function saveEdit() {
    if (!editId || !edit.name.trim()) return;
    setSavingId(editId);
    setError("");
    try {
      const payload = {
        name: edit.name.trim(),
        slug: (edit.slug || autoSlug(edit.name)).trim(),
        image: edit.image || "",
        bg: edit.bg || DEFAULT_BG.value,
        active: !!edit.active,
        sortOrder:
          edit.sortOrder !== "" && !isNaN(Number(edit.sortOrder))
            ? Number(edit.sortOrder)
            : undefined,
      };

      const res = await axios.put(
        `${config.backendUrl}/api/admin/categories/${editId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updated = res?.data || { ...(categories.find(c => (c._id || c.id) === editId) || {}), ...payload, _id: editId };

      const next = categories
        .map((c) => ((c._id || c.id) === editId ? updated : c))
        .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
      setCategories(next);
      cancelEdit();
      setError('Category updated successfully!');
      setTimeout(() => setError(''), 3000);

    } catch (err) {
      setError("Failed to update category. Check API and permissions.");
    } finally {
      setSavingId(null);
    }
  }

  // --- JSX Rendering ---
  return (
    // Removed AdminLayout wrapper
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          Category Management
        </h1>

        {/* Error/Success Message Block */}
        {error && (
            <div 
              className={`border-l-4 p-4 mb-6 rounded-md flex items-center ${
                error.includes('successfully') 
                  ? 'bg-green-100 border-green-500 text-green-700' 
                  : 'bg-red-100 border-red-500 text-red-700'
              }`}
            >
              <FaInfoCircle className="mr-3 text-lg flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}

        {/* --- 1. ADD NEW CATEGORY SECTION --- */}
        <div className="mb-10 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaPlus /> Add New Category
            </h2>
          <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Name Input */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                name="name"
                type="text"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                placeholder="e.g. Tropical Fruits"
                value={form.name}
                onChange={handleFormChange}
                required
                disabled={loading}
              />
            </div>

            {/* Slug Input */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
              <input
                name="slug"
                type="text"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                placeholder={autoSlug(form.name) || "auto-generated"}
                value={form.slug}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            {/* Image URL Input */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                name="image"
                type="url"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                placeholder="https://..."
                value={form.image}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>
            
            {/* Sort Order Input */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                name="sortOrder"
                type="number"
                min="0"
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 transition"
                placeholder={`Next: ${categories.length + 1}`}
                value={form.sortOrder}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>
            
            {/* Background Picker (Visual Swatches) */}
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg bg-white">
                {BG_PRESETS.map((bg) => (
                  <div
                    key={bg.value}
                    title={bg.name}
                    className={`h-8 w-8 rounded-full cursor-pointer transition ${bg.value} ${form.bg === bg.value ? `ring-4 ${bg.ring} ring-offset-2` : ''}`}
                    onClick={() => !loading && setForm(f => ({ ...f, bg: bg.value }))}
                  />
                ))}
              </div>
            </div>

            {/* Active Toggle & Submit */}
            <div className="md:col-span-2 lg:col-span-2 flex items-end justify-between">
              
              {/* Active Toggle Switch */}
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">Visibility</label>
                <div 
                    className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${form.active ? 'bg-green-600' : 'bg-gray-300'}`}
                    onClick={() => !loading && setForm(f => ({ ...f, active: !f.active }))}
                    aria-checked={form.active}
                    role="switch"
                >
                    <div 
                        className={`absolute h-6 w-6 rounded-full bg-white shadow-md transition transform ${form.active ? 'translate-x-6' : 'translate-x-0'}`}
                    >
                        {form.active ? <FaEye className="m-1 text-green-600" /> : <FaEyeSlash className="m-1 text-gray-400" />}
                    </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
                {loading ? "Adding..." : "Add Category"}
              </button>
            </div>
          </form>
        </div>


        {/* --- 2. CATEGORY LIST SECTION --- */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Category List</h2>

          {loading && categories.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <FaSpinner className="animate-spin mr-3 text-3xl" /> Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No categories found. Use the form above to add one.
            </div>
          ) : (
            <div className="rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {categories.map((cat) => {
                  const id = cat._id || cat.id;
                  const inEdit = editId === id;
                  const currentBg = BG_PRESETS.find(p => p.value === (cat.bg || DEFAULT_BG.value)) || DEFAULT_BG;

                  if (inEdit) {
                    return (
                      <li key={id} className="p-5 bg-yellow-50 border-l-4 border-yellow-500">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          
                          {/* Name/Slug */}
                          <div className="col-span-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              name="name"
                              type="text"
                              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-yellow-500"
                              value={edit.name}
                              onChange={handleEditChange}
                            />
                             <label className="block text-sm font-medium text-gray-500 mt-2 mb-1">Slug</label>
                            <input
                              name="slug"
                              type="text"
                              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-yellow-500"
                              value={edit.slug}
                              onChange={handleEditChange}
                            />
                          </div>
                          
                          {/* Image URL / Sort Order */}
                          <div className="col-span-2 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                              name="image"
                              type="url"
                              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-yellow-500"
                              value={edit.image}
                              onChange={handleEditChange}
                            />
                            <label className="block text-sm font-medium text-gray-700 mt-2 mb-1">Sort Order</label>
                            <input
                              name="sortOrder"
                              type="number"
                              min="0"
                              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-yellow-500"
                              value={edit.sortOrder}
                              onChange={handleEditChange}
                            />
                          </div>

                          {/* Background Picker & Active Toggle */}
                          <div className="col-span-2 md:col-span-4 flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center space-x-3">
                              <label className="text-sm font-medium text-gray-700">Visibility</label>
                              <div 
                                  className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${edit.active ? 'bg-green-600' : 'bg-gray-300'}`}
                                  onClick={() => setEdit(s => ({ ...s, active: !s.active }))}
                                  aria-checked={edit.active}
                                  role="switch"
                              >
                                  <div 
                                      className={`absolute h-6 w-6 rounded-full bg-white shadow-md transition transform ${edit.active ? 'translate-x-6' : 'translate-x-0'}`}
                                  >
                                      {edit.active ? <FaEye className="m-1 text-green-600" /> : <FaEyeSlash className="m-1 text-gray-400" />}
                                  </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">Background:</label>
                                {BG_PRESETS.map((bg) => (
                                <div
                                    key={bg.value}
                                    title={bg.name}
                                    className={`h-8 w-8 rounded-full cursor-pointer transition ${bg.value} ${edit.bg === bg.value ? `ring-4 ${bg.ring} ring-offset-2` : ''}`}
                                    onClick={() => setEdit(s => ({ ...s, bg: bg.value }))}
                                />
                                ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4">
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-lg border border-gray-400 text-gray-700 bg-white hover:bg-gray-100 flex items-center font-medium"
                          >
                            <FaTimes className="mr-2" /> Cancel
                          </button>
                          <button
                            onClick={saveEdit}
                            disabled={savingId === id || !edit.name.trim()}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center font-medium"
                          >
                            {savingId === id ? (
                              <FaSpinner className="animate-spin mr-2" />
                            ) : (
                              <FaSave className="mr-2" />
                            )}
                            Save Changes
                          </button>
                        </div>
                      </li>
                    );
                  }

                  // Normal View Row
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Image/Background */}
                        <div className={`h-12 w-12 rounded-lg object-contain border p-0.5 shadow-sm flex-shrink-0 ${currentBg.value}`}>
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="h-full w-full rounded-md object-contain"
                            />
                          ) : (
                            <div className="h-full w-full rounded-md bg-white border border-dashed" />
                          )}
                        </div>
                        
                        {/* Details */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="capitalize text-lg text-gray-900 font-bold">
                              {cat.name}
                            </span>
                            <span className="text-sm text-gray-500 font-mono">/{cat.slug}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm">
                            <span
                              className={`px-2 py-0.5 rounded-full font-medium ${
                                cat.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {cat.active ? "Visible" : "Hidden"}
                            </span>
                            <span className="text-gray-500 border-l pl-3">Sort: {cat.sortOrder ?? "-"}</span>
                            <span className="text-gray-500 border-l pl-3">BG: {currentBg.name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {savingId === id ? (
                            <FaSpinner className="animate-spin text-xl text-green-500 mr-2" />
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(cat)}
                              className="text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors"
                              title="Edit Category"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteCategory(id)}
                              className="text-red-500 p-2 rounded-full hover:bg-red-100 transition-colors"
                              title="Delete Category"
                            >
                              <FaTrash />
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    // Removed AdminLayout wrapper end
  );
}

export default Categories;