import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaSpinner, FaBoxOpen } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const placeholderImage = "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

function OrderDetail() {
  const { orderId } = useParams();
  const { token } = useContext(AuthContext);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/orders/${orderId}`, {
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
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <FaSpinner className="mr-3 animate-spin text-2xl" /> Loading order...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-500">
        <FaBoxOpen className="text-5xl mb-2" />
        {error || "Order not found."}
        <Link to="/profile/orders" className="mt-6 text-green-600 hover:underline font-semibold flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Orders
        </Link>
      </div>
    );
  }

  const { shippingAddress, status, orderDate, totalAmount, items, paymentInfo } = order;

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <Link to="/profile/orders" className="text-green-600 hover:underline flex items-center font-semibold">
            <FaArrowLeft className="mr-2" /> Back
          </Link>
        </div>

        <div>
          <h2 className="font-bold text-green-700 mb-2">Order Info</h2>
          <div className="mb-2">
            <span className="font-semibold">Order ID:</span> <span className="font-mono">{order._id}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Date:</span> {new Date(orderDate).toLocaleString()}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Status:</span>{" "}
            <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-700 font-medium">{status}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Total Amount:</span> <span className="font-bold">₹{totalAmount?.toFixed(2)}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Payment Method:</span> {paymentInfo?.method || "N/A"}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Payment Status:</span> {paymentInfo ? "Paid" : "N/A"}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-green-700 mb-2">Shipping Address</h2>
          <div className="mb-1">{shippingAddress?.street}</div>
          <div className="mb-1">
            {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.zip}
          </div>
          <div className="mb-1">{shippingAddress?.country}</div>
          <div className="mb-1 font-semibold">Phone: {shippingAddress?.mobile || "N/A"}</div>
        </div>

        <div>
          <h2 className="font-bold text-green-700 mb-4">Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border border-gray-200 rounded">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-2 text-gray-600 font-semibold text-sm">Product</th>
                  <th className="p-2 text-gray-600 font-semibold text-sm">Quantity</th>
                  <th className="p-2 text-gray-600 font-semibold text-sm">Price</th>
                  <th className="p-2 text-gray-600 font-semibold text-sm">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-500">
                      No items found
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-2">{item.name || "Product"}</td>
                      <td className="p-2">{item.qty}</td>
                      <td className="p-2">₹{item.price?.toFixed(2)}</td>
                      <td className="p-2 font-semibold">₹{(item.qty * item.price).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
