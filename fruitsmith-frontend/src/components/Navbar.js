import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const { cart } = useCart();
  const { token, logout } = useContext(AuthContext);
  const cartQty = cart.reduce((total, item) => total + (item.qty || 1), 0);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 shadow-lg border-b border-green-100 flex items-center px-8 py-3 z-50 backdrop-blur min-h-[80px]">
      {/* Left: Navigation Links */}
      <div className="flex gap-8 items-center flex-1">
        <Link
          to="/"
          className="hidden md:inline text-2xl font-extrabold text-green-700 hover:text-green-900 transition"
        >
          Fruit Elegance
        </Link>
        <Link
          to="/"
          className={`px-3 py-2 border-b-2 ${
            location.pathname === '/'
              ? 'border-green-600 text-green-700 font-bold'
              : 'border-transparent text-gray-700 hover:border-green-300 hover:text-green-800'
          } transition`}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`px-3 py-2 border-b-2 ${
            location.pathname === '/about'
              ? 'border-green-600 text-green-700 font-bold'
              : 'border-transparent text-gray-700 hover:border-green-300 hover:text-green-800'
          } transition`}
        >
          About
        </Link>
      </div>

      {/* Center: Logo */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
  <Link to="/">
    <img
      src="/images/felogo.png"
      alt="Fruit Elegance Logo"
      className="w-27 h-27 md:w-28 md:h-28 object-contain drop-shadow-sm"
      style={{ minWidth: 72, minHeight: 72 }}
      draggable={false}
    />
  </Link>
</div>


      {/* Right: Cart/Profile/Authentication */}
      <div className="flex items-center gap-6 flex-1 justify-end">
        <Link
          to="/cart"
          aria-label="Cart"
          className="relative hover:text-green-900 transition text-green-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7M7 13l-1.5 7.5M16 13l1.5 7.5M6 21h12" />
          </svg>
          {cartQty > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full px-2 text-xs font-bold">
              {cartQty}
            </span>
          )}
        </Link>
        {token ? (
          <>
            <Link
              to="/profile"
              className="text-green-700 font-semibold hover:underline hover:text-green-900 transition"
            >
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-semibold transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-green-700 font-semibold hover:underline hover:text-green-900 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-green-700 font-semibold hover:underline hover:text-green-900 transition"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
