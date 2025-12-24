import React, { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaPlus, FaSpinner, FaTimesCircle, FaTrash, FaCloudUploadAlt } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import config from "../config/config";

// Your Cloudinary Info
const CLOUDINARY_UPLOAD_PRESET = "product_images"; 
const CLOUDINARY_CLOUD_NAME = "dfmokbykd";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    images: [], // This will hold the Cloudinary URLs
    price: "",
    categoryId: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // --- 1. Cloudinary Upload Logic ---
  const onDrop = useCallback(async (acceptedFiles) => {
    setUploading(true);
    setError("");
    const uploadedUrls = [];

    for (const file of acceptedFiles) {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await axios.post(CLOUDINARY_URL, data);
        uploadedUrls.push(res.data.secure_url);
      } catch (err) {
        console.error("Cloudinary Error:", err);
        setError("Failed to upload some images. Check file size/type.");
      }
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls],
    }));
    setUploading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // --- 2. Fetch Initial Data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesRes = await axios.get(`${config.backendUrl}/api/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.categories || []);

        if (id) {
          const productRes = await axios.get(`${config.backendUrl}/api/products/${id}`);
          const p = productRes.data;
          setFormData({
            name: p.name || "",
            description: p.description || "",
            images: p.image || [], // Use the 'image' field from your Mongoose schema
            price: p.price != null ? String(p.price) : "",
            categoryId: p.categoryId?._id || p.categoryId || "",
          });
        }
      } catch (err) {
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [id, token]);

  // --- 3. Save to Your Backend ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.images.length === 0) {
      setError("Please upload at least one image.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description,
        image: formData.images, // Sending the array of URLs to your Mongoose 'image' field
        price: Number(formData.price),
        categoryId: formData.categoryId,
      };

      if (id) {
        await axios.put(`${config.backendUrl}/api/admin/products/${id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${config.backendUrl}/api/admin/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      navigate("/admin/products");
    } catch (err) {
      setError("Failed to save product to database.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><FaSpinner className="animate-spin inline text-3xl"/></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">{id ? "Edit" : "New"} Product</h1>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 flex items-center gap-2"><FaTimesCircle/>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input type="text" className="w-full p-2 border rounded" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>

          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea className="w-full p-2 border rounded" rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
          </div>

          {/* --- Drag & Drop Zone --- */}
          <div>
            <label className="block font-medium mb-2">Product Images</label>
            <div {...getRootProps()} className={`border-2 border-dashed p-6 rounded-lg text-center cursor-pointer transition ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
              <input {...getInputProps()} />
              <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-2" />
              {uploading ? <p className="text-blue-600">Uploading to Cloudinary...</p> : <p>Drop images here or click to browse</p>}
            </div>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-4 gap-4 mt-4">
              {formData.images.map((url, index) => (
                <div key={index} className="relative aspect-square rounded border overflow-hidden group">
                  <img src={url} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">
                    <FaTrash size={10} />
                  </button>
                  {index === 0 && <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] text-center">Main</span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Price (INR)</label>
            <input type="number" className="w-full p-2 border rounded" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          </div>

          <div>
            <label className="block font-medium mb-1">Category</label>
            <select className="w-full p-2 border rounded" value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})} required>
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
          </div>

          <button type="submit" disabled={saving || uploading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving..." : id ? "Update Product" : "Create Product"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;