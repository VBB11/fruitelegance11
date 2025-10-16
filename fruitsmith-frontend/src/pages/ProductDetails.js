// src/pages/ProductDetailPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import Slider from "react-slick"; // Import Slider
import { FaChevronLeft, FaHeart, FaRegHeart, FaRulerCombined, FaTag, FaTruck, FaClock, FaStar, FaStarHalfAlt, FaGift, FaMoneyBillWave, FaTruckLoading, FaCalendarCheck, FaBoxes, FaLeaf, FaSeedling } from "react-icons/fa";
import { RiSecurePaymentLine, RiMistLine } from "react-icons/ri";
import { useCart } from "../context/CartContext";
import config from '../../src/pages/config/config';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const placeholderImage =
  "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

const commonFeatures = [
  { icon: FaMoneyBillWave, text: "COD Available" },
  { icon: FaTruck, text: "Express Delivery Available" },
  { icon: FaCalendarCheck, text: "Delivered within 24 hours" },
];

const hamperFeatures = [
  { icon: RiMistLine, text: "Refrigerate for best results" },
  { icon: FaBoxes, text: "Sustainable Packaging" },
  { icon: FaGift, text: "Gift Wrapping Available" },
];

const ProductDetailPage = () => {
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

  const categoryIds = {
    hampers: "68d1a570d22bfef738342c4c",
    exotic: "68d13b656a06bced752cff7a",
    driedNuts: "68d1a589d22bfef738342c4f",
    everyday: "68d049d26a06bced752cfd71",
    tropical: "68d1a5a0d22bfef738342c52",
  };

  useEffect(() => {
    const fetchProductAndOthers = async () => {
      setLoading(true);
      try {
        const productRes = await axios.get(`${config.backendUrl}/api/products/${id}`);
        // Correctly handle the 'image' array from the backend
        const fetchedProduct = productRes.data;
        fetchedProduct.image = Array.isArray(fetchedProduct.image)
          ? fetchedProduct.image
          : [fetchedProduct.image].filter(Boolean);

        // Add a placeholder if the image array is empty
        if (fetchedProduct.image.length === 0) {
            fetchedProduct.image = [placeholderImage];
        }

        setProduct(fetchedProduct);

        const allProductsRes = await axios.get(`${config.backendUrl}/api/products`);
        const filteredOthers = allProductsRes.data
          .filter((p) => p._id !== id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);
        setOtherProducts(filteredOthers);
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
    dispatch({ type: "REMOVE_ITEM", payload: product });
    setPopup(`Removed one "${product.name}" from cart`);
    setTimeout(() => setPopup(null), 1500);
  };

  const handleBuyNow = () => {
    dispatch({ type: "ADD_ITEM", payload: product });
    navigate("/cart");
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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`cursor-pointer ${i <= rating ? "text-yellow-400" : "text-gray-300"}`}
          size={24}
          onClick={() => setUserRating(i)}
        />
      );
    }
    return stars;
  };
  
  // Slider settings for product images
  const sliderSettings = {
    dots: true,
    infinite: product?.image?.length > 1, 
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true, // Auto-sliding is enabled here
    autoplaySpeed: 3000, // Slides change every 3 seconds
    pauseOnHover: true, // Pauses on hover
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
  const currentCategoryId = product.categoryId?._id;

  const renderProductLayout = () => {
    // Both layouts now use the same logic for rendering images
    // because product.image is guaranteed to be an array.
    const imagesToDisplay = product.image && product.image.length > 1;

    // Use a single image if there's only one, otherwise use the slider
    const imageContent = imagesToDisplay ? (
        <Slider {...sliderSettings}>
            {product.image.map((img, index) => (
                <div key={index}>
                    <img
                        src={img || placeholderImage}
                        alt={`${product.name} image ${index + 1}`}
                        className="w-full aspect-square object-contain rounded-xl hover:scale-105 transition-transform duration-300 shadow-md"
                    />
                </div>
            ))}
        </Slider>
    ) : (
        <img
            src={product.image[0] || placeholderImage}
            alt={product.name}
            className="w-full aspect-square object-contain rounded-xl hover:scale-105 transition-transform duration-300 shadow-md"
        />
    );


    if (currentCategoryId === categoryIds.hampers) {
      return (
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="flex-1">
              <div className="w-full max-w-md p-4 rounded-3xl shadow-lg bg-white relative">
                {imageContent}
                <button
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  onClick={() => toggleFavorite(product._id)}
                  className="absolute top-8 right-8 z-10 text-red-600 hover:text-red-700 transition-colors"
                >
                  {isFavorite ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
                </button>
              </div>
            </div>
            <div className="flex-1 min-w-[320px] pt-4">
              <h1 className="text-4xl font-extrabold text-green-700 mb-2 drop-shadow-md">{product.name}</h1>
              <p className="text-4xl font-extrabold text-green-800 mb-6 drop-shadow-md">₹{product.price}</p>
              
              <div className="flex items-center gap-2 mb-6 text-gray-700 p-4 bg-green-50 rounded-lg">
                <FaRulerCombined size={20} className="text-green-700" />
                <span className="font-semibold">14in x 14in inches approx.</span>
              </div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-bold mb-2 text-green-700 text-xl">Contents:</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                {qty === 0 ? (
                  <button onClick={handleAdd} className="flex-1 bg-green-800 text-white py-4 px-12 rounded-full font-semibold text-lg hover:bg-green-900 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex-1 bg-green-800 text-white py-3 px-6 rounded-full flex items-center justify-center gap-6">
                    <button onClick={handleRemove} className="bg-green-900 p-2 rounded-full hover:bg-green-950 transition-colors">−
                    </button>
                    <span className="font-bold text-xl">{qty}</span>
                    <button onClick={handleAdd} className="bg-green-900 p-2 rounded-full hover:bg-green-950 transition-colors">+</button>
                  </div>
                )}
                <button onClick={handleBuyNow} className="flex-1 bg-gray-200 text-gray-800 py-4 px-12 rounded-full font-semibold text-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {hamperFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                  <Icon size={32} className="text-green-700 mb-2" />
                  <p className="text-sm font-semibold text-gray-800">{feature.text}</p>
                </div>
              );
            })}
          </div>
          <div className="bg-red-50 text-red-800 p-4 rounded-lg text-sm leading-relaxed border-l-4 border-red-500 mt-6">
            <span className="font-bold">Disclaimer:</span> Due to the seasonal availabilities of fruits, just in case a certain fruit is unavailable, we will replace it with fruits of the same or higher value.
          </div>
        </div>
      );
    } 

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="flex items-center justify-center bg-gray-50 rounded-2xl p-6 relative">
          {imagesToDisplay ? (
            <Slider {...sliderSettings} className="w-full">
              {product.image.map((img, index) => (
                <div key={index}>
                  <img
                    src={img || placeholderImage}
                    alt={`${product.name} image ${index + 1}`}
                    className="w-full h-auto max-h-[400px] object-contain"
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <img src={product.image[0] || placeholderImage} alt={product.name} className="w-full h-auto max-h-[400px] object-contain" />
          )}
          <button aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"} onClick={() => toggleFavorite(product._id)} className="absolute top-5 right-5 z-10 text-red-600 hover:text-red-700 transition-colors">
            {isFavorite ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
          </button>
        </div>
        <div className="flex flex-col justify-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-green-800 leading-tight">{product.name}</h1>
          <p className="text-2xl font-bold text-green-900">₹{product.price}</p>
          <div className="flex items-center gap-2 text-yellow-400">
            <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalfAlt />
            <span className="text-gray-600 ml-2">4.5 out of 5</span>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>
          
          <div className="border-t border-b border-gray-200 py-4">
            <div className="flex space-x-4">
              <button onClick={() => setActiveTab("info")} className={`font-semibold text-lg transition-colors pb-1 ${activeTab === "info" ? "border-b-2 border-green-800 text-green-800" : "text-gray-500 hover:text-green-800"}`}>Product Info</button>
              <button onClick={() => setActiveTab("ratings")} className={`font-semibold text-lg transition-colors pb-1 ${activeTab === "ratings" ? "border-b-2 border-green-800 text-green-800" : "text-gray-500 hover:text-green-800"}`}>Ratings</button>
            </div>
          </div>

          {activeTab === "info" ? (
            <div className="space-y-4">
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Category: </span>{product.categoryId?.name || "N/A"}</p>
                {product.weight && (<p><span className="font-semibold">Weight: </span>{product.weight}</p>)}
                {product.origin && (<p><span className="font-semibold">Origin: </span>{product.origin}</p>)}
              </div>
              
              {product.categoryId?.name === "Exotic Fruits" && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-bold text-lg text-yellow-800 mb-2">
                    <FaSeedling className="inline-block mr-2" /> Special Care Instructions
                  </h3>
                  <p className="text-sm text-gray-700">Handle with care. Store at room temperature until ripe, then refrigerate for up to a week. Best enjoyed chilled.</p>
                </div>
              )}
              {product.categoryId?.name === "Dried Fruits & Nuts" && (
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h3 className="font-bold text-lg text-amber-800 mb-2">
                    <FaLeaf className="inline-block mr-2" /> Storage & Shelf Life
                  </h3>
                  <p className="text-sm text-gray-700">Store in a cool, dry place. Best consumed within 6 months after opening to maintain freshness.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-green-800">Your Rating</h3>
              <div className="flex gap-1 text-gray-400">
                {renderStars(userRating)}
              </div>
              <button
                onClick={() => {
                    if (userRating > 0) {
                        setPopup(`You rated this product ${userRating} star(s)!`);
                        setTimeout(() => setPopup(null), 1500);
                    } else {
                        setPopup("Please select a rating.");
                        setTimeout(() => setPopup(null), 1500);
                    }
                }}
                className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition"
              >
                Submit Rating
              </button>
            </div>
          )}
          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            {qty === 0 ? (
              <button onClick={handleAdd} className="flex-1 bg-green-800 text-white py-4 px-12 rounded-full font-semibold text-lg hover:bg-green-900 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
                Add to Cart
              </button>
            ) : (
              <div className="flex-1 bg-green-800 text-white py-3 px-6 rounded-full flex items-center justify-center gap-6">
                <button onClick={handleRemove} className="bg-green-900 p-2 rounded-full hover:bg-green-950 transition-colors">−
                </button>
                <span className="font-bold text-xl">{qty}</span>
                <button onClick={handleAdd} className="bg-green-900 p-2 rounded-full hover:bg-green-950 transition-colors">+</button>
              </div>
            )}
            <button onClick={handleBuyNow} className="flex-1 bg-gray-200 text-gray-800 py-4 px-12 rounded-full font-semibold text-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">
              Buy Now
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-6">
            {commonFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
                  <Icon size={32} className="text-green-700 mb-2" />
                  <p className="text-sm font-semibold text-gray-800">{feature.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative bg-[#f9f1dd] min-h-screen py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto mb-8">
        <Link to="/" className="inline-flex items-center text-green-800 hover:text-green-900 transition-colors font-semibold">
          <FaChevronLeft className="mr-2" /> Back to All Products
        </Link>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg relative p-8 sm:p-12">
          {popup && (
            <div className="fixed top-20 right-6 bg-green-700 text-white px-6 py-3 rounded-lg z-50 shadow-lg animate-fadeinout">
              {popup}
            </div>
          )}
          {renderProductLayout()}
        </div>

        <aside className="w-full lg:w-auto mt-8 lg:mt-0">
          <div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-green-800 border-b border-gray-200 pb-3">
              Other Products
            </h2>
            <div className="space-y-6">
              {otherProducts.length > 0 ? (
                otherProducts.map((op) => (
                  <Link
                    to={`/product/${op._id}`}
                    key={op._id}
                    className="flex items-center gap-4 bg-green-50 rounded-xl p-3 hover:bg-green-100 transition"
                  >
                    <img
                      src={op.image?.[0] || placeholderImage}
                      alt={op.name}
                      className="w-16 h-16 object-cover rounded-lg shadow-sm"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">{op.name}</p>
                      <p className="text-green-700 font-semibold text-sm">₹{op.price}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500">No other products available.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes fadeinout {
          0%, 100% {opacity: 0;}
          10%, 90% {opacity: 1;}
        }
        .animate-fadeinout {
          animation: fadeinout 1.5s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default ProductDetailPage;