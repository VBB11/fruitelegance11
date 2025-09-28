// src/pages/admin/Categories.js
import React, { useState, useEffect, useContext } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { FaPlus, FaTrash, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import config from '../config/config';

const backendUrl = 'http://localhost:4000';

function Categories() {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${config.backendUrl}/api/admin/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cats = Array.isArray(res.data) ? res.data : res.data.categories || [];
        setCategories(cats);
      } catch (err) {
        setError('Failed to fetch categories. Please check your network and permissions.');
      }
      setLoading(false);
    }
    if (token) fetchCategories();
  }, [token]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        `${config.backendUrl}/api/admin/categories`,
        { name: newCategory.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories((prev) => [...prev, res.data]);
      setNewCategory('');
    } catch (err) {
      setError('Failed to add category. Ensure you are logged in as admin.');
    }
    setLoading(false);
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }
    try {
      await axios.delete(`${config.backendUrl}/api/admin/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete category. It might have associated products or you lack permissions.');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-6 md:p-10">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Manage Categories</h1>

          <form onSubmit={handleAddCategory} className="flex mb-6 space-x-2">
            <div className="flex-1">
              <input
                type="text"
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                placeholder="Enter new category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaPlus className="mr-2" />}
              {loading ? 'Adding...' : 'Add'}
            </button>
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
            <div className="rounded-lg shadow-sm border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {categories.map((cat) => (
                  <li key={cat._id} className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors">
                    <span className="capitalize text-lg text-gray-800 font-medium">{cat.name}</span>
                    <button
                      onClick={() => deleteCategory(cat._id)}
                      className="text-red-500 p-2 rounded-full hover:bg-red-100 transition-colors"
                      title="Delete Category"
                    >
                      <FaTrash />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Categories;