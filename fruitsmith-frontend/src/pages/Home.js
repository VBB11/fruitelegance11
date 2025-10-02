import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaEye, FaTimes, FaSeedling, FaHandshake, FaMoneyCheckAlt, FaLock } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import config from "./config/config";

const placeholderImage =
  "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

const banners = [
  {
    id: 1,
    img: "https://deq64r0ss2hgl.cloudfront.net/images/product/dry-fruits-gift-boxes-hampers-14465093981690.png",
    title: "Luxury Hampers for a Brighter Diwali",
    label: "Shop Now",
    link: "/category/diwali",
  },
  {
    id: 2,
    img: "https://www.fruitsmith.com/pub/media/wysiwyg/wcg-25-11.jpg",
    title: "Fresh Juicy Fruits",
    label: "Explore",
    link: "/category/fruits",
  },
  {
    id: 3,
    img: "https://www.fruitsmith.com/pub/media/wysiwyg/dw-25-2.jpg",
    title: "Healthy Combos",
    label: "Get Yours",
    link: "/category/combos",
  },
];

const categories = [
  {
    label: "Everyday Fruits",
    image: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png",
    bg: "bg-yellow-50",
  },
  {
    label: "Tropical Fruits",
    image: "https://cdn-icons-png.flaticon.com/512/590/590779.png",
    bg: "bg-orange-50",
  },
  {
    label: "Dried Fruits & Nuts",
    image: "https://cdn-icons-png.flaticon.com/512/1625/1625048.png",
    bg: "bg-amber-50",
  },
  {
    label: "Fruit Gift Boxes or Combos",
    image: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
    bg: "bg-pink-50",
  },
  {
    label: "Seasonal Fruits",
    image: "https://cdn-icons-png.flaticon.com/512/4155/4155886.png",
    bg: "bg-green-50",
  },
  {
    label: "Exotic Fruits",
    image: "https://cdn-icons-png.flaticon.com/512/2909/2909837.png",
    bg: "bg-purple-50",
  },
];

const whyChooseUsFeatures = [
  { icon: FaSeedling, text: "100% Freshness", color: "text-green-700", desc: "Our fruits are hand-picked daily for peak freshness." },
  { icon: FaHandshake, text: "Ethical Sourcing", color: "text-amber-700", desc: "We partner with local farms to ensure fair trade practices." },
  { icon: FaMoneyCheckAlt, text: "Best Price", color: "text-blue-700", desc: "We offer premium quality fruits at the most competitive prices." },
  { icon: FaLock, text: "Secure Payments", color: "text-purple-700", desc: "Your transactions are protected with the highest level of security." },
];

function Categories({ selectedCategory, onSelectCategory }) {
  return (
    <section className="max-w-7xl mx-auto rounded-2xl bg-white shadow-md py-8 px-4 sm:px-6 my-10 relative z-30">
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-gray-900 text-center">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-6">
        {categories.map(({ label, image, bg }) => (
          <button
            key={label}
            onClick={() => onSelectCategory(selectedCategory === label ? null : label)}
            className={`flex flex-col items-center rounded-xl ${bg} p-3 sm:p-5 cursor-pointer transition ${
              selectedCategory === label ? "ring ring-green-400 ring-offset-2" : "hover:shadow-xl"
            }`}
            aria-pressed={selectedCategory === label}
          >
            <img src={image} alt={label} className="w-12 h-12 sm:w-16 sm:h-16 mb-2 object-contain" loading="lazy" />
            <span className="text-center text-sm sm:text-base font-medium">{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

const QuickViewModal = ({ product, onClose, handleAdd }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full mx-4 shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
          <FaTimes size={24} />
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex items-center justify-center">
            <img src={product.image || placeholderImage} alt={product.name} className="w-full h-auto max-h-64 object-contain" />
          </div>
          <div className="flex-1 flex flex-col justify-center text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-green-800 mb-2">{product.name}</h3>
            <p className="text-lg sm:text-xl font-semibold text-green-900 mb-4">₹{product.price}</p>
            <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
            <button onClick={() => handleAdd(product)} className="bg-green-800 text-white rounded-full py-3 font-semibold hover:bg-green-900 transition-colors">
              Add to Cart
            </button>
            <Link to={`/product/${product._id}`} className="mt-2 text-center text-green-700 hover:underline">
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, getQuantity, handleAdd, handleRemove, toggleFavorite, favorites, onQuickView }) => {
  const qty = getQuantity(product._id);
  const isFavorite = favorites.includes(product._id);
  const isNew = product.isNew || false;
  const isBestSeller = product.isBestSeller || false;

  const [isHovering, setIsHovering] = useState(false);

  return (
    <article
      key={product._id}
      className="bg-white rounded-3xl shadow-md border border-gray-200 cursor-default select-none relative flex flex-col transition-all duration-300 transform hover:scale-[1.02]"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={() => toggleFavorite(product._id)}
        className="absolute top-4 right-4 z-10 text-red-600 hover:text-red-700 transition-colors"
      >
        {isFavorite ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
      </button>

      {isNew && (
        <span className="absolute top-4 left-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          New
        </span>
      )}
      {isBestSeller && (
        <span className="absolute top-4 left-4 z-10 bg-yellow-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
          Best Seller
        </span>
      )}

      {isHovering && (
        <button
          onClick={() => onQuickView(product)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white text-green-800 px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition hidden md:block"
        >
          <FaEye className="inline-block mr-2" /> Quick View
        </button>
      )}

      <Link to={`/product/${product._id}`} className="block p-4 pt-8 flex-grow">
        <img
          src={product.image || placeholderImage}
          alt={product.name}
          className="w-full h-36 sm:h-52 object-contain rounded-3xl mb-4"
          loading="lazy"
        />
        <h3 className="text-xl sm:text-2xl font-bold text-green-800 text-center">
          {product.name}
        </h3>
        <p className="text-center text-gray-600 mt-2 line-clamp-3">
          {product.description}
        </p>
        <p className="text-center text-green-900 text-lg sm:text-xl font-extrabold mt-3">
          ₹{product.price}
        </p>
      </Link>

      {qty === 0 ? (
        <button
          onClick={() => handleAdd(product)}
          className="bg-green-800 text-white rounded-b-3xl py-3 font-semibold hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        >
          Add to Cart
        </button>
      ) : (
        <div className="bg-green-800 text-white rounded-b-3xl py-3 flex items-center justify-center gap-3">
          <button
            onClick={() => handleRemove(product._id)}
            className="bg-green-900 p-2 rounded-full hover:bg-green-950 transition-colors"
          >
            −
          </button>
          <span className="font-bold text-xl">{qty}</span>
          <button
            onClick={() => handleAdd(product)}
            className="bg-green-900 p-2 rounded-full hover:bg-green-950 transition-colors"
          >
            +
          </button>
        </div>
      )}
    </article>
  );
};

const leftPanti = (
  <img
    src="/images/firepanti.png"
    alt="Diwali Fire Panti"
    className="hidden lg:block fixed left-0 top-[400px] w-[180px] h-[calc(100vh-400px)] object-contain pointer-events-none z-10"
  />
);

const rightPanti = (
  <img
    src="/images/firepanti.png"
    alt="Diwali Fire Panti"
    className="hidden lg:block fixed right-0 top-[400px] w-[180px] h-[calc(100vh-400px)] object-contain pointer-events-none z-10"
    style={{ transform: "scaleX(-1)" }}
  />
);

export default function Home() {
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [error, setError] = useState("");
  const [popup, setPopup] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const fav = localStorage.getItem("favorites");
      return fav ? JSON.parse(fav) : [];
    } catch {
      return [];
    }
  });
  
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { cart, dispatch } = useCart();

  useEffect(() => {
    axios
      .get(`${config.backendUrl}/api/products`)
      .then((res) => {
        if (Array.isArray(res.data)) {
          const productsWithBadges = res.data.map((p, index) => ({
            ...p,
            isNew: index < 3,
            isBestSeller: index % 5 === 0,
          }));
          setProducts(productsWithBadges);
          setDisplayedProducts(productsWithBadges);
        } else {
          setError("Unexpected products format");
          setProducts([]);
          setDisplayedProducts([]);
        }
      })
      .catch(() => {
        setError("Failed to fetch products");
        setProducts([]);
        setDisplayedProducts([]);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    let filtered = [...products];
    
    if (showFavorites) {
      filtered = filtered.filter((p) => favorites.includes(p._id));
    }
    
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId?.name === selectedCategory);
    }
    
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    
    if (!isNaN(min)) {
      filtered = filtered.filter((p) => p.price >= min);
    }
    
    if (!isNaN(max)) {
      filtered = filtered.filter((p) => p.price <= max);
    }
    
    setDisplayedProducts(filtered);
  }, [products, favorites, showFavorites, selectedCategory, minPrice, maxPrice]);

  const handleAdd = (product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
    setPopup(`Added "${product.name}" to cart`);
    setTimeout(() => setPopup(null), 1500);
  };
  
  const handleRemove = (productId) => {
    const itemInCart = cart.find(item => item._id === productId);
    if (!itemInCart) {
        setPopup("Item not in cart");
        setTimeout(() => setPopup(null), 1500);
        return;
    }
    dispatch({ type: "DECREMENT_QTY", payload: productId });
    setPopup(`Removed one "${itemInCart.name}" from cart`);
    setTimeout(() => setPopup(null), 1500);
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        setPopup("Removed from favorites");
        setTimeout(() => setPopup(null), 1500);
        return prev.filter((id) => id !== productId);
      }
      setPopup("Added to favorites");
      setTimeout(() => setPopup(null), 1500);
      return [...prev, productId];
    });
  };

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory(null);
    setShowFavorites(false);
  };

  const getQuantity = (productId) => {
    const item = cart.find((i) => i._id === productId);
    return item ? item.qty || 0 : 0;
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 768, // md
        settings: {
          arrows: false
        }
      }
    ]
  };

  return (
    <div className="relative bg-[#f9f1dd] min-h-screen select-none overflow-x-hidden">
      {/* Banner */}
      <section className="shadow-lg bg-white w-full mb-10">
        <Slider {...sliderSettings} className="w-screen relative z-20">
          {banners.map(({ id, img, title, label, link }) => (
            <Link
              to={link}
              key={id}
              className="block relative cursor-pointer text-white overflow-hidden"
            >
              <img
                src={img}
                alt={title}
                className="w-full h-96 md:h-[60vh] lg:h-screen object-cover brightness-90 transition"
              />
              <div className="absolute bottom-10 left-5 sm:bottom-20 sm:left-20 max-w-[calc(100%-40px)] sm:max-w-lg">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold drop-shadow-xl">{title}</h2>
                <span className="mt-4 inline-block bg-yellow-300 rounded-full px-4 sm:px-8 py-2 sm:py-3 text-yellow-900 font-semibold text-sm sm:text-lg md:text-2xl cursor-pointer hover:bg-yellow-400 transition">
                  {label}
                </span>
              </div>
            </Link>
          ))}
        </Slider>
      </section>

      {/* Firepanti Decorations */}
      {leftPanti}
      {rightPanti}

      {/* Categories with Selection */}
      <Categories 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      {/* Products Header */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-green-800 my-8 text-center">
        Our Fresh Products
      </h1>

      {/* Enhanced Filter Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 relative z-30">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4 sm:mb-6">
            {/* Price Filters */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Price:</label>
              <input
                type="number"
                placeholder="Min ₹"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Minimum price filter"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max ₹"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 w-20 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                aria-label="Maximum price filter"
              />
            </div>

            {/* Favorites Toggle */}
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-semibold transition-all ${
                showFavorites
                  ? "bg-red-500 text-white shadow-lg shadow-red-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {showFavorites ? "❤️ Favorites On" : "🤍 Show Favorites"} ({favorites.length})
            </button>

            {/* Reset Filters */}
            <button
              type="button"
              onClick={resetFilters}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold text-sm sm:text-base"
            >
              Reset
            </button>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory || minPrice || maxPrice || showFavorites) && (
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedCategory && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  Category: {selectedCategory}
                </span>
              )}
              {minPrice && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Min: ₹{minPrice}
                </span>
              )}
              {maxPrice && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  Max: ₹{maxPrice}
                </span>
              )}
              {showFavorites && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  Favorites Only
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-gray-600">
          Showing {displayedProducts.length} of {products.length} products
        </p>
      </div>

      {/* Popup Notification */}
      {popup && (
        <div className="fixed top-20 right-4 sm:right-6 bg-green-700 text-white px-4 py-2 rounded-lg z-50 shadow-lg animate-fadeinout">
          {popup}
        </div>
      )}

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-30">
        {displayedProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {products.length === 0 
                ? "Loading products..." 
                : "No products match your filters"}
            </p>
            {products.length > 0 && (
              <button
                onClick={resetFilters}
                className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          displayedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              getQuantity={getQuantity}
              handleAdd={handleAdd}
              handleRemove={handleRemove}
              toggleFavorite={toggleFavorite}
              favorites={favorites}
              onQuickView={setQuickViewProduct}
            />
          ))
        )}
      </section>

      {/* "Why Choose Us" Section */}
      <section className="max-w-7xl mx-auto rounded-2xl bg-white shadow-md py-10 px-6 sm:px-8 my-10 relative z-30">
        <h2 className="text-3xl font-extrabold mb-8 text-gray-900 text-center">
          Why Choose Fruit Elegance?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyChooseUsFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <div className={`p-4 rounded-full bg-gray-100 mb-4 ${feature.color}`}>
                  <Icon size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.text}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          handleAdd={handleAdd}
        />
      )}

      {/* Footer */}
      <footer className="bg-green-900 text-white mt-16 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-yellow-300 mb-4">Fruit Elegance</h3>
              <p className="text-green-100 mb-4 leading-relaxed text-sm">
                Your trusted partner for fresh, premium quality fruits. We deliver nature's finest 
                directly to your doorstep with love and care.
              </p>
              <div className="flex items-center gap-2 text-green-100 text-sm">
                <span>🌟</span>
                <span>Premium Quality Since 2020</span>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-green-100 hover:text-yellow-300 transition-colors">About Us</Link></li>
                <li><Link to="/products" className="text-green-100 hover:text-yellow-300 transition-colors">All Products</Link></li>
                <li><Link to="/categories" className="text-green-100 hover:text-yellow-300 transition-colors">Categories</Link></li>
                <li><Link to="/profile/orders" className="text-green-100 hover:text-yellow-300 transition-colors">Track Order</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/contact" className="text-green-100 hover:text-yellow-300 transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="text-green-100 hover:text-yellow-300 transition-colors">FAQ</Link></li>
                <li><Link to="/shipping" className="text-green-100 hover:text-yellow-300 transition-colors">Shipping Info</Link></li>
                <li><Link to="/returns" className="text-green-100 hover:text-yellow-300 transition-colors">Returns & Refunds</Link></li>
                <li><Link to="/support" className="text-green-100 hover:text-yellow-300 transition-colors">24/7 Support</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-4">Get In Touch</h4>
              <div className="space-y-3 text-green-100 text-sm">
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>✉️</span>
                  <span>info@fruitelegance.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>Pune, Maharashtra, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🕒</span>
                  <span>Mon-Sun: 6AM - 10PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-green-800 pt-8 mt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
              <div>
                <h4 className="text-lg font-semibold text-yellow-300 mb-3 text-center lg:text-left">We Accept</h4>
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3">
                  <img src="https://cdn.worldvectorlogo.com/logos/visa-10.svg" alt="Visa" className="h-6 sm:h-8" />
                  <img src="https://cdn.worldvectorlogo.com/logos/mastercard-modern-design-.svg" alt="Mastercard" className="h-6 sm:h-8" />
                  <img src="https://cdn.worldvectorlogo.com/logos/american-express-3.svg" alt="American Express" className="h-6 sm:h-8" />
                  <img src="https://cdn.worldvectorlogo.com/logos/rupay.svg" alt="RuPay" className="h-6 sm:h-8" />
                  <img src="https://cdn.worldvectorlogo.com/logos/google-pay-2.svg" alt="Google Pay" className="h-6 sm:h-8" />
                  <img src="https://www.vectorlogo.zone/logos/apple/apple-icon.svg" alt="Apple Pay" className="h-6 sm:h-8" />
                </div>
              </div>
              
              <div className="text-center lg:text-right">
                <h4 className="text-lg font-semibold text-yellow-300 mb-2">Follow Us</h4>
                <div className="flex gap-3 justify-center lg:justify-end">
                  <a href="https://www.instagram.com/fruit_elegancee" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-green-700 transition-colors">
                    <img src="https://www.vectorlogo.zone/logos/instagram/instagram-icon.svg" alt="Instagram" className="h-6 w-6"/>
                  </a>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-green-700 transition-colors">
                    <img src="https://www.vectorlogo.zone/logos/whatsapp/whatsapp-icon.svg" alt="WhatsApp" className="h-6 w-6"/>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-950 pt-4 mt-4">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-green-200 text-xs sm:text-sm max-w-7xl mx-auto py-4 text-center">
              <div>
                © 2025 Fruit Elegance. All Rights Reserved. | 
                <Link to="/privacy" className="hover:text-yellow-300 ml-1">Privacy Policy</Link> | 
                <Link to="/terms" className="hover:text-yellow-300 ml-1">Terms of Service</Link>
              </div>
              <div className="flex items-center justify-center gap-4 text-center lg:text-right">
                <span>🔒 Secure Shopping</span>
                <span>🚚 Fast Delivery</span>
                <span>🌱 100% Fresh</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeinout {
          0%,100% {opacity:0;}
          10%,90% {opacity:1;}
        }
        .animate-fadeinout {
          animation: fadeinout 1.5s ease forwards;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}