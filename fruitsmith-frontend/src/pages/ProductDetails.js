// src/pages/ProductDetails.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTag } from 'react-icons/fa';
import { useParams, Link, useNavigate } from "react-router-dom";
import Slider from "react-slick"; 
import { 
  FaChevronLeft, 
  FaHeart, 
  FaRegHeart, 
  FaRulerCombined, 
  FaTruck, 
  FaStar, 
  FaStarHalfAlt, 
  FaGift, 
  FaMoneyBillWave, 
  FaCalendarCheck, 
  FaBoxes, 
  FaLeaf, 
  FaSeedling,
  FaCheckCircle
} from "react-icons/fa";
import { RiSecurePaymentLine, RiMistLine } from "react-icons/ri";
import { useCart } from "../context/CartContext";
// NOTE: Ensure your config file path is correct relative to this file
import config from '../../src/pages/config/config'; 
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const placeholderImage =
  "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

const commonFeatures = [
  { icon: FaMoneyBillWave, text: "COD Available" },
  { icon: FaTruck, text: "Express Delivery" },
  { icon: FaCalendarCheck, text: "Within 24 hours" },
];

const hamperFeatures = [
  { icon: RiMistLine, text: "Refrigerate (Best Results)" },
  { icon: FaBoxes, text: "Sustainable Pack" },
  { icon: FaGift, text: "Gift Wrapping" },
];

// Minimal Product Card for "Other Products" sidebar
const ProductCardMinimal = ({ op, placeholder }) => (
    <Link
        to={`/product/${op._id}`}
        key={op._id}
        className="flex items-center gap-4 bg-green-50 rounded-xl p-3 hover:bg-green-100 transition duration-300 transform hover:shadow-md"
    >
        <img
            src={op.image?.[0] || placeholder}
            alt={op.name}
            className="w-16 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
            loading="lazy"
        />
        <div>
            <p className="font-semibold text-gray-800 line-clamp-2">{op.name}</p>
            <p className="text-green-700 font-semibold text-sm">₹{op.price}</p>
        </div>
    </Link>
);


const ProductDetails = () => { // **RENAMED TO ProductDetails**
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);
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

  const { cart, dispatch } = useCart();
  const [activeTab, setActiveTab] = useState("info");
  const [userRating, setUserRating] = useState(0);

  const categorySlugs = {
    hampers: "Hampers",
    exotic: "Exotic Fruits",
    driedNuts: "Dried Fruits & Nuts",
    everyday: "Everyday Fruits",
    tropical: "Tropical Fruits",
  };

  useEffect(() => {
    window.scrollTo(0, 0); 

    const fetchProductAndOthers = async () => {
      setLoading(true);
      try {
        const productRes = await axios.get(`${config.backendUrl}/api/products/${id}`);
        
        const fetchedProduct = productRes.data;
        fetchedProduct.image = Array.isArray(fetchedProduct.image)
          ? fetchedProduct.image
          : [fetchedProduct.image].filter(Boolean);

        if (fetchedProduct.image.length === 0) {
            fetchedProduct.image = [placeholderImage];
        }

        setProduct(fetchedProduct);

        const allProductsRes = await axios.get(`${config.backendUrl}/api/products`);
        const filteredOthers = allProductsRes.data
          .filter((p) => p._id !== id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 6)
          .map(p => ({
            ...p,
            image: Array.isArray(p.image) ? p.image : [p.image].filter(Boolean),
          }));

        setOtherProducts(filteredOthers);
        setError(""); 
      } catch (err) {
        setError("Failed to fetch product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndOthers();
  }, [id]);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const getQuantity = () => {
    const item = cart.find((i) => i._id === product._id);
    return item ? item.qty || 0 : 0;
  };

  const handleAdd = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
    setPopup(`Added "${product.name}" to cart`);
    setTimeout(() => setPopup(null), 1500);
  };

  const handleRemove = () => {
    dispatch({ type: "DECREMENT_QTY", payload: product._id }); 
    setPopup(`Removed one "${product.name}" from cart`);
    setTimeout(() => setPopup(null), 1500);
  };

  const handleBuyNow = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
    navigate("/checkout"); // Navigate directly to checkout after adding
  };

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        setPopup("Removed from favorites");
        setTimeout(() => setPopup(null), 1500);
        return prev.filter((favId) => favId !== productId);
      }
      setPopup("Added to favorites");
      setTimeout(() => setPopup(null), 1500);
      return [...prev, productId];
    });
  };

  const renderStars = (rating, isInteractive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`
            ${isInteractive ? "cursor-pointer" : ""} 
            ${i <= rating ? "text-yellow-400" : "text-gray-300"} 
            transition-colors duration-200
          `}
          size={isInteractive ? 28 : 20}
          onClick={isInteractive ? () => setUserRating(i) : undefined}
          aria-label={`${i} star rating`}
        />
      );
    }
    return stars;
  };
  
  const sliderSettings = {
    dots: true,
    infinite: product?.image?.length > 1, 
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: product?.image?.length > 1, 
    autoplaySpeed: 4000, 
    pauseOnHover: true,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f1dd]">
        <div className="text-center text-gray-600">Loading product details...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9f1dd] text-center">
        <div className="text-gray-800 text-lg mb-4">{error || "Product not found."}</div>
        <Link to="/" className="text-green-800 hover:underline">
          Go back to Home
        </Link>
      </div>
    );
  }

  const qty = getQuantity();
  const isFavorite = favorites.includes(product._id);
  const currentCategoryName = product.categoryId?.name;
  const isHamper = currentCategoryName === categorySlugs.hampers;

  const renderProductLayout = () => {
    const imagesToDisplay = product.image && product.image.length > 1;

    // Unified Image/Slider Component
    const imageContent = (
        <div className="w-full aspect-square relative">
            {imagesToDisplay ? (
                <Slider {...sliderSettings}>
                    {product.image.map((img, index) => (
                        <div key={index}>
                            <img
                                src={img || placeholderImage}
                                alt={`${product.name} image ${index + 1}`}
                                className="w-full h-full object-contain rounded-xl transition-transform duration-300"
                                style={{ maxHeight: isHamper ? '400px' : '600px' }} 
                            />
                        </div>
                    ))}
                </Slider>
            ) : (
                <img
                    src={product.image[0] || placeholderImage}
                    alt={product.name}
                    className="w-full h-full object-contain rounded-xl transition-transform duration-300"
                    style={{ maxHeight: isHamper ? '400px' : '600px' }}
                />
            )}
            <button
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() => toggleFavorite(product._id)}
                className="absolute top-4 right-4 z-10 text-red-600 hover:text-red-700 transition-colors bg-white p-3 rounded-full shadow-lg"
            >
                {isFavorite ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
            </button>
        </div>
    );
    
    // Action Buttons Component
    const ActionButtons = () => (
      <div className="pt-6 flex flex-col sm:flex-row gap-4">
          {qty === 0 ? (
            <button onClick={handleAdd} className="flex-1 bg-green-800 text-white py-4 px-12 rounded-full font-semibold text-lg hover:bg-green-900 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
              Add to Cart
            </button>
          ) : (
            <div className="flex-1 bg-green-800 text-white py-3 px-6 rounded-full flex items-center justify-center gap-6 shadow-md">
              <button 
                onClick={handleRemove} 
                className="bg-green-900 w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-950 transition-colors text-xl font-bold"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                −
              </button>
              <span className="font-bold text-2xl">{qty}</span>
              <button 
                onClick={handleAdd} 
                className="bg-green-900 w-10 h-10 flex items-center justify-center rounded-full hover:bg-green-950 transition-colors text-xl font-bold"
                aria-label={`Increase quantity of ${product.name}`}
              >
                +
              </button>
            </div>
          )}
          <button onClick={handleBuyNow} className="flex-1 bg-yellow-400 text-gray-800 py-4 px-12 rounded-full font-semibold text-lg hover:bg-yellow-500 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-600">
            Buy Now
          </button>
      </div>
    );

    // Feature Grid Component
    const FeatureGrid = ({ features }) => (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-center mt-6 pt-4 border-t border-gray-100">
          {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center border border-gray-200">
                      <Icon size={24} className="text-green-700 mb-2" />
                      <p className="text-xs sm:text-sm font-semibold text-gray-800">{feature.text}</p>
                  </div>
              );
          })}
      </div>
    );


    if (isHamper) {
      // Hamper Layout 
      return (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
            <div className="w-full md:w-1/2 max-w-md">
              {imageContent}
            </div>
            <div className="w-full md:w-1/2 min-w-[320px] pt-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-green-700 mb-3 leading-snug">{product.name}</h1>
              <p className="text-3xl font-extrabold text-green-800 mb-6">₹{product.price}</p>
              
              <div className="flex items-center gap-2 mb-6 text-gray-700 p-3 bg-green-50 rounded-lg border border-green-200">
                <FaRulerCombined size={20} className="text-green-700" />
                <span className="font-semibold text-sm">Size: 14in x 14in (approx)</span>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                <h3 className="font-bold mb-2 text-green-700 text-xl">Contents:</h3>
                <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
              </div>
              
              <ActionButtons />
            </div>
          </div>
          
          <FeatureGrid features={hamperFeatures} />
          
          <div className="bg-red-50 text-red-800 p-4 rounded-lg text-sm leading-relaxed border-l-4 border-red-500 mt-6 shadow-md">
            <span className="font-bold">Disclaimer:</span> Due to the seasonal availabilities of fruits, just in case a certain fruit is unavailable, we will replace it with fruits of the same or higher value.
          </div>
        </div>
      );
    } 

    // Standard Product Layout
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Column */}
        <div className="flex items-center justify-center bg-gray-50 rounded-2xl p-6 relative h-full min-h-[300px]">
          {imageContent}
        </div>

        {/* Details Column */}
        <div className="flex flex-col justify-start space-y-4 pt-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-green-800 leading-tight">{product.name}</h1>
          <p className="text-3xl font-bold text-green-900">₹{product.price}</p>
          
          <div className="flex items-center gap-2 text-yellow-400">
            {renderStars(4.5)}
            <span className="text-gray-600 ml-2 font-medium text-sm">4.5/5 (125 reviews)</span>
          </div>
          
          <p className="text-gray-700 text-base leading-relaxed border-b border-gray-200 pb-4">{product.description}</p>
          
          {/* Tabs Section */}
          <div className="border-b border-gray-200 py-3">
            <div className="flex space-x-6">
              <button 
                onClick={() => setActiveTab("info")} 
                className={`font-semibold text-base transition-colors pb-2 ${activeTab === "info" ? "border-b-2 border-green-800 text-green-800" : "text-gray-500 hover:text-green-800"}`}
                aria-selected={activeTab === "info"}
              >
                Product Info
              </button>
              <button 
                onClick={() => setActiveTab("ratings")} 
                className={`font-semibold text-base transition-colors pb-2 ${activeTab === "ratings" ? "border-b-2 border-green-800 text-green-800" : "text-gray-500 hover:text-green-800"}`}
                aria-selected={activeTab === "ratings"}
              >
                Ratings & Reviews
              </button>
            </div>
          </div>

          {activeTab === "info" ? (
            <div className="space-y-4 pt-4">
              <div className="space-y-2 text-gray-700 text-sm">
                <p className="flex items-center gap-2"><FaTag className="text-green-600" /><span className="font-semibold">Category: </span>{currentCategoryName || "N/A"}</p>
                {product.weight && (<p className="flex items-center gap-2"><FaRulerCombined className="text-green-600" /><span className="font-semibold">Weight: </span>{product.weight}</p>)}
                {product.origin && (<p className="flex items-center gap-2"><FaTruck className="text-green-600" /><span className="font-semibold">Origin: </span>{product.origin}</p>)}
              </div>
              
              {currentCategoryName === categorySlugs.exotic && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-bold text-lg text-yellow-800 mb-2">
                    <FaSeedling className="inline-block mr-2" /> Special Care
                  </h3>
                  <p className="text-sm text-gray-700">Handle with care. Store at room temperature until ripe, then refrigerate for up to a week. Best enjoyed chilled.</p>
                </div>
              )}
              {currentCategoryName === categorySlugs.driedNuts && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-lg text-amber-800 mb-2">
                    <FaLeaf className="inline-block mr-2" /> Storage Tips
                  </h3>
                  <p className="text-sm text-gray-700">Store in a cool, dry place. Best consumed within 6 months after opening to maintain freshness.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold text-green-800">Rate This Product</h3>
              <div className="flex gap-2 text-gray-400">
                {renderStars(userRating, true)} 
              </div>
              <p className="text-sm text-gray-600">Your rating: <span className="font-bold text-green-700">{userRating || 0}</span> star(s).</p>
              <button
                onClick={() => {
                    if (userRating > 0) {
                        setPopup(`Thank you for rating this product ${userRating} star(s)!`);
                        setUserRating(0); // Reset after submission
                        setTimeout(() => setPopup(null), 1500);
                    } else {
                        setPopup("Please select a rating before submitting.");
                        setTimeout(() => setPopup(null), 1500);
                    }
                }}
                className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Submit Rating
              </button>
            </div>
          )}
          
          <ActionButtons />
          
          <FeatureGrid features={commonFeatures} />
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-[#f9f1dd] min-h-screen py-24 px-4 sm:px-8">
      
      {/* Back Link */}
      <div className="max-w-7xl mx-auto mb-8 relative z-10">
        <Link to="/" className="inline-flex items-center text-green-800 hover:text-green-900 transition-colors font-semibold p-2 rounded-lg bg-white/70 backdrop-blur-sm">
          <FaChevronLeft className="mr-2" /> Back to Products
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-2xl relative p-6 sm:p-8 lg:p-12">
          {popup && (
            <div className="fixed top-24 right-4 sm:right-6 bg-green-700 text-white px-6 py-3 rounded-lg z-50 shadow-xl animate-fadeinout">
              {popup}
            </div>
          )}
          {renderProductLayout()}
        </div>

        {/* Sidebar */}
        <aside className="w-full lg:w-auto">
          <div className="bg-white p-6 rounded-3xl shadow-xl sticky top-24">
            <h2 className="text-2xl font-bold mb-6 text-green-800 border-b-2 border-green-100 pb-3">
              You Might Also Like
            </h2>
            <div className="space-y-4">
              {otherProducts.length > 0 ? (
                otherProducts.map((op) => (
                  <ProductCardMinimal op={op} key={op._id} placeholder={placeholderImage} />
                ))
              ) : (
                <p className="text-gray-500">More fresh products coming soon!</p>
              )}
            </div>
            
            {/* Trust Badges */}
            <div className="mt-8 border-t border-gray-100 pt-6 space-y-3">
                <p className="text-sm font-semibold text-green-800 flex items-center gap-2"><FaCheckCircle className="text-green-500" /> Quality Guarantee</p>
                <p className="text-sm font-semibold text-green-800 flex items-center gap-2"><RiSecurePaymentLine className="text-green-500" /> Secure Checkout</p>
                <p className="text-sm font-semibold text-green-800 flex items-center gap-2"><FaSeedling className="text-green-500" /> 100% Freshness</p>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes fadeinout {
          0%, 100% {opacity: 0; transform: translateX(20px);}
          10%, 90% {opacity: 1; transform: translateX(0);}
        }
        .animate-fadeinout {
          animation: fadeinout 1.5s ease forwards;
        }
        .aspect-square {
            aspect-ratio: 1 / 1;
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
};

export default ProductDetails;