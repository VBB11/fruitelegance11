// src/pages/admin/AdminOrders.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FaSpinner, 
  FaTimesCircle, 
  FaSearch, 
  FaCalendarAlt, 
  FaFilter, 
  FaSyncAlt, 
  FaChevronDown, 
  FaChevronUp,
  FaArrowLeft,
  FaArrowRight,
  FaDollarSign,  
  FaClipboardList, 
  FaChartPie, 
} from 'react-icons/fa';
import config from '../config/config';

// Define status options and colors
const STATUS_OPTIONS = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  Processing: "bg-blue-100 text-blue-800 border border-blue-300",
  Shipped: "bg-indigo-100 text-indigo-800 border border-indigo-300",
  Delivered: "bg-green-100 text-green-800 border border-green-300",
  Cancelled: "bg-red-100 text-red-800 border border-red-300",
  Refunded: "bg-gray-200 text-gray-800 border border-gray-400",
};

// Initial state structure for summary data
const initialSummary = {
  totalRevenue: 0,
  totalOrders: 0,
  avgOrderValue: 0,
  statusBreakdown: {}, 
};

function AdminOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for Summary Data
  const [summaryData, setSummaryData] = useState(initialSummary); 
  const [summaryLoading, setSummaryLoading] = useState(true);
  
  // Filter & Pagination States
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // UI State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // === CORRECTED FUNCTION: Fetch Summary Data (Using real API) ===
  async function fetchSummaryData() {
    setSummaryLoading(true);
    try {
      const query = [];
      if (startDate) query.push(`startDate=${startDate}`);
      if (endDate) query.push(`endDate=${endDate}`);
      const queryString = query.length ? `?${query.join('&')}` : '';

      // *** REAL API CALL TO BACKEND AGGREGATION ENDPOINT ***
      const res = await axios.get(`${config.backendUrl}/api/admin/orders/summary${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // The backend returns an object matching initialSummary structure
      setSummaryData(res.data);
      // *******************************************************

    } catch (err) {
      console.error("Failed to fetch summary data:", err);
      // Gracefully handle error by resetting or leaving old data
      setSummaryData(initialSummary);
    }
    setSummaryLoading(false);
  }

  // === Main Fetch Orders Function ===
  async function fetchOrders() {
    setLoading(true);
    setError('');
    try {
      const query = [];
      if (statusFilter) query.push(`status=${statusFilter}`);
      if (debouncedSearchTerm) query.push(`search=${debouncedSearchTerm}`);
      if (startDate) query.push(`startDate=${startDate}`);
      if (endDate) query.push(`endDate=${endDate}`);
      
      query.push(`page=${page}`, 'limit=20');
      const queryString = query.length ? `?${query.join('&')}` : '';
      
      const res = await axios.get(`${config.backendUrl}/api/admin/orders${queryString}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrders(res.data.orders);
      setPages(res.data.pages);
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
      setError(err.response?.data?.message || 'Failed to load orders. Please check your connection or try again.');
    }
    setLoading(false);
  }

  // Debounce effect
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Main data fetching effect: Fetches summary and detailed orders whenever filters/page change
  useEffect(() => {
    fetchOrders(); 
    fetchSummaryData(); 
  }, [token, statusFilter, page, debouncedSearchTerm, startDate, endDate]); 

  const updateOrderStatus = async (orderId, newStatus) => {
    // Optimistic update logic
    const originalOrders = [...orders];
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await axios.patch(`${config.backendUrl}/api/admin/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optionally re-fetch summary data to update status count immediately
      fetchSummaryData(); 
    } catch (err) {
      alert('Failed to update order status');
      setOrders(originalOrders);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
    // Explicitly call fetch functions to ensure immediate reload
    // useEffect will also catch the state changes, but this can feel snappier.
    fetchOrders(); 
    fetchSummaryData();
    setIsFiltersOpen(false); 
  };
  
  // Helper component to render KPI cards
  const KPICard = ({ title, value, icon: Icon, colorClass, loading }) => (
    <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${colorClass}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
          {loading ? (
            <FaSpinner className="animate-spin text-2xl mt-2 text-gray-400" />
          ) : (
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{value}</p>
          )}
        </div>
        <Icon className={`text-3xl opacity-60 ${colorClass.replace('border-l-4', '').replace('border-', 'text-')}`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-8">
        
        {/* Header and Refresh */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Order Management & Analytics
          </h1>
          <button
            onClick={() => { fetchOrders(); fetchSummaryData(); }}
            className="text-gray-500 hover:text-green-600 transition duration-150 p-2 rounded-full hover:bg-gray-100"
            aria-label="Refresh All Data"
          >
            <FaSyncAlt className="text-xl" />
          </button>
        </div>

        {/* ================================================= */}
        {/* 1. KPI DASHBOARD SECTION (REAL DATA)    */}
        {/* ================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total Revenue"
            value={`₹${summaryData.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            icon={FaDollarSign}
            colorClass="border-green-600"
            loading={summaryLoading}
          />
          <KPICard
            title="Total Orders"
            value={summaryData.totalOrders.toLocaleString('en-IN')}
            icon={FaClipboardList}
            colorClass="border-blue-600"
            loading={summaryLoading}
          />
          <KPICard
            title="Avg. Order Value"
            value={`₹${summaryData.avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            icon={FaChartPie}
            colorClass="border-indigo-600"
            loading={summaryLoading}
          />
        </div>
        
        {/* ================================================= */}
        {/* 2. VISUALIZATION AREA (ENHANCED)        */}
        {/* ================================================= */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Order Distribution</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Status Breakdown List/Chart */}
          <div className="lg:col-span-1 bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Order Status Breakdown</h3>
            {summaryLoading ? (
              <div className="flex justify-center items-center h-40 text-gray-500">
                <FaSpinner className="animate-spin mr-2" /> Loading chart...
              </div>
            ) : Object.keys(summaryData.statusBreakdown).length === 0 ? (
                 <div className="text-center py-5 text-gray-500">No status data found.</div>
            ) : (
              // Simple List-based visualization (Ready for replacement with a proper Pie Chart)
              <div className="space-y-2">
                
                {Object.entries(summaryData.statusBreakdown)
                    // Sort by count descending for better visual impact
                    .sort(([, countA], [, countB]) => countB - countA)
                    .map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center p-2 rounded-lg bg-white shadow-sm">
                    <span className={`py-0.5 px-2 rounded-full text-xs font-semibold ${statusColors[status]}`}>{status}</span>
                    <span className="font-bold text-gray-800">{count} Orders</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Placeholder for Sales Trend Line Chart */}
          <div className="lg:col-span-2 bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">Sales Trend (Last 30 Days)</h3>
            <div className="h-64 flex justify-center items-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
              
            </div>
          </div>
        </div>
        
        {/* ================================================= */}
        {/* 3. FILTER & TABLE SECTION (Existing)    */}
        {/* ================================================= */}
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2 mt-8">Detailed Orders</h2>

        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name/Email"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg p-3 pl-12 text-lg focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all shadow-sm"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          </div>

          {/* Collapsible Filters */}
          <div className="border border-gray-200 rounded-lg p-3">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="w-full flex justify-between items-center text-lg font-semibold text-gray-700 hover:text-green-600 transition"
            >
              <span className="flex items-center gap-2">
                <FaFilter className="text-lg" /> Advanced Filters
              </span>
              {isFiltersOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFiltersOpen ? 'max-h-96 pt-4' : 'max-h-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Status Filter */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1" htmlFor="statusFilter">Order Status</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Start Date Filter */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1" htmlFor="startDate">Order Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-2 focus:ring-green-500 transition-colors appearance-none"
                      aria-label="Start Date"
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* End Date Filter */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-600 mb-1" htmlFor="endDate">Order End Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        setPage(1);
                      }}
                      className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-2 focus:ring-green-500 transition-colors appearance-none"
                      aria-label="End Date"
                    />
                    <FaCalendarAlt className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Reset Filters Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 hover:text-red-700 transition-colors flex items-center gap-2 border border-gray-300"
                >
                  <FaTimesCircle /> Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area (Loading/Error/Table) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-green-600 bg-green-50 rounded-lg shadow-inner">
            <FaSpinner className="animate-spin text-5xl mb-4" /> 
            <p className="text-lg font-medium">Loading orders, please wait...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-red-700 bg-red-100 rounded-lg shadow-inner p-4">
            <FaTimesCircle className="text-4xl mb-3" /> 
            <p className="font-semibold text-lg">{error}</p>
            <p className="text-sm mt-1">If the issue persists, contact support.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <FaFilter className="text-4xl mx-auto mb-3" />
            <h3 className="text-xl font-semibold">No Orders Found</h3>
            <p className="mt-2">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-xl border border-gray-200">
            <table className="w-full text-left table-auto">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Order ID</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Customer</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Total</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Status</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Date</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-green-50 transition-colors">
                    <td className="p-4 font-mono text-xs text-gray-600">
                        <span className="font-semibold">{order._id.slice(0, 8)}...</span>
                    </td>
                    <td className="p-4 text-gray-800 font-medium">
                        {order.userId?.name || order.userId?.email || 'Guest User'}
                    </td>
                    <td className="p-4 font-extrabold text-green-700">
                        ₹{order.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`py-1.5 px-3 rounded-lg font-semibold text-sm cursor-pointer appearance-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-shadow ${statusColors[order.status]}`}
                        aria-label={`Change status for order ${order._id}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <Link 
                        to={`/admin/orders/${order._id}`} 
                        className="text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md font-semibold text-sm transition-colors border border-green-300"
                      >
                        View Details
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
          <div className="mt-8 flex justify-center items-center space-x-6">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-3 bg-gray-200 text-gray-700 rounded-full font-semibold transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-green-500 hover:text-white"
              aria-label="Previous Page"
            >
              <FaArrowLeft />
            </button>
            <span className="text-xl font-extrabold text-gray-800">
                <span className="text-green-600">{page}</span> / {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pages))}
              disabled={page === pages}
              className="p-3 bg-gray-200 text-gray-700 rounded-full font-semibold transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 hover:bg-green-500 hover:text-white"
              aria-label="Next Page"
            >
              <FaArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrders;