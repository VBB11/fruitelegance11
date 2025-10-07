// src/pages/admin/Categories.js
import React, { useState, useEffect, useContext } from "react";
import AdminLayout from "../../components/AdminLayout";
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
} from "react-icons/fa";
import config from "../config/config";

const BG_PRESETS = [
  "bg-yellow-50",
  "bg-orange-50",
  "bg-amber-50",
  "bg-pink-50",
  "bg-green-50",
  "bg-purple-50",
];

function autoSlug(name) {
  return (name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function Categories() {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // Create form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    image: "",
    bg: "bg-green-50",
    active: true,
    sortOrder: "",
  });

  // Edit row state
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({
    name: "",
    slug: "",
    image: "",
    bg: "bg-green-50",
    active: true,
    sortOrder: "",
  });

  // Fetch categories
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

  // Create handlers
  function handleFormChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => {
      if (name === "name") {
        // Auto-fill slug if user hasn't typed a custom one yet
        const next = { ...f, name: value };
        if (!f.slug) next.slug = autoSlug(value);
        return next;
      }
      return { ...f, [name]: type === "checkbox" ? checked : value };
    });
  }

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
        bg: form.bg || "bg-green-50",
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
      setForm({
        name: "",
        slug: "",
        image: "",
        bg: "bg-green-50",
        active: true,
        sortOrder: "",
      });
    } catch (err) {
      setError(
        "Failed to add category. Ensure admin role and API validity. If backend only accepts name now, add name-only category and edit later."
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
    try {
      await axios.delete(`${config.backendUrl}/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((cat) => (cat._id || cat.id) !== id));
      setError("");
    } catch (err) {
      setError(
        "Failed to delete category. It might be referenced by products or you lack permissions."
      );
    }
  }

  // Begin edit
  function startEdit(cat) {
    setEditId(cat._id || cat.id);
    setEdit({
      name: cat.name || "",
      slug: cat.slug || autoSlug(cat.name || ""),
      image: cat.image || "",
      bg: cat.bg || "bg-green-50",
      active: cat.active !== undefined ? !!cat.active : true,
      sortOrder:
        cat.sortOrder !== undefined && cat.sortOrder !== null
          ? String(cat.sortOrder)
          : "",
    });
  }

  function cancelEdit() {
    setEditId(null);
    setEdit({
      name: "",
      slug: "",
      image: "",
      bg: "bg-green-50",
      active: true,
      sortOrder: "",
    });
  }

  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;
    setEdit((s) => {
      if (name === "name") {
        const next = { ...s, name: value };
        if (!s.slug) next.slug = autoSlug(value);
        return next;
      }
      return { ...s, [name]: type === "checkbox" ? checked : value };
    });
  }

  // Save edit
  async function saveEdit() {
    if (!editId) return;
    setSavingId(editId);
    setError("");
    try {
      const payload = {
        name: edit.name.trim(),
        slug: (edit.slug || autoSlug(edit.name)).trim(),
        image: edit.image || "",
        bg: edit.bg || "bg-green-50",
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
    } catch (err) {
      setError("Failed to update category. Check API and permissions.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-6 md:p-10">
        <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
            Manage Categories
          </h1>

          {/* Create form */}
          <form onSubmit={handleAddCategory} className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                name="name"
                type="text"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Tropical Fruits"
                value={form.name}
                onChange={handleFormChange}
                required
                disabled={loading}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                name="slug"
                type="text"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="tropical-fruits"
                value={form.slug}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                name="image"
                type="url"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://..."
                value={form.image}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
              <select
                name="bg"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.bg}
                onChange={handleFormChange}
                disabled={loading}
              >
                {BG_PRESETS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
              <input
                name="sortOrder"
                type="number"
                min="0"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={`e.g. ${categories.length + 1}`}
                value={form.sortOrder}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            <div className="col-span-1 flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Active</label>
              <input
                name="active"
                type="checkbox"
                checked={form.active}
                onChange={handleFormChange}
                disabled={loading}
                className="h-5 w-5"
              />
            </div>

            <div className="col-span-1 md:col-span-2 lg:col-span-3 flex">
              <button
                type="submit"
                disabled={loading}
                className="ml-auto bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
                {loading ? "Adding..." : "Add Category"}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md flex items-center">
              <FaInfoCircle className="mr-3" />
              <p>{error}</p>
            </div>
          )}

          {loading && categories.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <FaSpinner className="animate-spin mr-3 text-3xl" /> Loading categories...
            </div>
          ) : (
            <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {categories.map((cat) => {
                  const id = cat._id || cat.id;
                  const inEdit = editId === id;

                  if (inEdit) {
                    return (
                      <li key={id} className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              name="name"
                              type="text"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.name}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                            <input
                              name="slug"
                              type="text"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.slug}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                              name="image"
                              type="url"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.image}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Background</label>
                            <select
                              name="bg"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.bg}
                              onChange={handleEditChange}
                            >
                              {BG_PRESETS.map((bg) => (
                                <option key={bg} value={bg}>
                                  {bg}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                            <input
                              name="sortOrder"
                              type="number"
                              min="0"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.sortOrder}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">Active</label>
                            <input
                              name="active"
                              type="checkbox"
                              checked={!!edit.active}
                              onChange={handleEditChange}
                              className="h-5 w-5"
                            />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-end gap-3">
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <FaTimes className="mr-2" /> Cancel
                          </button>
                          <button
                            onClick={saveEdit}
                            disabled={savingId === id}
                            className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex items-center"
                          >
                            {savingId === id ? (
                              <FaSpinner className="animate-spin mr-2" />
                            ) : (
                              <FaSave className="mr-2" />
                            )}
                            Save
                          </button>
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-10 w-10 rounded-md object-contain bg-white border"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-md border bg-gray-50" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="capitalize text-lg text-gray-800 font-medium">
                              {cat.name}
                            </span>
                            <span className="text-xs text-gray-500">/{cat.slug}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                cat.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {cat.active ? "Active" : "Inactive"}
                            </span>
                            <span className="text-xs text-gray-500">#{cat.sortOrder ?? "-"}</span>
                            <span className="text-xs text-gray-500">{cat.bg || "bg-green-50"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(cat)}
                          className="text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
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
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Categories;
