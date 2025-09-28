// src/pages/admin/AdminOrders.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSpinner, FaTimesCircle, FaSearch, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import config from '../config/config';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Processing: "bg-blue-100 text-blue-800",
  Shipped: "bg-indigo-100 text-indigo-800",
  Delivered: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
  Refunded: "bg-gray-100 text-gray-800",
};

function AdminOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // New states for search and date filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Debounce effect for search input
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const query = [];
        if (statusFilter) query.push(`status=${statusFilter}`);
        if (debouncedSearchTerm) query.push(`search=${debouncedSearchTerm}`);
        if (startDate) query.push(`startDate=${startDate}`);
        if (endDate) query.push(`endDate=${endDate}`);
        
        query.push(`page=${page}`, 'limit=20');
        const queryString = query.length ? `?${query.join('&')}` : '';
        
        const res = await axios.get(`/api/admin/orders${queryString}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setOrders(res.data.orders);
        setPages(res.data.pages);
        setError('');
      } catch (err) {
        console.error("Failed to fetch admin orders:", err);
        setError('Failed to load orders. Please try again.');
      }
      setLoading(false);
    }
    fetchOrders();
  }, [token, statusFilter, page, debouncedSearchTerm, startDate, endDate]); // Added new dependencies

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`${config.backendUrl}/api/admin/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">Admin - Manage Orders</h1>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by ID or User"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset page on new search
              }}
              className="w-full border border-gray-300 rounded-md p-2 pl-10 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-gray-700 font-semibold" htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            >
              <option value="">All</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2">
            <label className="text-gray-700 font-semibold" htmlFor="startDate">Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              aria-label="Start Date"
            />
            <span>-</span>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              aria-label="End Date"
            />
          </div>

          {/* Reset Filters Button */}
          <button
            onClick={resetFilters}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            <FaFilter /> Reset
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            <FaSpinner className="animate-spin mr-3 text-3xl" /> Loading orders...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 text-red-600">
            <FaTimesCircle className="mr-2" /> {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No orders found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="w-full text-left table-auto">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Order ID</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 uppercase">User</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Total</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Status</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 uppercase">Date</th>
                  <th className="p-4 font-semibold text-sm text-gray-600 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm text-gray-800">{order._id.slice(0, 8)}...</td>
                    <td className="p-4 text-gray-800">{order.userId?.name || order.userId?.email || 'Unknown'}</td>
                    <td className="p-4 font-bold text-gray-800">₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`py-1 px-2 rounded-full font-medium text-sm ${statusColors[order.status]}`}
                        aria-label={`Change status for order ${order._id}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <Link to={`/admin/orders/${order._id}`} className="text-green-600 hover:underline font-semibold">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pages > 1 && (
          <div className="mt-8 flex justify-center items-center space-x-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700"
            >
              Previous
            </button>
            <span className="text-lg font-medium text-gray-700">Page {page} of {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pages))}
              disabled={page === pages}
              className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-700"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;