import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaChevronLeft, FaHeart, FaRegHeart, FaEye, FaTimes } from "react-icons/fa";
import { FaMoneyCheckAlt, FaLock, FaSeedling, FaHandshake } from "react-icons/fa";

const placeholderImage =
  "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

// Reusing ProductCard and QuickViewModal for consistency
const QuickViewModal = ({ product, onClose, handleAdd }) => {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
          <FaTimes size={24} />
        </button>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex items-center justify-center">
            <img src={product.image || placeholderImage} alt={product.name} className="w-full h-auto max-h-64 object-contain" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-2xl font-extrabold text-green-800 mb-2">{product.name}</h3>
            <p className="text-xl font-semibold text-green-900 mb-4">₹{product.price}</p>
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
        className="absolute top-5 right-5 z-10 text-red-600 hover:text-red-700 transition-colors"
      >
        {isFavorite ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
      </button>

      {isNew && (
        <span className="absolute top-5 left-5 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          New
        </span>
      )}
      {isBestSeller && (
        <span className="absolute top-5 left-5 z-10 bg-yellow-500 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
          Best Seller
        </span>
      )}

      {isHovering && (
        <button
          onClick={() => onQuickView(product)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-white text-green-800 px-4 py-2 rounded-full font-semibold shadow-lg hover:bg-gray-100 transition"
        >
          <FaEye className="inline-block mr-2" /> Quick View
        </button>
      )}

      <Link to={`/product/${product._id}`} className="block p-5 pt-10 flex-grow">
        <img
          src={product.image || placeholderImage}
          alt={product.name}
          className="w-full h-52 object-contain rounded-3xl mb-4"
          loading="lazy"
        />
        <h3 className="text-2xl font-bold text-green-800 text-center">
          {product.name}
        </h3>
        <p className="text-center text-gray-600 mt-2 line-clamp-3">
          {product.description}
        </p>
        <p className="text-center text-green-900 text-xl font-extrabold mt-3">
          ₹{product.price}
        </p>
      </Link>

      {qty === 0 ? (
        <button
          onClick={() => handleAdd(product)}
          className="bg-green-800 text-white rounded-b-3xl py-4 font-semibold hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
        >
          Add to Cart
        </button>
      ) : (
        <div className="bg-green-800 text-white rounded-b-3xl py-3 flex items-center justify-center gap-3">
          <button
            onClick={() => handleRemove(product)}
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

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const { cart, dispatch } = useCart();
  
  // Updated mapping to link URL parameters to an array of database category names
  const categoryMap = {
      diwali: {
          title: "Diwali Luxury Hampers",
          dbNames: ["Fruit Gift Boxes or Combos"]
      },
      fruits: {
          title: "Fresh Juicy Fruits",
          dbNames: ["Everyday Fruits", "Tropical Fruits", "Seasonal Fruits", "Exotic Fruits"]
      },
      combos: {
          title: "Healthy Combos",
          dbNames: ["Fruit Gift Boxes or Combos", "Dried Fruits & Nuts"]
      }
  };

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:4000/api/products");
        if (Array.isArray(res.data)) {
          const productsWithBadges = res.data.map((p, index) => ({
            ...p,
            isNew: index < 3,
            isBestSeller: index % 5 === 0,
          }));

          const targetDbNames = categoryMap[categoryName]?.dbNames;
          
          if (targetDbNames) {
              const filteredProducts = productsWithBadges.filter(
                  (p) => targetDbNames.includes(p.categoryId?.name)
              );
              setProducts(filteredProducts);
          } else {
              setProducts([]); // No matching category found
          }

        } else {
          setError("Unexpected products format");
          setProducts([]);
        }
      } catch (err) {
        setError("Failed to fetch products for this category");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [categoryName]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleAdd = (product) => {
    dispatch({ type: "ADD_ITEM", payload: product });
    setPopup(`Added "${product.name}" to cart`);
    setTimeout(() => setPopup(null), 1500);
  };

  const handleRemove = (product) => {
    dispatch({ type: "REMOVE_ITEM", payload: product });
    setPopup(`Removed one "${product.name}" from cart`);
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

  const getQuantity = (productId) => {
    const item = cart.find((i) => i._id === productId);
    return item ? item.qty || 0 : 0;
  };
  
  const getPageTitle = () => {
    return categoryMap[categoryName]?.title || "Category";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f1dd]">
        <div className="text-center text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#f9f1dd] min-h-screen select-none py-16 px-4 sm:px-8">
      {/* Back Button and Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center gap-4">
        <Link to="/" className="inline-flex items-center text-green-800 hover:text-green-900 transition-colors font-semibold">
          <FaChevronLeft className="mr-2" /> Back to Home
        </Link>
      </div>
      <h1 className="text-4xl font-extrabold text-green-800 my-10 text-center">
        {getPageTitle()}
      </h1>

      {/* Popup Notification */}
      {popup && (
        <div className="fixed top-20 right-6 bg-green-700 text-white px-6 py-3 rounded-lg z-50 shadow-lg animate-fadeinout">
          {popup}
        </div>
      )}

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 relative z-30">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              {error || `No products found for "${getPageTitle()}".`}
            </p>
            <Link to="/" className="bg-green-800 text-white px-6 py-2 rounded-lg hover:bg-green-900 transition-colors">
              Go to Home
            </Link>
          </div>
        ) : (
          products.map((product) => (
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

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        handleAdd={handleAdd}
      />

      {/* CSS Styles */}
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
};

export default CategoryPage;