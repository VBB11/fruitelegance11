// src/pages/admin/Dashboard.js
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import config from "../config/config";
import { AuthContext } from "../../context/AuthContext";
import {
  FaBoxOpen,
  FaThLarge,
  FaFileInvoiceDollar,
  FaImage,
  FaChartLine, 
  FaSpinner, 
} from "react-icons/fa";

// --- MODERNIZED DASHBOARD CARD COMPONENT ---
// The entire card is now wrapped in a Link
const DashboardCard = ({ title, link, icon: Icon, count, colorClass, linkLabel = "View Details" }) => {
  return (
    // Replaced the surrounding div with a Link component
    <Link
      to={link}
      className={`block bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 transform hover:shadow-green-300 hover:scale-[1.02] border-t-4 ${colorClass} cursor-pointer`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Card Icon and Title */}
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <div className={`text-4xl p-3 rounded-full bg-opacity-20 ${colorClass.replace('border-t-4 border-', 'text-')}`}>
            <Icon />
          </div>
        </div>
        
        {/* Count/Statistic */}
        {count !== undefined ? (
          <p className="text-4xl font-extrabold text-gray-900 mt-2">
            {count.toLocaleString('en-IN')}
            <span className="block text-sm font-medium text-gray-500 mt-1">Total Items</span>
          </p>
        ) : (
          <p className="text-4xl font-extrabold text-gray-900 mt-2">-</p>
        )}
      </div>

      {/* Action Link (Now just visual indicator since the whole card is the link) */}
      <div
        className={`flex justify-between items-center px-6 py-3 text-white font-medium transition-colors ${colorClass.replace('border-t-4 border-', 'bg-')}`}
      >
        <span>{linkLabel}</span>
        <span className="text-xl">&rarr;</span>
      </div>
    </Link>
  );
};

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  
  const [stats, setStats] = useState({ 
    categoryCount: 0, 
    productCount: 0, 
    orderCount: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- RESTORED ORIGINAL DATA FETCHING LOGIC ---
  useEffect(() => {
    async function fetchStats() {
      if (!token) {
        setLoading(false);
        setError("Authentication token missing.");
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [catRes, prodRes, orderRes] = await Promise.all([
          axios.get(`${config.backendUrl}/api/categories`),
          axios.get(`${config.backendUrl}/api/products`),
          axios.get(`${config.backendUrl}/api/admin/orders`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const extractCount = (res) => {
             const data = res.data;
             if (Array.isArray(data)) return data.length;
             if (Array.isArray(data?.categories)) return data.categories.length;
             if (Array.isArray(data?.products)) return data.products.length;
             if (Array.isArray(data?.orders)) return data.orders.length;
             if (data?.totalCount !== undefined) return data.totalCount; 
             return 0; 
        };

        setStats({
          categoryCount: extractCount(catRes),
          productCount: extractCount(prodRes),
          orderCount: extractCount(orderRes),
        });

      } catch (e) {
        console.error("Failed to fetch admin dashboard stats:", e.response?.data?.message || e.message);
        setError("Failed to load statistics. Please check your network or try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [token]);
  // ---------------------------------------------------------------------------------

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* --- ADMIN NAV REMOVED --- */}
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center flex items-center justify-center gap-3">
          <FaChartLine className="text-green-600 text-3xl" />
          Administrator Console
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-green-600 bg-white rounded-xl shadow-lg p-8">
            <FaSpinner className="animate-spin text-5xl mb-4" /> 
            <p className="text-xl font-medium">Fetching data from existing endpoints...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-700 bg-red-100 border border-red-300 rounded-xl p-8 shadow-md">
            <p className="text-xl font-semibold">{error}</p>
            <p className="text-md mt-2">Check your network or ensure the category/product/order endpoints are functioning correctly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* KPI CARD: Categories */}
            <DashboardCard
              title="Categories"
              link="/admin/categories"
              icon={FaThLarge}
              count={stats.categoryCount}
              colorClass="border-green-500"
              linkLabel="Manage Categories"
            />
            
            {/* KPI CARD: Products */}
            <DashboardCard
              title="Products"
              link="/admin/products"
              icon={FaBoxOpen}
              count={stats.productCount}
              colorClass="border-blue-500"
              linkLabel="Manage Products"
            />
            
            {/* KPI CARD: Orders */}
            <DashboardCard
              title="Orders"
              link="/admin/orders"
              icon={FaFileInvoiceDollar}
              count={stats.orderCount}
              colorClass="border-orange-500"
              linkLabel="Manage Orders"
            />
            
            {/* Management Card: Banners (No count required) */}
            <DashboardCard
              title="Banners"
              link="/admin/banners"
              icon={FaImage}
              colorClass="border-purple-500"
              linkLabel="Edit Banners"
            />
          </div>
        )}
        
        {/* Placeholder for future reporting/analytics */}
        <div className="mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Analytics Overview</h2>
            <div className="h-64 flex justify-center items-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                [Placeholder for Sales Trend Chart or Recent Orders Table]
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;