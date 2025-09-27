import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaTimesCircle, FaSearch } from "react-icons/fa";

const backendUrl = "http://localhost:4000";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // New states for search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Debounce search term
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const query = [];
      if (debouncedSearchTerm) {
        query.push(`search=${debouncedSearchTerm}`);
      }
      if (selectedCategory) {
        query.push(`category=${selectedCategory}`);
      }
      const queryString = query.length ? `?${query.join("&")}` : "";

      const productsRes = await axios.get(`${backendUrl}/api/admin/products${queryString}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(productsRes.data.products || productsRes.data || []);
      
      const categoriesRes = await axios.get(`${backendUrl}/api/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(categoriesRes.data.categories || categoriesRes.data || []);

    } catch (err) {
      console.error("Failed to fetch data:", err);
      setError("Failed to load products. Please ensure you are logged in as an admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token, debouncedSearchTerm, selectedCategory]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    setDeletingId(id);
    try {
      await axios.delete(`${backendUrl}/api/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(products.filter(p => p._id !== id));
      setError("");
    } catch {
      setError("Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin - Product List</h1>
          <button
            onClick={() => navigate("/admin/products/new")}
            className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Product</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2" role="alert">
            <FaTimesCircle />
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <div className="relative flex-1 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-auto border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <FaSpinner className="animate-spin mr-3 text-3xl" /> Loading products...
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600 font-semibold uppercase text-sm tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-gray-600 font-semibold uppercase text-sm tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-gray-600 font-semibold uppercase text-sm tracking-wider">
                    Price (₹)
                  </th>
                  <th className="text-center px-6 py-3 text-gray-600 font-semibold uppercase text-sm tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {p.categoryId?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        ₹{p.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                        <button
                          onClick={() => handleEdit(p._id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          aria-label={`Edit ${p.name}`}
                        >
                          <FaEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={deletingId === p._id}
                          className={`text-red-600 hover:text-red-800 transition-colors ${deletingId === p._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          aria-label={`Delete ${p.name}`}
                        >
                          {deletingId === p._id ? <FaSpinner className="animate-spin" /> : <FaTrash size={20} />}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;