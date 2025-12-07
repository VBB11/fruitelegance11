// src/pages/Home.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaRegHeart,
  FaEye,
  FaTimes,
  FaGift,
  FaHandshake,
  FaMoneyCheckAlt,
  FaLock,
  FaStar,
} from "react-icons/fa";
import { useCart } from "../context/CartContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import config from "./config/config";

// Fallback image for products
const placeholderImage =
  "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

// Fallback banners updated for Christmas/New Year
const FALLBACK_BANNERS = [
  {
    id: 1,
    img: "https://deq64r0ss2hgl.cloudfront.net/images/product/dry-fruits-gift-boxes-hampers-14465093981690.png",
    title: "Holiday Hampers & Gift Boxes",
    label: "Shop Festive Gifts",
    link: "/category/gifts",
  },
  {
    id: 2,
    img: "https://www.fruitsmith.com/pub/media/wysiwyg/wcg-25-11.jpg",
    title: "New Year's Freshness, New You",
    label: "Start Fresh",
    link: "/category/fresh",
  },
  {
    id: 3,
    img: "https://www.fruitsmith.com/pub/media/wysiwyg/dw-25-2.jpg",
    title: "Winter Special Fruit Combos",
    label: "View Specials",
    link: "/category/winter-specials",
  },
];

const whyChooseUsFeatures = [
  {
    icon: FaGift,
    text: "Seasonal Specials",
    color: "text-red-600",
    desc: "Discover our limited-time Christmas and New Year's collections.",
  },
  {
    icon: FaHandshake,
    text: "Ethical Sourcing",
    color: "text-amber-500",
    desc: "We partner with local farms to ensure fair trade practices.",
  },
  {
    icon: FaMoneyCheckAlt,
    text: "Best Price",
    color: "text-green-700",
    desc: "Premium quality fruits at the most competitive prices.",
  },
  {
    icon: FaLock,
    text: "Secure Payments",
    color: "text-blue-500",
    desc: "Your transactions are protected with the highest level of security.",
  },
];

// Quick view modal for products - Image src fixed
const QuickViewModal = ({ product, onClose, handleAdd }) => {
  if (!product) return null;

  // Use the first image in the array, or the product.image itself (if it's a string), or the placeholder.
  const imageUrl = Array.isArray(product.image)
    ? product.image[0]
    : product.image || placeholderImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-6 sm:p-10 max-w-xl w-full mx-4 shadow-2xl relative border-4 border-red-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition p-1 rounded-full bg-white shadow-md"
          aria-label="Close quick view"
        >
          <FaTimes size={24} />
        </button>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-4">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-auto max-h-72 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-green-800 mb-2 leading-tight">
              {product.name}
            </h3>
            <p className="text-xl sm:text-2xl font-semibold text-red-600 mb-4">
              ₹{product.price}
            </p>
            <p className="text-gray-600 mb-6 line-clamp-3">
              {product.description}
            </p>
            <button
              onClick={() => handleAdd(product)}
              className="bg-red-600 text-white rounded-full py-3 font-bold text-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Add to Cart
            </button>
            <Link
              to={`/product/${product._id}`}
              className="mt-3 text-center text-green-700 hover:text-green-900 font-medium transition-colors"
            >
              View Full Details &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Product card - Image src fixed and Quick View logic fixed for click-through
const ProductCard = ({
  product,
  getQuantity,
  handleAdd,
  handleRemove,
  toggleFavorite,
  favorites,
  onQuickView,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const qty = getQuantity(product._id);
  const isFavorite = favorites.includes(product._id);
  const isNew = product.isNew || false;
  const isBestSeller = product.isBestSeller || false;

  // Use the first image in the array, or the product.image itself, or the placeholder.
  const imageUrl = Array.isArray(product.image)
    ? product.image[0]
    : product.image || placeholderImage;

  return (
    <article
      className="bg-white rounded-2xl shadow-xl border border-gray-100 cursor-default select-none relative flex flex-col transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={() => toggleFavorite(product._id)}
        className="absolute top-3 right-3 z-30 text-red-600 hover:text-red-700 transition-colors p-1 bg-white rounded-full shadow-md"
      >
        {isFavorite ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
      </button>

      {/* Combined Badges logic simplified */}
      <div className="absolute top-3 left-3 z-30 flex flex-col gap-1">
        {isNew && !isBestSeller && (
          <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            NEW
          </span>
        )}
        {isBestSeller && (
          <span className="bg-amber-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
            <FaStar className="inline mr-1 -mt-0.5" size={10} /> BEST SELLER
          </span>
        )}
      </div>

      {/* This is the primary fix area: The Link now covers the image and name directly,
        ensuring they are clickable, regardless of hover state.
        We've increased the z-index of the content link slightly to ensure it's on top of any passive hover effects. 
      */}
      <Link 
        to={`/product/${product._id}`} 
        className="block p-4 pt-6 flex-grow relative z-20" // <-- Ensure this Link is the primary clickable area
      >
        <div className="bg-gray-50 rounded-xl p-2 mb-4">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-40 sm:h-56 object-contain rounded-xl transition-transform duration-300 hover:scale-[1.05]"
            loading="lazy"
          />
        </div>
        <h3 className="text-xl font-bold text-green-800 text-center leading-snug truncate">
          {product.name}
        </h3>
        <p className="text-center text-gray-500 mt-1 line-clamp-2 text-sm">
          {product.description}
        </p>
        <p className="text-center text-red-600 text-xl font-extrabold mt-3">
          ₹{product.price}
        </p>
      </Link>

      {/* Cart Controls and Quick View Button - The Quick View button is moved out of the hover overlay to fix the issue. */}
      <div className="px-4 pb-4 pt-2">
        {/* Quick View Button - Now visible next to cart controls, or can be placed in the footer area if preferred */}
        <button
            onClick={() => onQuickView(product)}
            className={`w-full bg-green-100 text-green-800 px-3 py-2 rounded-xl font-bold text-sm shadow-inner hover:bg-green-200 transition-colors mb-2`}
            aria-label={`Quick view of ${product.name}`}
        >
            <FaEye className="inline-block mr-2" /> Quick View
        </button>

        {qty === 0 ? (
          <button
            onClick={() => handleAdd(product)}
            className="w-full bg-red-600 text-white rounded-xl py-3 font-bold text-lg hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transition-colors"
          >
            Add to Cart
          </button>
        ) : (
          <div className="w-full bg-red-600 text-white rounded-xl py-3 flex items-center justify-center gap-4">
            <button
              onClick={() => handleRemove(product._id)}
              className="bg-red-700 p-2 rounded-full hover:bg-red-800 transition-colors text-xl font-bold"
              aria-label="Remove one item"
            >
              −
            </button>
            <span className="font-extrabold text-2xl">{qty}</span>
            <button
              onClick={() => handleAdd(product)}
              className="bg-red-700 p-2 rounded-full hover:bg-red-800 transition-colors text-xl font-bold"
              aria-label="Add one item"
            >
              +
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

// --- Festive Decoration Instead of Firepanti ---
const leftFestive = (
  <FaGift
    className="hidden lg:block fixed left-4 top-[400px] text-red-500 opacity-60 pointer-events-none z-10 animate-pulse"
    size={80}
  />
);

const rightFestive = (
  <FaStar
    className="hidden lg:block fixed right-4 top-[400px] text-amber-400 opacity-70 pointer-events-none z-10 animate-spin-slow"
    size={80}
  />
);
// --- End Decorations ---

function isInternal(link) {
  return typeof link === "string" && /^\/(?!\/)/.test(link);
}

// Helpers to read query
function getCategorySlugFromQuery(search) {
  const u = new URLSearchParams(search || "");
  return u.get("category") || "";
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  // Core lists
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);

  // Dynamic meta lists with fallback
  const [bannerItems, setBannerItems] = useState(FALLBACK_BANNERS);

  // UI state
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
  const [showFavorites, setShowFavorites] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { cart, dispatch } = useCart();

  // Load products - Corrected to normalize the 'image' field for consistency
  useEffect(() => {
    let ignore = false;
    axios
      .get(`${config.backendUrl}/api/products`)
      .then((res) => {
        if (ignore) return;
        if (Array.isArray(res.data)) {
          const productsWithBadges = res.data.map((p, index) => ({
            ...p,
            isNew: index < 3,
            isBestSeller: index % 5 === 0,
            // Add normalization back for safety/consistency
            image: Array.isArray(p.image) ? p.image : [p.image].filter(Boolean),
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
        if (ignore) return;
        setError("Failed to fetch products");
        setProducts([]);
        setDisplayedProducts([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Load banners (public active banners)
  useEffect(() => {
    let ignore = false;
    async function loadBanners() {
      try {
        const res = await axios.get(`${config.backendUrl}/api/banners`);
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.banners || [];
        if (!ignore && list.length) {
          const mapped = list
            .filter((b) => b?.img || b?.imageUrl)
            .map((b, idx) => {
              const img = b.img || b.imageUrl;
              const id = b._id || b.id || `${img}-${idx}`;
              // Normalize: if link is /category/<slug>, convert to /?category=<slug>
              const rawLink =
                b.link ||
                (b.categorySlug ? `/category/${b.categorySlug}` : "");
              let to = "";
              if (rawLink.startsWith("/category/")) {
                const slug = rawLink.split("/category/")[1] || "";
                to = `/?category=${encodeURIComponent(slug)}`;
              } else if (isInternal(rawLink)) {
                to = rawLink; // other internal links still work
              } else {
                to = ""; // treat as non-link
              }
              return {
                id,
                img,
                title: b.title || "",
                label: b.label || "",
                to, // normalized target
              };
            });
          setBannerItems(mapped);
        }
      } catch {
        // keep fallback
      }
    }
    loadBanners();
    return () => {
      ignore = true;
    };
  }, []);

  // Apply incoming category selection from state or ?category=slug
  useEffect(() => {
    // Prefer state if provided by navigate("/", { state: { categorySlug } })
    const stateSlug = location.state?.categorySlug;
    const querySlug = getCategorySlugFromQuery(location.search);
    const wantedSlug = stateSlug || querySlug;
    if (!wantedSlug) return;
  
    // This effect is no longer needed since you are removing categories.
    // However, if other parts of the app rely on this, you'd need to
    // handle the navigation cleanup. For this example, we'll keep the
    // cleanup logic but remove the category-specific state setting.
    if (stateSlug) navigate("/", { replace: true, state: {} });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.search, location.state]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    if (showFavorites) {
      filtered = filtered.filter((p) => favorites.includes(p._id));
    }

    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (!isNaN(min)) filtered = filtered.filter((p) => p.price >= min);
    if (!isNaN(max)) filtered = filtered.filter((p) => p.price <= max);

    setDisplayedProducts(filtered);
  }, [
    products,
    favorites,
    showFavorites,
    minPrice,
    maxPrice,
  ]);

 

  const handleAdd = (product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
    setPopup(`Added "${product.name}" to cart`);
    setTimeout(() => setPopup(null), 1500);
  };

  const handleRemove = (productId) => {
    const itemInCart = cart.find((item) => item._id === productId);
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
    setShowFavorites(false);
    // Also clean ?category= from URL for clarity
    if (getCategorySlugFromQuery(location.search)) {
      navigate("/", { replace: true });
    }
  };

  const getQuantity = (productId) => {
    const item = cart.find((i) => i._id === productId);
    return item ? item.qty || 0 : 0;
  };

  // Slick settings
  const sliderSettings = useMemo(
    () => ({
      dots: true,
      infinite: bannerItems.length > 1,
      autoplay: bannerItems.length > 1,
      autoplaySpeed: 4000,
      speed: 700,
      slidesToShow: 1,
      slidesToScroll: 1,
      arrows: false,
      pauseOnHover: true,
      adaptiveHeight: false,
      responsive: [{ breakpoint: 768, settings: { arrows: false } }],
      customPaging: (i) => (
        <div className="w-3 h-3 rounded-full bg-white opacity-50 transition-all duration-300 hover:opacity-100 mx-1"></div>
      ),
    }),
    [bannerItems.length]
  );

  return (
    // Festive background color
    <div className="relative bg-[#f0f9f3] min-h-screen select-none overflow-x-hidden">
      {/* Banner */}
      <section className="shadow-2xl bg-white w-full mb-12 border-b-8 border-red-600/50">
        <Slider {...sliderSettings} className="w-screen relative z-20">
          {bannerItems.map(({ id, img, title, label, to }, idx) => {
            const key = id || `${img}-${idx}`;
            const hasInternal = to && isInternal(to);
            const Wrapper = hasInternal ? Link : "div";
            const wrapperProps = hasInternal ? { to } : {};
            return (
              <Wrapper
                {...wrapperProps}
                key={key}
                className="block relative cursor-pointer text-white overflow-hidden"
              >
                <img
                  src={img}
                  alt={title || "Banner"}
                  // Slightly brighter filter for winter light
                  className="w-full h-96 md:h-[60vh] lg:h-screen object-cover brightness-[0.85] hover:brightness-[0.9] transition duration-500 ease-in-out"
                  loading="eager"
                />
                {(title || label) && (
                  <div className="absolute bottom-10 left-5 sm:bottom-24 sm:left-24 max-w-[calc(100%-40px)] sm:max-w-xl p-4 rounded-lg bg-black/30 backdrop-blur-sm">
                    {title && (
                      <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold drop-shadow-lg text-white mb-4">
                        {title}
                      </h2>
                    )}
                    {label && (
                      <span className="mt-4 inline-block bg-red-600 rounded-full px-6 sm:px-10 py-3 sm:py-4 text-white font-bold text-md sm:text-xl shadow-lg hover:bg-red-700 transition">
                        {label}
                      </span>
                    )}
                  </div>
                )}
              </Wrapper>
            );
          })}
        </Slider>
      </section>

      {/* Festive Decorations */}
      {leftFestive}
      {rightFestive}
      
      {/* Enhanced Filter Controls - Styling modernized and festive colors */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 relative z-30 border-t-4 border-green-600">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4 sm:mb-6">
            {/* Price Filters */}
            <div className="flex items-center gap-2">
              <label className="text-base font-semibold text-gray-700">Price:</label>
              <input
                type="number"
                placeholder="Min ₹"
                min="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="border-2 border-gray-300 rounded-xl px-3 py-2 w-24 text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                aria-label="Minimum price filter"
              />
              <span className="text-gray-500 font-bold">to</span>
              <input
                type="number"
                placeholder="Max ₹"
                min="0"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="border-2 border-gray-300 rounded-xl px-3 py-2 w-24 text-base focus:outline-none focus:ring-2 focus:ring-red-500 transition"
                aria-label="Maximum price filter"
              />
            </div>

            {/* Favorites Toggle - Festive Red/White */}
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`px-5 py-2.5 rounded-xl text-base font-bold transition-all duration-300 transform hover:scale-[1.05] shadow-md ${
                showFavorites
                  ? "bg-red-600 text-white shadow-red-300"
                  : "bg-white text-gray-700 border-2 border-red-600 hover:bg-red-50"
              }`}
            >
              {showFavorites ? "❤️ Favorites On" : "🤍 Show Favorites"} (
              {favorites.length})
            </button>

            {/* Reset Filters - Forest Green */}
            <button
              type="button"
              onClick={resetFilters}
              className="bg-green-700 text-white px-5 py-2.5 rounded-xl hover:bg-green-800 transition-colors font-bold text-base shadow-md transform hover:scale-[1.05]"
            >
              Reset Filters
            </button>
          </div>

          {/* Active Filters Display */}
          {(minPrice || maxPrice || showFavorites) && (
            <div className="flex flex-wrap gap-3 justify-center pt-4 border-t border-gray-100 mt-4">
              <span className="text-base font-semibold text-gray-700">Active filters:</span>
              {minPrice && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                  Min: ₹{minPrice} <FaTimes className="inline ml-1 cursor-pointer" onClick={() => setMinPrice('')} />
                </span>
              )}
              {maxPrice && (
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                  Max: ₹{maxPrice} <FaTimes className="inline ml-1 cursor-pointer" onClick={() => setMaxPrice('')} />
                </span>
              )}
              {showFavorites && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                  Favorites Only <FaTimes className="inline ml-1 cursor-pointer" onClick={() => setShowFavorites(false)} />
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Header */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 my-10 text-center relative">
        🎁 Season's Freshest Picks!
        <span className="block text-lg font-medium text-red-600 mt-1">For Christmas & New Year</span>
      </h1>

      {/* Results Count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-center text-gray-600 text-lg font-medium">
          Showing <span className="font-bold text-green-700">{displayedProducts.length}</span> of {products.length} products
        </p>
      </div>

      {/* Popup Notification - Modernized */}
      {popup && (
        <div className="fixed top-24 right-4 sm:right-6 bg-red-600 text-white px-5 py-3 rounded-xl z-50 shadow-2xl animate-fadeinout font-bold text-lg border-2 border-white">
          {popup}
        </div>
      )}

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 relative z-30 pb-12">
        {displayedProducts.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-3xl shadow-xl mx-auto w-full">
            <p className="text-gray-600 text-xl font-medium mb-6">
              {products.length === 0
                ? "Loading products... Please wait a moment."
                : "Oops! No products match your current filters. Try resetting them."}
            </p>
            {products.length > 0 && (
              <button
                onClick={resetFilters}
                className="bg-green-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-800 transition-colors shadow-lg"
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

      {/* Why Choose Us - Styling modernized and festive colors */}
      <section className="max-w-7xl mx-auto rounded-3xl bg-white shadow-2xl py-12 px-6 sm:px-10 my-12 relative z-30 border-8 border-green-600/50">
        <h2 className="text-4xl font-extrabold mb-10 text-gray-900 text-center">
          Why Choose <span className="text-red-600">Fruit Elegance</span>?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {whyChooseUsFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center p-4 transform transition-transform duration-300 hover:scale-105">
                <div className={`p-5 rounded-full bg-gray-50 mb-4 shadow-inner ${feature.color}`}>
                  <Icon size={36} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.text}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
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

      {/* Footer - Festive Colors (Darker Green/Gold) */}
      <footer className="bg-green-900 text-white mt-20 relative z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <h3 className="text-2xl font-extrabold text-amber-300 mb-4">Fruit Elegance</h3>
              <p className="text-green-200 mb-4 leading-relaxed text-sm">
                Spreading joy with nature's finest. The freshest fruits for your festive season and a healthier New Year.
              </p>
              <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold">
                <span>✨</span>
                <span>Holiday Freshness Guaranteed</span>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-amber-300 mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="text-green-100 hover:text-amber-300 transition-colors">About Us</Link></li>
                <li><Link to="/products" className="text-green-100 hover:text-amber-300 transition-colors">Shop All</Link></li>
                <li><Link to="/categories" className="text-green-100 hover:text-amber-300 transition-colors">Holiday Categories</Link></li>
                <li><Link to="/profile/orders" className="text-green-100 hover:text-amber-300 transition-colors">My Orders</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-amber-300 mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/contact" className="text-green-100 hover:text-amber-300 transition-colors">Contact Us</Link></li>
                <li><Link to="/faq" className="text-green-100 hover:text-amber-300 transition-colors">FAQs</Link></li>
                <li><Link to="/shipping" className="text-green-100 hover:text-amber-300 transition-colors">Delivery Info</Link></li>
                <li><Link to="/returns" className="text-green-100 hover:text-amber-300 transition-colors">Return Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-semibold text-amber-300 mb-4">Contact</h4>
              <div className="space-y-3 text-green-200 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-lg">📞</span>
                  <span>+91 9988112393</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">✉️</span>
                  <span>support@fruitelegancee.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">📍</span>
                  <span>Pune, Maharashtra, India</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg">🗓️</span>
                  <span>Holiday Hours: 6AM - 11PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-green-800 pt-10 mt-10">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
              <div>
                <h4 className="text-xl font-semibold text-amber-300 mb-3 text-center lg:text-left">Secure Payments</h4>
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4">
                  <img src="https://cdn.worldvectorlogo.com/logos/visa-10.svg" alt="Visa" className="h-7 filter invert" />
                  <img src="https://cdn.worldvectorlogo.com/logos/mastercard-modern-design-.svg" alt="Mastercard" className="h-7 filter invert" />
                  <img src="https://cdn.worldvectorlogo.com/logos/american-express-3.svg" alt="American Express" className="h-7 filter invert" />
                  <img src="https://cdn.worldvectorlogo.com/logos/rupay.svg" alt="RuPay" className="h-7 filter invert" />
                  <img src="https://cdn.worldvectorlogo.com/logos/google-pay-2.svg" alt="Google Pay" className="h-7 filter invert" />
                  <img src="https://www.vectorlogo.zone/logos/apple/apple-icon.svg" alt="Apple Pay" className="h-7 w-7 filter invert" />
                </div>
              </div>
            
              <div className="text-center lg:text-right">
                <h4 className="text-xl font-semibold text-amber-300 mb-3">Connect With Us</h4>
                <div className="flex gap-4 justify-center lg:justify-end">
                  <a href="https://www.instagram.com/fruit_elegancee" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-green-800 hover:bg-red-600 transition-colors">
                    <img src="https://www.vectorlogo.zone/logos/instagram/instagram-icon.svg" alt="Instagram" className="h-6 w-6 filter invert"/>
                  </a>
                  <a href="https://wa.me/9988112393" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-green-800 hover:bg-red-600 transition-colors">
                    <img src="https://www.vectorlogo.zone/logos/whatsapp/whatsapp-icon.svg" alt="WhatsApp" className="h-6 w-6 filter invert"/>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-950/50 pt-6 mt-10 rounded-lg">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-green-300 text-xs sm:text-sm max-w-7xl mx-auto py-4 text-center px-4">
              <div>
                © 2025 Fruit Elegance. All Rights Reserved. |
                <Link to="/privacy" className="hover:text-amber-300 ml-1.5">Privacy Policy</Link> |
                <Link to="/terms" className="hover:text-amber-300 ml-1.5">Terms of Service</Link>
                <span className="block lg:inline-block mt-2 lg:mt-0 lg:ml-4">
                  Handcrafted with care by <a href="https://www.1scratech.com/" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 font-semibold">1S Cratech</a>
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 text-center lg:text-right font-medium">
                <span>🔒 Secure Shopping</span>
                <span>🚚 Holiday Delivery</span>
                <span>🎄 Festive Quality</span>
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
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 15s linear infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}