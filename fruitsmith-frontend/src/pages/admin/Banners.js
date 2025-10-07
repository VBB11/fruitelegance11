// src/pages/admin/Banners.js
import React, { useEffect, useState, useContext } from "react";
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

// Fields supported by UI now; backend can gradually adopt them:
// { _id, title, label, img (or imageUrl), link, categoryId, categorySlug, active, sortOrder, startAt, endAt }

function toISOStringOrEmpty(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return "";
    // convert to yyyy-MM-ddTHH:mm for input[type=datetime-local]
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

function fromLocalToISO(local) {
  // convert datetime-local back to ISO string
  if (!local) return null;
  const d = new Date(local);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

function Banners() {
  const { token } = useContext(AuthContext);

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]); // for category assignment
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  // Create form
  const [form, setForm] = useState({
    title: "",
    label: "",
    img: "",
    link: "",
    categoryId: "",
    active: true,
    sortOrder: "",
    startAt: "",
    endAt: "",
  });

  // Edit state
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState({
    title: "",
    label: "",
    img: "",
    link: "",
    categoryId: "",
    active: true,
    sortOrder: "",
    startAt: "",
    endAt: "",
  });

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
      } catch (e) {
        setError("Failed to fetch banners. Check API and permissions.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Load categories for assignment (optional)
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await axios.get(`${config.backendUrl}/api/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cats = Array.isArray(res.data) ? res.data : res.data.categories || [];
        const sorted = [...cats].sort(
          (a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)
        );
        setCategories(sorted);
      } catch {
        // category assignment remains optional
      }
    })();
  }, [token]);

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

      setForm({
        title: "",
        label: "",
        img: "",
        link: "",
        categoryId: "",
        active: true,
        sortOrder: "",
        startAt: "",
        endAt: "",
      });
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
    setEdit({
      title: "",
      label: "",
      img: "",
      link: "",
      categoryId: "",
      active: true,
      sortOrder: "",
      startAt: "",
      endAt: "",
    });
  }

  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;
    setEdit((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  }

  async function saveEdit() {
    if (!editId) return;
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
    try {
      await axios.delete(`${config.backendUrl}/api/admin/banners/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBanners((prev) => prev.filter((b) => (b._id || b.id) !== id));
    } catch (err) {
      setError(
        "Failed to delete banner. Check API permissions or references."
      );
    }
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-6 md:p-10">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
            Manage Banners
          </h1>

          {/* Create form */}
          <form
            onSubmit={handleCreate}
            className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                name="title"
                type="text"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Luxury Hampers"
                value={form.title}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label (CTA)
              </label>
              <input
                name="label"
                type="text"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Shop Now"
                value={form.label}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                name="img"
                type="url"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://..."
                value={form.img}
                onChange={handleFormChange}
                disabled={loading}
                required
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link (internal or external)
              </label>
              <input
                name="link"
                type="text"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="/category/diwali or https://example.com"
                value={form.link}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign Category (optional)
              </label>
              <select
                name="categoryId"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.categoryId}
                onChange={handleFormChange}
                disabled={loading || categories.length === 0}
              >
                <option value="">None</option>
                {categories.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.name} {c.slug ? `(/${c.slug})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <input
                name="sortOrder"
                type="number"
                min="0"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder={`e.g. ${banners.length + 1}`}
                value={form.sortOrder}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            <div className="flex items-center gap-3">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start At (optional)
              </label>
              <input
                name="startAt"
                type="datetime-local"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.startAt}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End At (optional)
              </label>
              <input
                name="endAt"
                type="datetime-local"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                value={form.endAt}
                onChange={handleFormChange}
                disabled={loading}
              />
            </div>

            <div className="lg:col-span-3 flex">
              <button
                type="submit"
                disabled={loading}
                className="ml-auto bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlus className="mr-2" />}
                {loading ? "Creating..." : "Create Banner"}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md flex items-center">
              <FaInfoCircle className="mr-3" />
              <p>{error}</p>
            </div>
          )}

          {loading && banners.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <FaSpinner className="animate-spin mr-3 text-3xl" /> Loading banners...
            </div>
          ) : (
            <div className="rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {banners.map((b) => {
                  const id = b._id || b.id;
                  const inEdit = editId === id;

                  if (inEdit) {
                    return (
                      <li key={id} className="p-4 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input
                              name="title"
                              type="text"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.title}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                            <input
                              name="label"
                              type="text"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.label}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                              name="img"
                              type="url"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.img}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                            <input
                              name="link"
                              type="text"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.link}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                              name="categoryId"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.categoryId}
                              onChange={handleEditChange}
                            >
                              <option value="">None</option>
                              {categories.map((c) => (
                                <option key={c._id || c.id} value={c._id || c.id}>
                                  {c.name} {c.slug ? `(/${c.slug})` : ""}
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
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start At</label>
                            <input
                              name="startAt"
                              type="datetime-local"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.startAt}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End At</label>
                            <input
                              name="endAt"
                              type="datetime-local"
                              className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                              value={edit.endAt}
                              onChange={handleEditChange}
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
                        {b.img || b.imageUrl ? (
                          <img
                            src={b.img || b.imageUrl}
                            alt={b.title || "Banner"}
                            className="h-14 w-24 rounded-md object-cover bg-white border"
                          />
                        ) : (
                          <div className="h-14 w-24 rounded-md border bg-gray-50" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg text-gray-800 font-medium">
                              {b.title || "(No title)"}
                            </span>
                            {b.label ? (
                              <span className="text-xs text-gray-500">[{b.label}]</span>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                b.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {b.active ? "Active" : "Inactive"}
                            </span>
                            <span className="text-xs text-gray-500">#{b.sortOrder ?? "-"}</span>
                            {b.categoryId ? (
                              <span className="text-xs text-blue-600">Assigned</span>
                            ) : (
                              <span className="text-xs text-gray-500">Unassigned</span>
                            )}
                            {b.link ? (
                              <span className="text-xs text-gray-500 break-all">link: {b.link}</span>
                            ) : null}
                          </div>
                          {(b.startAt || b.endAt) && (
                            <div className="text-xs text-gray-500 mt-1">
                              {b.startAt ? `From: ${new Date(b.startAt).toLocaleString()}` : "From: —"}{" "}
                              | {b.endAt ? `To: ${new Date(b.endAt).toLocaleString()}` : "To: —"}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(b)}
                          className="text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"
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

export default Banners;
