import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import ProfileDashboard from "./pages/ProfileDashboard";
import UserProfile from "./pages/UserProfile";
import Favourites from "./pages/Favourites";
import Orders from "./pages/Orders";
import Addresses from "./pages/Addresses";
import Settings from "./pages/Settings";

import AdminProfile from "./pages/AdminProfile";

import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import ProductList from "./pages/admin/ProductList";
import ProductForm from "./pages/admin/ProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import Banners from "./pages/admin/Banners"; // NEW

import OrderDetail from "./pages/OrderDetail";

import AdminRoute from "./components/AdminRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import CategoryPage from "./pages/CategoryPage";

import { CartProvider } from "./context/CartContext";

function AppRoutes() {
  const { token, user, loading } = useContext(AuthContext); // ensure AuthContext exposes loading/hydration
  const isAuthenticated = !!token;
  const isAdmin = user?.role === "admin";

  // Prevent redirect flicker while auth is still hydrating
  if (loading) {
    return (
      <div className="pt-16 flex items-center justify-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <CartProvider>
      <div className="pt-16">
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          {/* Backward compatibility for existing categoryName routes */}
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          {/* Preferred slug route (use this in new links) */}
          <Route path="/c/:categorySlug" element={<CategoryPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <Login />
              ) : isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/profile" replace />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !isAuthenticated ? (
                <Signup />
              ) : isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/profile" replace />
              )
            }
          />

          {/* Forgot Password Routes */}
          <Route
            path="/forgot-password"
            element={
              !isAuthenticated ? (
                <ForgotPassword />
              ) : isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/profile" replace />
              )
            }
          />
          <Route
            path="/reset-password"
            element={
              !isAuthenticated ? (
                <ResetPassword />
              ) : isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/profile" replace />
              )
            }
          />

          {/* User Protected Routes */}
          <Route
            path="/profile/*"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated && !isAdmin}>
                <ProfileDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserProfile />} />
            <Route path="favourites" element={<Favourites />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Admin Login */}
          <Route
            path="/admin/login"
            element={
              !isAuthenticated || !isAdmin ? (
                <AdminLogin />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/profile"
            element={
              <AdminRoute isAuthenticated={isAuthenticated && isAdmin}>
                <AdminProfile />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute isAuthenticated={isAuthenticated && isAdmin}>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminRoute isAuthenticated={isAuthenticated && isAdmin}>
                <Categories />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/banners" // NEW
            element={
              <AdminRoute isAuthenticated={isAuthenticated && isAdmin}>
                <Banners />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products"
            element={
              <AdminRoute isAuthenticated={isAuthenticated && isAdmin}>
                <ProductList />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <AdminRoute isAuthenticated={isAuthenticated && isAdmin}>
                <ProductForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/products/edit/:id"
            element={
              <AdminRoute isAuthenticated={isAuthenticated && isAdmin}>
                <ProductForm />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute isAuthenticated={isAuthenticated && isAdmin}>
                <AdminOrders token={token} />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/orders/:orderId"
            element={
              <AdminRoute isAuthenticated={isAuthenticated && isAdmin}>
                <AdminOrderDetail token={token} />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
    </CartProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
