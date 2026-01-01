import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useDropzone } from "react-dropzone"; // Added dropzone
import {
  FaPlus,
  FaTrash,
  FaSpinner,
  FaInfoCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaImage,
  FaCalendarAlt,
  FaCloudUploadAlt, // Added upload icon
} from "react-icons/fa";
import config from "../config/config";

// --- Cloudinary Config ---
const CLOUDINARY_UPLOAD_PRESET = "product_images"; 
const CLOUDINARY_CLOUD_NAME = "dfmokbykd";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// --- Utility Functions (Kept from your original) ---
function toISOStringOrEmpty(v) {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (isNaN(d.getTime())) return "";
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ""; }
}

function fromLocalToISO(local) {
  if (!local) return null;
  const d = new Date(local);
  return isNaN(d.getTime()) ? null : d.toISOString(); 
}

function getScheduleStatus(startAt, endAt) {
  const now = new Date();
  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;
  if (start && start > now) return { color: 'bg-blue-100 text-blue-700', label: 'Scheduled' };
  if (end && end < now) return { color: 'bg-red-100 text-red-700', label: 'Expired' };
  if (start || end) return { color: 'bg-yellow-100 text-yellow-700', label: 'Running' };
  return { color: 'bg-gray-100 text-gray-700', label: 'Permanent' };
}

function Banners() {
  const { token } = useContext(AuthContext);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [uploading, setUploading] = useState(false); // New state for Cloudinary
  const [error, setError] = useState("");
  
  const initialFormState = { title: "", label: "", img: "", link: "", categoryId: "", active: true, sortOrder: "", startAt: "", endAt: "" };
  const [form, setForm] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState(initialFormState);

  // --- Cloudinary Drag & Drop Logic ---
  const onDrop = useCallback(async (acceptedFiles, isEdit = false) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await axios.post(CLOUDINARY_URL, data);
      const url = res.data.secure_url;
      
      if (isEdit) {
        setEdit(prev => ({ ...prev, img: url }));
      } else {
        setForm(prev => ({ ...prev, img: url }));
      }
    } catch (err) {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, false),
    accept: { 'image/*': [] },
    multiple: false
  });

  const { getRootProps: getEditRootProps, getInputProps: getEditInputProps, isDragActive: isEditDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, true),
    accept: { 'image/*': [] },
    multiple: false
  });

  // --- Data Fetching ---
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      try {
        const [bannerRes, catRes] = await Promise.all([
          axios.get(`${config.backendUrl}/api/admin/banners`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${config.backendUrl}/api/admin/categories`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setBanners((Array.isArray(bannerRes.data) ? bannerRes.data : bannerRes.data.banners || []).sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)));
        setCategories((Array.isArray(catRes.data) ? catRes.data : catRes.data.categories || []).sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)));
      } catch (e) {
        setError("Failed to fetch data.");
      } finally { setLoading(false); }
    })();
  }, [token]);

  // --- API Handlers ---
  async function handleCreate(e) {
    e.preventDefault();
    if (!form.img) return setError("Please upload an image first.");
    setLoading(true);
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || banners.length + 1, startAt: fromLocalToISO(form.startAt), endAt: fromLocalToISO(form.endAt) };
      const res = await axios.post(`${config.backendUrl}/api/admin/banners`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setBanners(prev => [...prev, res.data].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)));
      setForm(initialFormState);
      setError('Banner created successfully!');
      setTimeout(() => setError(''), 3000);
    } catch (err) { setError("Failed to create banner."); } finally { setLoading(false); }
  }

  async function saveEdit() {
    if (!editId || !edit.img) return;
    setSavingId(editId);
    try {
      const payload = { ...edit, sortOrder: Number(edit.sortOrder), startAt: fromLocalToISO(edit.startAt), endAt: fromLocalToISO(edit.endAt) };
      const res = await axios.put(`${config.backendUrl}/api/admin/banners/${editId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setBanners(prev => prev.map(b => (b._id === editId ? res.data : b)).sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999)));
      setEditId(null);
      setError('Banner updated!');
      setTimeout(() => setError(''), 3000);
    } catch (err) { setError("Update failed."); } finally { setSavingId(null); }
  }

  async function deleteBanner(id) {
    if (!window.confirm("Delete this banner?")) return;
    setSavingId(id);
    try {
      await axios.delete(`${config.backendUrl}/api/admin/banners/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setBanners(prev => prev.filter(b => b._id !== id));
    } catch (err) { setError("Delete failed."); } finally { setSavingId(null); }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8 border-b pb-4">Banner Management</h1>

        {error && (
          <div className={`p-4 mb-6 rounded border-l-4 ${error.includes('success') ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
            {error}
          </div>
        )}

        {/* --- CREATE FORM --- */}
        <div className="mb-10 p-6 bg-gray-50 border rounded-xl shadow-inner">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FaPlus /> Add Banner</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Dropzone Column */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium mb-1">Banner Image *</label>
              <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition h-48 flex flex-col justify-center items-center ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}>
                <input {...getInputProps()} />
                {form.img ? (
                  <img src={form.img} className="h-full w-full object-contain" alt="Preview" />
                ) : (
                  <>
                    <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                    {uploading ? <p className="animate-pulse text-blue-500">Uploading...</p> : <p className="text-sm text-gray-500">Drag image here or click</p>}
                  </>
                )}
              </div>
              {form.img && <button type="button" onClick={() => setForm({...form, img: ""})} className="text-xs text-red-500 mt-2 underline">Remove & Change</button>}
            </div>

            {/* Fields Column */}
            <div className="space-y-4">
              <input type="text" placeholder="Title" className="w-full p-2.5 border rounded-lg" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} />
              <input type="text" placeholder="CTA Label (e.g. Shop Now)" className="w-full p-2.5 border rounded-lg" value={form.label} onChange={(e) => setForm({...form, label: e.target.value})} />
              <input type="text" placeholder="Link Path" className="w-full p-2.5 border rounded-lg" value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} />
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input type="datetime-local" className="w-1/2 p-2 border rounded text-xs" value={form.startAt} onChange={(e) => setForm({...form, startAt: e.target.value})} />
                <input type="datetime-local" className="w-1/2 p-2 border rounded text-xs" value={form.endAt} onChange={(e) => setForm({...form, endAt: e.target.value})} />
              </div>
              <select className="w-full p-2.5 border rounded-lg" value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})}>
                <option value="">Global (No Category)</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
              <button type="submit" disabled={loading || uploading || !form.img} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
                {loading ? <FaSpinner className="animate-spin inline" /> : "Create Banner"}
              </button>
            </div>
          </form>
        </div>

        {/* --- LIST SECTION --- */}
        <div className="space-y-4">
          {banners.map((b) => {
            const inEdit = editId === b._id;
            const schedule = getScheduleStatus(b.startAt, b.endAt);

            return inEdit ? (
              <div key={b._id} className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                <div {...getEditRootProps()} className="border-2 border-dashed border-yellow-400 rounded-lg h-32 flex items-center justify-center bg-white cursor-pointer">
                  <input {...getEditInputProps()} />
                  <img src={edit.img} className="h-full object-contain" alt="edit" />
                </div>
                <div className="space-y-2 text-sm">
                  <input type="text" className="w-full p-2 border rounded" value={edit.title} onChange={(e) => setEdit({...edit, title: e.target.value})} />
                  <input type="text" className="w-full p-2 border rounded" value={edit.link} onChange={(e) => setEdit({...edit, link: e.target.value})} />
                </div>
                <div className="flex flex-col justify-between">
                  <div className="flex gap-2 mb-2">
                    <button onClick={saveEdit} className="flex-1 bg-green-600 text-white py-2 rounded flex items-center justify-center gap-2"><FaSave /> Save</button>
                    <button onClick={() => setEditId(null)} className="flex-1 bg-gray-400 text-white py-2 rounded">Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={b._id} className="flex flex-col md:flex-row items-center gap-6 p-4 bg-white border rounded-xl hover:shadow-md transition">
                <img src={b.img} className="w-full md:w-48 h-28 object-cover rounded-lg shadow-sm" alt={b.title} />
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h3 className="text-lg font-bold">{b.title || "Untitled Banner"}</h3>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${schedule.color}`}>{schedule.label}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100">{b.active ? "Visible" : "Hidden"}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{b.link}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditId(b._id); setEdit({...b, startAt: toISOStringOrEmpty(b.startAt), endAt: toISOStringOrEmpty(b.endAt)}); }} className="p-3 text-blue-600 hover:bg-blue-50 rounded-full"><FaEdit /></button>
                  <button onClick={() => deleteBanner(b._id)} className="p-3 text-red-600 hover:bg-red-50 rounded-full"><FaTrash /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Banners;