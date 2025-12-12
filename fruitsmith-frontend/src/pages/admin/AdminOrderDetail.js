import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaSpinner, FaBoxOpen, FaUser, FaTruck, FaShoppingCart, FaCreditCard, FaCalendarAlt } from "react-icons/fa";
import config from "../config/config";

// --- Utility Functions ---

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
    <span 
      className={`inline-block px-3 py-1 text-sm rounded-full font-bold shadow-md ${color}`}
    >
      {status}
    </span>
  );
};

// --- Helper Components ---

const DetailCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
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


// --- Main Component ---

function AdminOrderDetail({ token }) {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      try {
        const res = await axios.get(`${config.backendUrl}/api/admin/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
        setError("");
      } catch (e) {
        setError("Failed to load order details.");
      }
      setLoading(false);
    }
    if (token && orderId) {
      fetchOrder();
    }
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <FaSpinner className="mr-3 animate-spin text-4xl text-green-600" /> 
        <p className="mt-4 text-xl">Loading order data...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-10">
        <FaBoxOpen className="text-6xl mb-4 text-red-500" />
        <p className="text-xl font-semibold text-red-700">{error || "Order not found."}</p>
        <Link to="/admin/orders" className="mt-8 text-green-600 hover:text-green-700 font-bold flex items-center p-3 rounded-lg border border-green-600 transition-colors">
          <FaArrowLeft className="mr-2" /> Back to Orders List
        </Link>
      </div>
    );
  }

  const { userId, shippingAddress, status, orderDate, totalAmount, items, paymentInfo } = order;
  const paymentStatus = paymentInfo?.isPaid ? "Paid" : "Pending/Unpaid";
  const paymentStatusColor = paymentInfo?.isPaid ? "bg-green-500" : "bg-red-500";


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-6 md:p-10 space-y-8">
        
        {/* Header & Order ID */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-extrabold text-gray-900">Order #{order._id.slice(0, 8)}...</h1>
            <p className="text-sm text-gray-500 mt-1">Full ID: <span className="font-mono text-xs">{order._id}</span></p>
          </div>
          <Link 
            to="/admin/orders" 
            className="text-white bg-gray-700 hover:bg-gray-800 flex items-center font-semibold px-4 py-2 rounded-lg transition-colors shadow-md"
          >
            <FaArrowLeft className="mr-2 text-sm" /> Manage Orders
          </Link>
        </div>

        {/* Top KPIs (Total & Status) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Order Status */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-inner border-l-4 border-green-500">
                <p className="text-sm text-gray-600 font-medium">Order Status</p>
                <div className="mt-2">{getStatusBadge(status)}</div>
            </div>

            {/* Payment Status */}
            <div className="bg-gray-100 p-4 rounded-lg shadow-inner border-l-4 border-gray-500">
                <p className="text-sm text-gray-600 font-medium">Payment</p>
                <span 
                    className={`mt-2 inline-block px-3 py-1 text-sm rounded-full font-bold shadow-sm ${paymentStatusColor} text-white`}
                >
                    {paymentStatus}
                </span>
            </div>
            
            {/* Total Amount */}
            <div className="bg-green-50 p-4 rounded-lg shadow-md border-l-4 border-green-600">
                <p className="text-sm text-green-700 font-medium">Total Revenue</p>
                <p className="text-3xl font-extrabold text-green-900 mt-1">
                    ₹{totalAmount?.toFixed(2) || '0.00'}
                </p>
            </div>
        </div>


        {/* Customer, Shipping, and Payment Details */}
        <div className="grid md:grid-cols-2 gap-6">
            
            {/* Customer Info */}
            <DetailCard title="Customer Information" icon={FaUser}>
                <DetailItem label="Customer Name" value={userId?.name || "N/A"} />
                <DetailItem label="Email" value={userId?.email || "N/A"} />
                <DetailItem label="Order Date" value={new Date(orderDate).toLocaleString()} icon={FaCalendarAlt} />
            </DetailCard>

            {/* Shipping & Payment */}
            <div className="space-y-6">
                
                <DetailCard title="Shipping Address" icon={FaTruck}>
                    <div className="text-gray-900 font-medium">{shippingAddress?.street}</div>
                    <div className="text-gray-700">{shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zip}</div>
                    <div className="text-gray-700">{shippingAddress?.country}</div>
                    <DetailItem label="Phone" value={shippingAddress?.mobile || "N/A"} />
                </DetailCard>

                <DetailCard title="Payment Details" icon={FaCreditCard}>
                    <DetailItem label="Method" value={paymentInfo?.method || "N/A"} />
                    <DetailItem label="Transaction ID" value={paymentInfo?.transactionId || "N/A"} />
                    <DetailItem label="Total Paid" value={`₹${totalAmount?.toFixed(2) || '0.00'}`} highlight={true} />
                </DetailCard>
            </div>
        </div>

        {/* Product Items Table */}
        <DetailCard title="Products Ordered" icon={FaShoppingCart}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    <th className="p-3 text-gray-700 font-bold text-sm uppercase tracking-wider">Product</th>
                    <th className="p-3 text-gray-700 font-bold text-sm uppercase tracking-wider text-center">Qty</th>
                    <th className="p-3 text-gray-700 font-bold text-sm uppercase tracking-wider text-right">Unit Price</th>
                    <th className="p-3 text-gray-700 font-bold text-sm uppercase tracking-wider text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-500">
                        No items found in this order.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={index} className="hover:bg-green-50 transition-colors">
                        <td className="p-3 font-medium text-gray-800">{item.name || "Product Name"}</td>
                        <td className="p-3 text-center">{item.qty}</td>
                        <td className="p-3 text-right">₹{item.price?.toFixed(2)}</td>
                        <td className="p-3 font-extrabold text-right text-green-700">₹{(item.qty * item.price).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </DetailCard>
      </div>
    </div>
  );
}

export default AdminOrderDetail;