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

  const commonLinkClasses = "px-3 py-2 border-b-4 transition-all duration-300 font-semibold text-lg";
  // Festive colors: Red for active, Dark Green/White/Gold for inactive
  const activeLinkClasses = "border-red-600 text-red-700 font-extrabold";
  const inactiveLinkClasses = "border-transparent text-green-800 hover:border-green-600 hover:text-green-900";

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 shadow-2xl border-b-4 border-red-600/30 flex items-center px-4 sm:px-8 py-2 z-50 backdrop-blur-sm min-h-[90px]">
      {/* Left: Navigation Links for Desktop */}
      <div className="hidden md:flex gap-8 items-center flex-1">
        <Link
          to="/"
          className="text-3xl font-extrabold text-green-800 hover:text-red-700 transition"
        >
          Fruit <span className="text-red-600">Elegance 🎄</span>
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
          About Us
        </Link>
      </div>

      {/* Center: Logo for Mobile/Desktop */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        <Link to="/">
          <img
            src="/images/felogo1.png"
            alt="Fruit Elegance Logo"
            className="w-24 h-24 object-contain drop-shadow-md min-w-[72px] min-h-[72px] transform transition-transform duration-300 hover:scale-105"
            draggable={false}
          />
        </Link>
      </div>


      {/* Right: Cart/Profile/Authentication for Desktop and Mobile */}
      <div className="flex items-center gap-4 sm:gap-8 flex-1 justify-end">
        <Link
          to="/cart"
          aria-label="Cart"
          className="relative text-red-600 hover:text-red-800 transition p-2 rounded-full hover:bg-red-50"
        >
          <FaShoppingCart size={28} />
          {cartQty > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-700 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">
              {cartQty}
            </span>
          )}
        </Link>
        {token ? (
          <>
            <Link
              to="/profile"
              className="text-green-800 font-bold hover:text-red-600 transition flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
            >
              <FaUser size={20} />
              <span className="hidden md:inline">Profile</span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-800 font-bold transition p-2 rounded-lg border-2 border-red-600 hover:bg-red-600 hover:text-white"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-green-800 font-bold hover:text-red-600 transition flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
            >
                <FaSignInAlt size={20} />
                <span className="hidden md:inline">Login</span>
            </Link>
            <Link
              to="/signup"
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition shadow-md hidden md:flex items-center gap-2"
            >
                <FaUserPlus size={20} />
                Signup
            </Link>
          </>
        )}

        {/* Mobile menu button on the far right */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-green-700 p-2 text-2xl md:hidden"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu - Styling modernized and festive colors */}
      {isMobileMenuOpen && (
        <div className="absolute top-[90px] left-0 w-full min-h-[calc(100vh-90px)] bg-white/95 backdrop-blur-md p-8 flex flex-col items-center shadow-2xl md:hidden transition-all duration-300 transform origin-top border-t-4 border-red-600">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center py-5 text-2xl font-extrabold text-green-800 hover:bg-red-50 border-b border-gray-200 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/about"
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full text-center py-5 text-2xl font-extrabold text-green-800 hover:bg-red-50 border-b border-gray-200 transition-colors"
          >
            About Us
          </Link>
          {token ? (
            <>
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-5 text-2xl font-extrabold text-green-800 hover:bg-red-50 border-b border-gray-200 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-center py-5 text-2xl font-extrabold text-red-600 hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-5 text-2xl font-extrabold text-green-800 hover:bg-red-50 border-b border-gray-200 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-5 text-2xl font-extrabold text-red-600 hover:bg-red-50 transition-colors"
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