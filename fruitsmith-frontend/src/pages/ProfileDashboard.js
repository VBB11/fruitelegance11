import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { FaUserCircle, FaHeart, FaClipboardList, FaMapMarkerAlt, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';


// Array of navigation items for easy management and scalability
const navItems = [
  { name: 'Profile', path: '/profile', icon: <FaUserCircle /> },
  { name: 'Favourites', path: '/profile/favourites', icon: <FaHeart /> },
  { name: 'Orders', path: '/profile/orders', icon: <FaClipboardList /> },
  { name: 'Addresses', path: '/profile/addresses', icon: <FaMapMarkerAlt /> },
  { name: 'Account Settings', path: '/profile/settings', icon: <FaCog /> },
];

function ProfileDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    const activeItem = navItems.find(item => item.path === pathname);
    return activeItem ? activeItem.name : 'Dashboard';
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle Button */}
      <div className="md:hidden p-4 bg-white shadow-sm flex justify-between items-center">
        <h2 className="text-xl font-bold text-green-700">My Account</h2>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-700 p-2 rounded-md hover:bg-gray-200"
        >
          {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-white shadow-xl z-20 md:z-auto p-6 flex flex-col`}
      >
        <h2 className="text-2xl font-bold mb-8 text-green-800 hidden md:block">My Account</h2>
        <nav className="flex-1 flex flex-col space-y-2">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-green-100 text-green-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
              onClick={() => setIsSidebarOpen(false)} // Close sidebar on mobile after clicking a link
            >
              {item.icon}
              <span className="text-lg">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        {/* Logout Link */}
        <Link 
          to="/logout" 
          className="mt-8 flex items-center space-x-3 text-red-600 hover:bg-red-50 hover:text-red-800 px-4 py-3 rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt />
          <span className="text-lg font-semibold">Logout</span>
        </Link>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 border-b pb-4">
            {getPageTitle(location.pathname)}
          </h1>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default ProfileDashboard;