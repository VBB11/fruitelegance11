// src/components/AdminLayout.js
import React from "react";
import AdminNav from "./AdminNav";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xl font-bold">
          Fruit Elegance Admin Panel
        </div>
      </header>

      {/* Admin top navigation */}
      <AdminNav />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;
