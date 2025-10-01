import React, { useState, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { FaBars, FaTimes, FaShoppingCart, FaUser, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

function Navbar() {
  const { cart } = useCart();
  const { token, logout } = useContext(AuthContext);
  const cartQty = cart.reduce((total, item) => total + (item.qty || 1), 0);
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const commonLinkClasses = "px-3 py-2 border-b-2 transition-colors";
  const activeLinkClasses = "border-green-600 text-green-700 font-bold";
  const inactiveLinkClasses = "border-transparent text-gray-700 hover:border-green-300 hover:text-green-800";

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 shadow-lg border-b border-green-100 flex items-center px-4 sm:px-8 py-3 z-50 backdrop-blur-sm min-h-[80px]">
      {/* Left: Navigation Links for Desktop */}
      <div className="hidden md:flex gap-8 items-center flex-1">
        <Link
          to="/"
          className="text-2xl font-extrabold text-green-700 hover:text-green-900 transition"
        >
          Fruit Elegance
        </Link>
        <Link
          to="/"
          className={`${commonLinkClasses} ${location.pathname === '/' ? activeLinkClasses : inactiveLinkClasses}`}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`${commonLinkClasses} ${location.pathname === '/about' ? activeLinkClasses : inactiveLinkClasses}`}
        >
          AbouT
        </Link>
      </div>

      {/* Center: Logo for Mobile */}
      <div className="flex-1 flex justify-start md:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-green-700 p-2 text-xl"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        <Link to="/">
          <img
            src="/images/felogo.png"
            alt="Fruit Elegance Logo"
            className="w-20 h-20 object-contain drop-shadow-sm min-w-[72px] min-h-[72px]"
            draggable={false}
          />
        </Link>
      </div>


      {/* Right: Cart/Profile/Authentication for Desktop and Mobile */}
      <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
        <Link
          to="/cart"
          aria-label="Cart"
          className="relative text-green-700 hover:text-green-900 transition"
        >
          <FaShoppingCart size={24} />
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
              className="text-green-700 font-semibold hover:underline hover:text-green-900 transition flex items-center gap-2"
            >
              <FaUser size={18} />
              <span className="hidden md:inline">Profile</span>
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
              className="text-green-700 font-semibold hover:underline hover:text-green-900 transition flex items-center gap-2"
            >
                <FaSignInAlt size={18} />
                <span className="hidden md:inline">Login</span>
            </Link>
            <Link
              to="/signup"
              className="text-green-700 font-semibold hover:underline hover:text-green-900 transition flex items-center gap-2"
            >
                <FaUserPlus size={18} />
                <span className="hidden md:inline">Signup</span>
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu - Shown only when isMobileMenuOpen is true */}
      {isMobileMenuOpen && (
        <div className="absolute top-[80px] left-0 w-full min-h-[calc(100vh-80px)] bg-white p-8 flex flex-col items-center shadow-lg md:hidden">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center py-4 text-2xl font-bold border-b border-gray-200"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center py-4 text-2xl font-bold border-b border-gray-200"
          >
            About
          </Link>
          {token ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-4 text-2xl font-bold border-b border-gray-200"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-center py-4 text-2xl font-bold text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-4 text-2xl font-bold border-b border-gray-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-4 text-2xl font-bold"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;