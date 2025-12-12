// src/pages/admin/Banners.js
import React, { useEffect, useState, useContext } from "react";
// Removed AdminLayout import
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
  FaEye, // For Active toggle
  FaEyeSlash, // For Inactive toggle
  FaImage, // For Image URL input
  FaCalendarAlt, // For Start/End At
} from "react-icons/fa";
import config from "../config/config";

// --- Date/Time Utility Functions (Optimized for modern JS and JSX) ---

// Converts date/time to yyyy-MM-ddTHH:mm format for input[type=datetime-local]
function toISOStringOrEmpty(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${y}-${m}-${day}T${hh}:${mm}`;
  } catch {
    return "";
  }
}

// Converts datetime-local string back to ISO string for API payload
function fromLocalToISO(local) {
  if (!local) return null;
  const d = new Date(local);
  // Ensure the date is treated as local time when converted to ISO for consistency
  return isNaN(d.getTime()) ? null : d.toISOString(); 
}

// Helper to determine the status color/label for time scheduling
function getScheduleStatus(startAt, endAt) {
  const now = new Date();
  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;

  if (start && start > now) {
    return { color: 'bg-blue-100 text-blue-700', label: 'Scheduled' };
  }
  if (end && end < now) {
    return { color: 'bg-red-100 text-red-700', label: 'Expired' };
  }
  if (start || end) {
    return { color: 'bg-yellow-100 text-yellow-700', label: 'Running' };
  }
  return { color: 'bg-gray-100 text-gray-700', label: 'Permanent' };
}

// --- Component Start ---
function Banners() {
  const { token } = useContext(AuthContext);

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  
  // Initial state structure (Moved outside for clean reset)
  const initialFormState = {
    title: "",
    label: "",
    img: "",
    link: "",
    categoryId: "",
    active: true,
    sortOrder: "",
    startAt: "",
    endAt: "",
  };

  // Create form
  const [form, setForm] = useState(initialFormState);

  // Edit state
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState(initialFormState);

  // Load initial data
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      setError("");
      try {
        // Load banners
        const res = await axios.get(`${config.backendUrl}/api/admin/banners`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = Array.isArray(res.data) ? res.data : res.data.banners || [];
        const sorted = [...list].sort(
          (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)
        );
        setBanners(sorted);

        // Load categories concurrently or after banners if needed
        const catRes = await axios.get(`${config.backendUrl}/api/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data.categories || [];
        const sortedCats = [...cats].sort(
          (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)
        );
        setCategories(sortedCats);

      } catch (e) {
        setError("Failed to fetch initial data (Banners or Categories). Check API and permissions.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // --- Handlers ---

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.img.trim()) {
      setError("Image URL is required for a banner.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        title: form.title || "",
        label: form.label || "",
        img: form.img || "",
        link: form.link || "",
        categoryId: form.categoryId || null,
        active: !!form.active,
        sortOrder:
          form.sortOrder !== "" && !isNaN(Number(form.sortOrder))
            ? Number(form.sortOrder)
            : banners.length + 1,
        startAt: fromLocalToISO(form.startAt),
        endAt: fromLocalToISO(form.endAt),
      };

      const res = await axios.post(
        `${config.backendUrl}/api/admin/banners`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const saved = res?.data || payload;
      const next = [...banners, saved].sort(
        (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)
      );
      setBanners(next);

      setForm(initialFormState);
      setError('Banner created successfully!');
      setTimeout(() => setError(''), 3000);
      
    } catch (err) {
      setError(
        "Failed to create banner. Ensure admin role and that backend accepts these fields."
      );
    } finally {
      setLoading(false);
    }
  }

  function startEdit(b) {
    const id = b._id || b.id;
    setEditId(id);
    setEdit({
      title: b.title || "",
      label: b.label || "",
      img: b.img || b.imageUrl || "",
      link: b.link || "",
      categoryId: b.categoryId || "",
      active: b.active !== undefined ? !!b.active : true,
      sortOrder:
        b.sortOrder !== undefined && b.sortOrder !== null ? String(b.sortOrder) : "",
      startAt: toISOStringOrEmpty(b.startAt),
      endAt: toISOStringOrEmpty(b.endAt),
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEdit(initialFormState);
  }

  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;
    setEdit((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  async function saveEdit() {
    if (!editId || !edit.img.trim()) return;
    setSavingId(editId);
    setError("");
    try {
      const payload = {
        title: edit.title || "",
        label: edit.label || "",
        img: edit.img || "",
        link: edit.link || "",
        categoryId: edit.categoryId || null,
        active: !!edit.active,
        sortOrder:
          edit.sortOrder !== "" && !isNaN(Number(edit.sortOrder))
            ? Number(edit.sortOrder)
            : undefined,
        startAt: fromLocalToISO(edit.startAt),
        endAt: fromLocalToISO(edit.endAt),
      };

      const res = await axios.put(
        `${config.backendUrl}/api/admin/banners/${editId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated =
        res?.data ||
        {
          ...(banners.find((x) => (x._id || x.id) === editId) || {}),
          ...payload,
          _id: editId,
        };

      const next = banners
        .map((b) => ((b._id || b.id) === editId ? updated : b))
        .sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));
      setBanners(next);
      cancelEdit();
      setError('Banner updated successfully!');
      setTimeout(() => setError(''), 3000);

    } catch (err) {
      setError("Failed to update banner. Check API and permissions.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteBanner(id) {
    if (!window.confirm("Delete this banner? This action cannot be undone.")) {
      return;
    }
    setSavingId(id);
    try {
      await axios.delete(`${config.backendUrl}/api/admin/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners((prev) => prev.filter((b) => (b._id || b.id) !== id));
      setError('Banner deleted successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError(
        "Failed to delete banner. Check API permissions or references."
      );
    } finally {
      setSavingId(null);
    }
  }

  // --- JSX Rendering ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 border-b pb-4">
          Banner Management & Scheduling
        </h1>

        {/* Error/Success Message Block */}
        {error && (
            <div 
              className={`border-l-4 p-4 mb-6 rounded-md flex items-start ${
                error.includes('successfully') 
                  ? 'bg-green-100 border-green-500 text-green-700' 
                  : 'bg-red-100 border-red-500 text-red-700'
              }`}
            >
              <FaInfoCircle className="mr-3 text-lg flex-shrink-0 mt-1" />
              <p className="font-medium">{error}</p>
            </div>
        )}

        {/* --- 1. CREATE NEW BANNER FORM --- */}
        <div className="mb-10 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaPlus /> Create New Banner
            </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Left Column: Core Data */}
            <div className="md:col-span-1 lg:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    name="title"
                    type="text"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. Summer Sale"
                    value={form.title}
                    onChange={handleFormChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Label (CTA Text)</label>
                  <input
                    name="label"
                    type="text"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Shop Now"
                    value={form.label}
                    onChange={handleFormChange}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link (URL/Path)</label>
                  <input
                    name="link"
                    type="text"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="/category/sale or http://..."
                    value={form.link}
                    onChange={handleFormChange}
                    disabled={loading}
                  />
                </div>
            </div>

            {/* Middle Column: Image, Sort, Category */}
            <div className="md:col-span-1 lg:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                  <div className="relative">
                    <input
                      name="img"
                      type="url"
                      className="w-full border border-gray-300 p-2.5 rounded-lg pl-10 focus:ring-2 focus:ring-green-500"
                      placeholder="https://..."
                      value={form.img}
                      onChange={handleFormChange}
                      disabled={loading}
                      required
                    />
                    <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                        <input
                            name="sortOrder"
                            type="number"
                            min="0"
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
                            placeholder={`e.g. ${banners.length + 1}`}
                            value={form.sortOrder}
                            onChange={handleFormChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Active</label>
                        {/* Active Toggle Switch */}
                        <div className="flex items-center pt-2">
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
                    </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Category</label>
                  <select
                    name="categoryId"
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={form.categoryId}
                    onChange={handleFormChange}
                    disabled={loading || categories.length === 0}
                  >
                    <option value="">None / Global</option>
                    {categories.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>
                        {c.name} {c.slug ? `(/${c.slug})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
            </div>

            {/* Right Column: Preview and Scheduling */}
            <div className="md:col-span-2 lg:col-span-1 space-y-4">
                {/* Image Preview */}
                <div className="border border-gray-300 rounded-lg overflow-hidden h-40 flex items-center justify-center bg-gray-100">
                    {form.img ? (
                        <img 
                            src={form.img} 
                            alt="Banner Preview" 
                            className="w-full h-full object-cover" 
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x150?text=Invalid+Image+URL"; }}
                        />
                    ) : (
                        <span className="text-gray-500 text-sm">Banner Image Preview</span>
                    )}
                </div>

                {/* Scheduling Inputs */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <FaCalendarAlt /> Scheduling
                    </label>
                    <div className="flex gap-2">
                        <input
                            name="startAt"
                            type="datetime-local"
                            className="w-1/2 border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                            value={form.startAt}
                            onChange={handleFormChange}
                            disabled={loading}
                            aria-label="Start Date and Time"
                        />
                        <input
                            name="endAt"
                            type="datetime-local"
                            className="w-1/2 border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                            value={form.endAt}
                            onChange={handleFormChange}
                            disabled={loading}
                            aria-label="End Date and Time"
                        />
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">Start Date and End Date (optional)</span>
                </div>
                
                {/* Submit Button - Moved for better flow */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
                        {loading ? "Creating..." : "Create Banner"}
                    </button>
                </div>
            </div>
          </form>
        </div>

        {/* --- 2. BANNER LIST SECTION --- */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Active Banners ({banners.length})</h2>

          {loading && banners.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <FaSpinner className="animate-spin mr-3 text-3xl" /> Loading banners...
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                No banners found. Use the form above to create one.
            </div>
          ) : (
            <div className="rounded-lg shadow-xl border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {banners.map((b) => {
                  const id = b._id || b.id;
                  const inEdit = editId === id;
                  const bannerImage = b.img || b.imageUrl;
                  const categoryName = categories.find(c => (c._id || c.id) === b.categoryId)?.name;
                  const schedule = getScheduleStatus(b.startAt, b.endAt);

                  if (inEdit) {
                    return (
                      <li key={id} className="p-5 bg-yellow-50 border-l-4 border-yellow-500">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Editing: {b.title || '(No Title)'}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* 1st Column */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input name="title" type="text" className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-yellow-500" value={edit.title} onChange={handleEditChange} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Label (CTA)</label>
                            <input name="label" type="text" className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-yellow-500" value={edit.label} onChange={handleEditChange} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input name="img" type="url" className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-yellow-500" value={edit.img} onChange={handleEditChange} />
                          </div>
                          {/* 2nd Column */}
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                            <input name="link" type="text" className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-yellow-500" value={edit.link} onChange={handleEditChange} />
                          </div>
                          <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                <input name="sortOrder" type="number" min="0" className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-yellow-500" value={edit.sortOrder} onChange={handleEditChange} />
                            </div>
                            <div className="w-1/2 flex items-center pt-2 gap-3">
                                <label className="text-sm font-medium text-gray-700">Active</label>
                                {/* Active Toggle Switch */}
                                <div 
                                    className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${edit.active ? 'bg-green-600' : 'bg-gray-300'}`}
                                    onClick={() => setEdit(s => ({ ...s, active: !s.active }))}
                                >
                                    <div 
                                        className={`absolute h-6 w-6 rounded-full bg-white shadow-md transition transform ${edit.active ? 'translate-x-6' : 'translate-x-0'}`}
                                    >
                                        {edit.active ? <FaEye className="m-1 text-green-600" /> : <FaEyeSlash className="m-1 text-gray-400" />}
                                    </div>
                                </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select name="categoryId" className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-yellow-500" value={edit.categoryId} onChange={handleEditChange}>
                              <option value="">None</option>
                              {categories.map((c) => (
                                <option key={c._id || c.id} value={c._id || c.id}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {/* 3rd Column */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start At</label>
                            <input name="startAt" type="datetime-local" className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-yellow-500" value={edit.startAt} onChange={handleEditChange} />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End At</label>
                            <input name="endAt" type="datetime-local" className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-yellow-500" value={edit.endAt} onChange={handleEditChange} />
                          </div>
                          {/* Image Preview (Edit Mode) */}
                          <div className="lg:col-span-1 border border-gray-300 rounded-lg overflow-hidden h-32 flex items-center justify-center bg-gray-100">
                                {edit.img ? (
                                    <img 
                                        src={edit.img} 
                                        alt="Edit Banner Preview" 
                                        className="w-full h-full object-cover" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x150?text=Invalid+Image+URL"; }}
                                    />
                                ) : (
                                    <span className="text-gray-500 text-sm">No Image</span>
                                )}
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
                            disabled={savingId === id || !edit.img.trim()}
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
                      <div className="flex items-start gap-4">
                        {/* Image Preview */}
                        <div className="flex-shrink-0">
                          {bannerImage ? (
                            <img
                              src={bannerImage}
                              alt={b.title || "Banner"}
                              className="h-16 w-32 rounded-lg object-cover bg-gray-100 border shadow-md"
                              onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/128x64?text=Error"; }}
                            />
                          ) : (
                            <div className="h-16 w-32 rounded-md border bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Image</div>
                          )}
                        </div>
                        
                        {/* Details */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl text-gray-900 font-bold">
                              {b.title || "(Untitled Banner)"}
                            </span>
                            {b.label && (
                              <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-700 text-white">
                                CTA: {b.label}
                              </span>
                            )}
                          </div>
                          
                          {/* Metadata & Status */}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                            {/* Active/Inactive Status */}
                            <span
                              className={`px-3 py-1 rounded-full font-medium ${
                                b.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {b.active ? "Visible" : "Hidden"}
                            </span>
                            
                            {/* Scheduling Status */}
                            <span className={`px-3 py-1 rounded-full font-medium ${schedule.color}`}>
                                {schedule.label}
                            </span>
                            
                            {/* Sort Order */}
                            <span className="text-gray-600 border-l pl-3">Sort: {b.sortOrder ?? "-"}</span>
                            
                            {/* Category Assignment */}
                            <span className="text-blue-600 border-l pl-3">
                              {categoryName || "Global"}
                            </span>
                          </div>
                          
                          {/* Link and Dates (Less prominent) */}
                          <div className="text-xs text-gray-500 mt-2">
                             Link: <span className="font-mono break-all">{b.link || '—'}</span>
                          </div>
                          {(b.startAt || b.endAt) && (
                            <div className="text-xs text-gray-500 mt-1">
                              {b.startAt ? `From: ${new Date(b.startAt).toLocaleString()}` : "From: —"}{" "}
                              | {b.endAt ? `To: ${new Date(b.endAt).toLocaleString()}` : "To: —"}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1">
                        {savingId === id ? (
                            <FaSpinner className="animate-spin text-xl text-green-500 mr-2" />
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(b)}
                              className="text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors"
                              title="Edit Banner"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => deleteBanner(id)}
                              className="text-red-500 p-2 rounded-full hover:bg-red-100 transition-colors"
                              title="Delete Banner"
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

export default Banners;