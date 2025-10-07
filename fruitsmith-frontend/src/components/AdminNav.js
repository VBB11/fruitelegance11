// src/components/AdminNav.js
import React from "react";
import { NavLink } from "react-router-dom";

function AdminNav() {
  const base = "px-4 py-2 rounded-md transition-colors";
  const active = "bg-green-700 text-white";
  const idle = "text-green-800 hover:bg-green-100";

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
          end
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/categories"
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          Categories
        </NavLink>
        <NavLink
          to="/admin/banners"
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          Banners
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          Products
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `${base} ${isActive ? active : idle}`}
        >
          Orders
        </NavLink>
      </div>
    </nav>
  );
}

export default AdminNav;
