// src/pages/admin/Dashboard.js
import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import AdminNav from "../../components/AdminNav";
import axios from "axios";
import config from "../config/config";
import { AuthContext } from "../../context/AuthContext";
import {
  FaBoxOpen,
  FaThLarge,
  FaFileInvoiceDollar,
  FaImage,
} from "react-icons/fa";

// Component to display a single dashboard card
const DashboardCard = ({ title, link, icon, count }) => {
  return (
    <Link
      to={link}
      className="flex flex-col items-center justify-center p-8 bg-blue-600 text-white rounded-2xl shadow-lg transition-transform transform hover:scale-105 hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500"
    >
      <div className="text-4xl sm:text-5xl mb-4">{icon}</div>
      <h3 className="text-xl sm:text-2xl font-bold text-center">
        {title}
        {count !== undefined && (
          <span className="block text-sm font-normal mt-1">({count} items)</span>
        )}
      </h3>
    </Link>
  );
};

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState({ categories: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      if (!token) {
        setLoading(false);
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

        // Categories may be { categories: [] } or [] directly
        const categoriesData = Array.isArray(catRes.data)
          ? catRes.data
          : Array.isArray(catRes.data?.categories)
          ? catRes.data.categories
          : [];
        const productsData = Array.isArray(prodRes.data)
          ? prodRes.data
          : Array.isArray(prodRes.data?.products)
          ? prodRes.data.products
          : [];
        const ordersData = Array.isArray(orderRes.data)
          ? orderRes.data
          : Array.isArray(orderRes.data?.orders)
          ? orderRes.data.orders
          : [];

        setStats({
          categories: categoriesData.length,
          products: productsData.length,
          orders: ordersData.length,
        });
      } catch (e) {
        console.error("Failed to fetch admin dashboard stats:", e);
        setError("Failed to load statistics. Please check your network or try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [token]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminNav />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          Admin Dashboard
        </h1>

        {loading ? (
          <div className="text-center text-gray-600 text-lg">
            <p>Loading statistics...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Manage Categories"
              link="/admin/categories"
              icon={<FaThLarge />}
              count={stats.categories}
            />
            <DashboardCard
              title="Manage Products"
              link="/admin/products"
              icon={<FaBoxOpen />}
              count={stats.products}
            />
            <DashboardCard
              title="Manage Orders"
              link="/admin/orders"
              icon={<FaFileInvoiceDollar />}
              count={stats.orders}
            />
            <DashboardCard
              title="Manage Banners"
              link="/admin/banners"
              icon={<FaImage />}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;