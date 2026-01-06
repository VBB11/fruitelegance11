import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaSpinner, FaBoxOpen, FaUser, FaTruck, FaShoppingCart, FaCreditCard, FaCalendarAlt, FaCheckCircle, FaSave } from "react-icons/fa";
import config from "../config/config";

// --- Utility Functions ---
const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

const statusColors = {
  Pending: "bg-yellow-500 text-white",
  Processing: "bg-blue-500 text-white",
  Shipped: "bg-indigo-500 text-white",
  Delivered: "bg-green-600 text-white",
  Cancelled: "bg-red-500 text-white",
  Refunded: "bg-gray-500 text-white",
};

const getStatusBadge = (status) => {
  const color = statusColors[status] || "bg-gray-300 text-gray-800";
  return (
    <span className={`inline-block px-3 py-1 text-sm rounded-full font-bold shadow-md ${color}`}>
      {status}
    </span>
  );
};

// --- Helper Components ---
const DetailCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 h-full">
    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
      <Icon className="text-green-600" />
      {title}
    </h2>
    <div className="text-sm space-y-2">{children}</div>
  </div>
);

const DetailItem = ({ label, value, highlight = false, icon: Icon }) => (
    <div className="flex items-start">
        {Icon && <Icon className="text-gray-400 mr-2 mt-1 flex-shrink-0" />}
        <span className="font-semibold text-gray-600 min-w-[120px]">{label}:</span>
        <span className={`text-gray-900 ${highlight ? 'font-extrabold text-lg' : ''}`}>{value}</span>
    </div>
);

function AdminOrderDetail({ token }) {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [orderId, token]);

  async function fetchOrder() {
    setLoading(true);
    try {
      const res = await axios.get(`${config.backendUrl}/api/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
      setNewStatus(res.data.status);
      setError("");
    } catch (e) {
      setError("Failed to load order details.");
    }
    setLoading(false);
  }

  // --- NEW: UPDATE ORDER STATUS ---
  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await axios.put(
        `${config.backendUrl}/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh local order data
      setOrder({ ...order, status: newStatus });
      alert("Order status updated successfully!");
    } catch (e) {
      alert("Failed to update status. Ensure your backend route exists.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <FaSpinner className="animate-spin text-4xl text-green-600" />
      <p className="mt-4 text-xl text-gray-500">Loading order data...</p>
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10">
      <FaBoxOpen className="text-6xl mb-4 text-red-500" />
      <p className="text-xl font-semibold text-red-700">{error || "Order not found."}</p>
      <Link to="/admin/orders" className="mt-8 text-green-600 border border-green-600 p-3 rounded-lg"><FaArrowLeft className="inline mr-2"/>Back</Link>
    </div>
  );

  const { userId, shippingAddress, status, orderDate, totalAmount, items, paymentInfo } = order;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order #{order._id.slice(-8).toUpperCase()}</h1>
            <p className="text-sm text-gray-500">{new Date(orderDate).toLocaleString()}</p>
          </div>
          <Link to="/admin/orders" className="mt-4 sm:mt-0 text-sm font-bold text-gray-600 flex items-center gap-2 hover:text-green-600 transition">
            <FaArrowLeft /> Back to List
          </Link>
        </div>

        {/* --- VISUAL TIMELINE --- */}
        <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 overflow-x-auto">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Order Timeline</h3>
          <div className="flex items-center justify-between min-w-[600px] relative">
            {/* Timeline Line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
            
            {["Pending", "Processing", "Shipped", "Delivered"].map((step, idx) => {
              const isActive = statusOptions.indexOf(status) >= statusOptions.indexOf(step);
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isActive ? 'bg-green-600 border-green-200 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                    <FaCheckCircle />
                  </div>
                  <span className={`mt-2 text-xs font-bold ${isActive ? 'text-green-800' : 'text-gray-400'}`}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Update & Info KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Change Status</p>
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-2 block w-full p-2 bg-gray-50 border rounded-lg font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-green-500"
              >
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <button 
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === status}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {updating ? <FaSpinner className="animate-spin" /> : <FaSave />} Save Status
            </button>
          </div>

          <div className="bg-green-600 p-6 rounded-xl shadow-md text-white">
            <p className="text-xs font-bold uppercase opacity-80">Total Revenue</p>
            <p className="text-3xl font-black mt-1">₹{totalAmount?.toFixed(2)}</p>
            <div className="mt-2 inline-block px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold">
              {paymentInfo?.isPaid ? "PAID" : "UNPAID"}
            </div>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <DetailCard title="Customer Information" icon={FaUser}>
            <DetailItem label="Name" value={userId?.name || "Guest"} />
            <DetailItem label="Email" value={userId?.email || "N/A"} />
            <DetailItem label="Phone" value={shippingAddress?.mobile || "N/A"} />
          </DetailCard>

          <DetailCard title="Shipping Address" icon={FaTruck}>
            <p className="font-bold text-gray-800">{shippingAddress?.street}</p>
            <p className="text-gray-600">{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zip}</p>
            <p className="text-gray-600">{shippingAddress?.country}</p>
          </DetailCard>
        </div>

        {/* Product Items */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b font-bold text-gray-700 flex items-center gap-2">
            <FaShoppingCart className="text-green-600" /> Products Ordered
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-500 text-[10px] uppercase tracking-widest">
                <th className="p-4">Item</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items?.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-800">{item.name}</td>
                  <td className="p-4 text-center text-gray-600">{item.qty}</td>
                  <td className="p-4 text-right text-gray-600">₹{item.price?.toFixed(2)}</td>
                  <td className="p-4 text-right font-black text-green-700">₹{(item.qty * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetail;