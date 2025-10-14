// src/pages/admin/ProductForm.js
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaPlus, FaSpinner, FaTimesCircle, FaCheckCircle, FaTrash } from "react-icons/fa";
import config from "../config/config";

function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mainImage: "",      // Main product image URL
    extraImages: [],    // Array of additional image URLs
    price: "",
    categoryId: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sortCats = (arr) =>
    [...arr].sort((a, b) => (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const categoriesRes = await axios.get(`${config.backendUrl}/api/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawCats = Array.isArray(categoriesRes.data)
          ? categoriesRes.data
          : categoriesRes.data.categories || [];
        const cats = sortCats(rawCats);
        setCategories(cats);

        if (id) {
          const productRes = await axios.get(`${config.backendUrl}/api/products/${id}`);
          const p = productRes.data;

          let normalizedCategoryId = "";
          if (p?.categoryId) {
            if (typeof p.categoryId === "string") {
              normalizedCategoryId = p.categoryId;
            } else if (typeof p.categoryId === "object") {
              normalizedCategoryId = p.categoryId._id || "";
            }
          } else if (p?.category?._id) {
            normalizedCategoryId = p.category._id;
          }

          let productMainImage = p.images?.[0] || p.image?.[0] || "";
          let productExtraImages = [];
          if (p.images && p.images.length > 1) {
            productExtraImages = p.images.slice(1);
          } else if (p.image && p.image.length > 1) {
            productExtraImages = p.image.slice(1);
          }

          setFormData({
            name: p.name || "",
            description: p.description || "",
            mainImage: productMainImage,
            extraImages: productExtraImages,
            price: p.price != null ? String(p.price) : "",
            categoryId: normalizedCategoryId,
          });
        }
      } catch (err) {
        console.error("Failed to load product and categories data:", err);
        setError("Failed to load product and categories data.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExtraImageChange = (index, value) => {
    const newImages = [...formData.extraImages];
    newImages[index] = value;
    setFormData({ ...formData, extraImages: newImages });
  };

  const addExtraImageInput = () => {
    setFormData({ ...formData, extraImages: [...formData.extraImages, ""] });
  };

  const removeExtraImageInput = (index) => {
    const newImages = formData.extraImages.filter((_, i) => i !== index);
    setFormData({ ...formData, extraImages: newImages });
  };

  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      const res = await axios.post(
        `${config.backendUrl}/api/admin/categories`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newCat = res.data;
      const nextCats = sortCats([...categories, newCat]);
      setCategories(nextCats);
      setFormData((prev) => ({ ...prev, categoryId: newCat._id }));
      setNewCategoryName("");
      setError("");
    } catch (err) {
      console.error("Failed to add category:", err);
      setError("Failed to add category. Make sure you are logged in as admin.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim() || !formData.price || !formData.categoryId) {
      setError("Product Name, Price, and Category are required.");
      return;
    }

    if (!formData.mainImage.trim()) {
      setError("A main product image is required.");
      return;
    }

    setSaving(true);
    try {
      const filteredExtraImages = formData.extraImages.filter(url => url.trim() !== "");
      const allImages = [formData.mainImage.trim(), ...filteredExtraImages];

      const payload = {
        name: formData.name.trim(),
        description: formData.description || "",
        image: allImages, // Changed from 'images' to 'image' to match the Mongoose schema
        price: Number(formData.price),
        categoryId: String(formData.categoryId),
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
      console.error("Failed to save product:", err);
      setError("Failed to save product. Please check your inputs and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <FaSpinner className="animate-spin mr-3 text-3xl" /> Loading product data...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
          {id ? "Edit" : "Add"} Product
        </h1>

        {error && (
          <div
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2"
            role="alert"
          >
            <FaTimesCircle />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                placeholder="e.g., Organic Apple"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                placeholder="A brief description of the product"
              />
            </div>

            {/* Main Image URL */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Main Product Image URL</label>
              <input
                type="url"
                name="mainImage"
                value={formData.mainImage}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                placeholder="http://example.com/main-image.jpg"
                required
              />
              {formData.mainImage && (
                <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden">
                  <p className="text-sm text-gray-500 bg-gray-100 p-2 font-semibold">Main Image Preview:</p>
                  <img src={formData.mainImage} alt="Main Product Preview" className="w-full h-auto object-contain p-2" />
                </div>
              )}
            </div>

            {/* Extra Images URLS */}
            <div className="border-t border-gray-200 pt-6">
              <label className="block text-gray-700 font-semibold mb-2">Extra Product Images (Optional)</label>
              {formData.extraImages.map((image, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleExtraImageChange(index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                    placeholder={`Extra Image URL ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeExtraImageInput(index)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                    aria-label="Remove image"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addExtraImageInput}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center space-x-2 mt-2"
              >
                <FaPlus />
                <span>Add Another Image</span>
              </button>
              
              {/* Extra Image Previews */}
              {formData.extraImages.length > 0 && (
                <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden p-2">
                  <p className="text-sm text-gray-500 bg-gray-100 p-2 font-semibold">Extra Image Previews:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.extraImages.filter(url => url.trim() !== "").map((url, index) => (
                      <img key={index} src={url} alt={`Extra Product Preview ${index + 1}`} className="w-24 h-24 object-contain border border-gray-200 rounded-lg p-1" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Price (INR)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                placeholder="e.g., 99.50"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">Category</label>
              <div className="relative">
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors appearance-none pr-10"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.slug ? `(/${c.slug})` : ""}
                    </option>
                  ))}
                </select>
                <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 pointer-events-none" />
              </div>

              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="text"
                  placeholder="Add new category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={addCategory}
                  className="bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {saving ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>{id ? "Updating..." : "Saving..."}</span>
              </>
            ) : (
              <span>{id ? "Update Product" : "Add Product"}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;