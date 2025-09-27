import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaSpinner, FaBoxOpen, FaExclamationCircle } from 'react-icons/fa';

const placeholderImage = "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

export default function Favourites() {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:4000/api/products');
        setProducts(res.data);
        setError('');
      } catch (err) {
        setError('Failed to load products.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const storedFavs = localStorage.getItem('favorites');
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs));
    } else {
      setFavorites([]);
    }
  }, []);

  const handleRemoveFavorite = (productId) => {
    const updatedFavorites = favorites.filter(id => id !== productId);
    setFavorites(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col text-green-700">
        <FaSpinner className="animate-spin text-4xl mb-3" />
        <p className="text-xl font-semibold">Loading your favorite items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col text-red-600">
        <FaExclamationCircle className="text-4xl mb-3" />
        <p className="text-xl font-semibold">{error}</p>
        <p className="text-sm text-gray-500 mt-2">Please try reloading the page.</p>
      </div>
    );
  }

  const favoriteProducts = products.filter(p => favorites.includes(p._id));

  if (favoriteProducts.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-600 text-center flex-col">
        <FaBoxOpen size={64} className="mx-auto mb-4 text-green-400" />
        <p className="text-2xl font-bold mb-2">Your favorites list is empty.</p>
        <p className="text-md text-gray-500 mb-6">Start adding products you love!</p>
        <Link 
          to="/"
          className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors duration-300 transform hover:scale-105"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      <h2 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-8 text-center">
        My Favourites
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {favoriteProducts.map(item => (
          <li 
            key={item._id} 
            className="group bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
          >
            <div className="relative">
              <Link to={`/product/${item._id}`}>
                <img
                  src={item.image || placeholderImage}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-xl transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </Link>
              {/* Filled heart icon for favorited item */}
              <div className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full">
                <FaHeart size={16} />
              </div>
            </div>
            <div className="p-4 pt-0">
              <h3 className="text-xl font-bold text-gray-900 mt-4 mb-1 truncate">{item.name}</h3>
              <p className="text-2xl font-extrabold text-green-700 mb-4">
                ₹{item.price?.toFixed(2) || '0.00'}
              </p>
              <button
                onClick={() => handleRemoveFavorite(item._id)}
                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-300 hover:bg-red-500 hover:text-white"
                aria-label={`Remove ${item.name} from favorites`}
              >
                <FaRegHeart />
                <span>Remove from Favourites</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}