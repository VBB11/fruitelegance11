// src/pages/Orders.js

import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaBoxOpen, FaSpinner, FaTimesCircle, FaRegSadTear, FaCheckCircle, FaTruck, FaClipboardList, FaBox, FaHome } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import dayjs from "dayjs";
import config from "./config/config";

const placeholderImage = "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

// --- Order Stepper Component Logic (now inside Orders.js) ---

const orderSteps = [
  { name: "Order Placed", status: "Placed", icon: FaBox },
  { name: "Confirmed", status: "Processing", icon: FaClipboardList },
  { name: "Shipped", status: "Shipped", icon: FaTruck },
  { name: "Delivered", status: "Delivered", icon: FaHome },
];

function OrderStepper({ currentStatus }) {
  const currentStepIndex = orderSteps.findIndex(
    (step) => step.status === currentStatus
  );

  return (
    <div className="relative flex items-center justify-between w-full mt-8 mb-4 px-4 md:px-0">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 transform -translate-y-1/2 rounded-full" />
      {/* Progress Line */}
      <div
        style={{
          width: `${(currentStepIndex / (orderSteps.length - 1)) * 100}%`,
        }}
        className="absolute top-1/2 left-0 h-1 bg-green-500 transform -translate-y-1/2 transition-all duration-700 ease-in-out rounded-full"
      />

      {orderSteps.map((step, index) => {
        const isActive = index <= currentStepIndex;
        const Icon = step.icon;
        
        return (
          <div
            key={index}
            className="flex flex-col items-center flex-1 z-10"
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-500 ${
                isActive
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-white border-gray-300 text-gray-400"
              }`}
            >
              <Icon size={16} />
            </div>
            <p
              className={`mt-2 text-center text-xs md:text-sm font-semibold whitespace-nowrap transition-colors duration-500 ${
                isActive ? "text-green-700" : "text-gray-500"
              }`}
            >
              {step.name}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// --- Main Orders Component ---

export default function Orders() {
  const { token } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      if (!token) {
        setError("Please log in to view your orders.");
        setLoading(false);
        return;
      }
      try {
        setError("");
        const API_URL = process.env.REACT_APP_API_URL || config.backendUrl || 'http://localhost:4000';
        const response = await axios.get(`${API_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data || []);
      } catch (err) {
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [token]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-xl text-green-700 flex-col">
        <FaSpinner className="animate-spin text-4xl mb-3" />
        <span className="font-semibold">Loading your orders...</span>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen text-red-600 text-xl flex-col">
        <FaTimesCircle className="text-4xl mb-4" />
        <span className="font-semibold">{error}</span>
      </div>
    );
  if (!orders.length)
    return (
      <div className="text-center mt-20 text-gray-600 p-6">
        <FaRegSadTear size={64} className="mx-auto mb-6 text-green-400" />
        <p className="text-3xl font-bold text-gray-800 mb-4">You have no orders yet.</p>
        <p className="text-lg text-gray-600 mb-8">Start your shopping adventure and place your first order!</p>
        <Link
          to="/"
          className="bg-green-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Start Shopping
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen bg-gray-50 font-sans">
      <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-12 text-center select-none tracking-tight">
        My Orders
      </h1>
      <ul className="space-y-8">
        {orders.map((order) => (
          <li
            key={order._id}
            className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Order <span className="text-green-600">#{order._id.substring(0, 8)}...</span>
                </h2>
                <p className="text-sm text-gray-500">
                  Placed on:{" "}
                  <span className="font-medium text-gray-700">
                    {dayjs(order.createdAt || order.orderDate).format("MMM D, YYYY h:mm A")}
                  </span>
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  to={`/profile/orders/${order._id}`}
                  className="text-green-600 hover:underline font-semibold"
                >
                  View Full Details →
                </Link>
              </div>
            </div>

            {/* Order Stepper Timeline */}
            <OrderStepper currentStatus={order.status} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-8">
              {/* Order Summary */}
              <div className="col-span-2">
                <p className="text-2xl font-bold text-gray-900 mb-4">
                  Order Summary
                </p>
                <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-200">
                  <p className="text-lg text-gray-700 font-semibold mb-2">
                    Total Amount:{" "}
                    <span className="text-green-700 text-2xl font-bold">
                      ₹{order.totalAmount?.toFixed(2) ?? "0.00"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Inclusive of all taxes and shipping.
                  </p>
                </div>
                {order.items && order.items.length ? (
                  <ul className="max-h-80 overflow-y-auto space-y-4 pr-2">
                    {order.items.map((item, idx) => (
                      <li
                        key={item.productId ? item.productId : idx}
                        className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-200"
                      >
                        <img
                          src={item.image || placeholderImage}
                          alt={item.name || "Product image"}
                          className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-lg text-gray-800">{item.name || "Unknown Product"}</p>
                          <p className="text-sm text-gray-500 truncate">
                            {item.category ? `Category: ${item.category}` : "No category"}
                          </p>
                          <p className="text-sm font-semibold text-gray-600 mt-1">
                            Qty: {item.qty ?? "0"} | Price: ₹{item.price?.toFixed(2) ?? "0.00"}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-gray-500 text-center py-6">No items in this order.</p>
                )}
              </div>

              {/* Order Details Image/Icon */}
              <div className="flex flex-col items-center justify-center bg-green-50 p-6 rounded-3xl shadow-inner border border-green-100">
                <div className="w-full flex justify-center mb-6">
                  {order.items && order.items.length && order.items[0].image ? (
                    <img
                      src={order.items[0].image}
                      alt={order.items[0].name}
                      className="w-full h-auto max-w-sm rounded-xl object-contain border-4 border-white shadow-md transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <FaBoxOpen size={112} className="text-green-200" />
                  )}
                </div>
                <Link
                  to={`/profile/orders/${order._id}`}
                  className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors duration-300 text-center w-full shadow-md"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}