// src/components/AdminLayout.js
import React from 'react';

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-green-700 text-white p-4 text-xl font-bold shadow">
        Fruit Elegance Admin Panel
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

export default AdminLayout;
