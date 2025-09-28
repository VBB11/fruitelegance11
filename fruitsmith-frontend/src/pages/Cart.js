import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { FaPlus, FaMinus, FaTrashAlt, FaMapMarkerAlt, FaCheckCircle, FaChevronLeft, FaShippingFast, FaExclamationCircle } from 'react-icons/fa';
import config from './config/config';

const placeholderImage =
  "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

function Cart() {
  const { cart, dispatch } = useCart();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        if (!token) {
          setAddresses([]);
          setSelectedAddressId(null);
          setLoading(false);
          return;
        }
        const res = await axios.get(`${config.backendUrl}/api/user/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const normalized = res.data.map(addr => ({
          ...addr,
          _id: String(addr._id),
        }));

        setAddresses(normalized);

        if (normalized.length > 0) {
          const storedAddress = JSON.parse(localStorage.getItem('selectedAddress'));
          if (storedAddress && normalized.find(addr => addr._id === storedAddress._id)) {
            setSelectedAddressId(storedAddress._id);
          } else {
            setSelectedAddressId(normalized[0]._id);
          }
        } else {
          setSelectedAddressId(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch addresses', err);
        setError('Failed to load addresses. Please log in or check your connection.');
        setAddresses([]);
        setSelectedAddressId(null);
        setLoading(false);
      }
    }
    fetchAddresses();
  }, [token]);

  // Find full selected address object for rendering and passing on proceed
  const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const deliveryFeeThreshold = 999;
  const deliveryFee = subtotal >= deliveryFeeThreshold ? 0 : 50;
  const totalPrice = subtotal + deliveryFee;

  const handleProceed = () => {
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    if (!selectedAddress) {
      alert('Please select a delivery address.');
      return;
    }

    // Save full selected address object to localStorage for checkout usage
    localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));

    console.log('Proceed with address:', selectedAddress);
    navigate('/checkout', { state: { address: selectedAddress } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9f1dd] flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading cart...</p>
      </div>
    );
  }

  const isProceedDisabled = cart.length === 0 || !selectedAddress;

  return (
    <div className="relative bg-[#f9f1dd] min-h-screen select-none py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-green-800 hover:text-green-900 transition-colors font-semibold">
            <FaChevronLeft className="mr-2" /> Continue Shopping
          </Link>
        </div>

        <h1 className="text-4xl font-extrabold text-green-800 my-10 text-center">
          Your Shopping Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-md p-6">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Your cart is empty.</p>
                <Link to="/" className="mt-4 inline-block text-green-700 font-semibold hover:underline">
                  Go shopping
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cart.map(item => (
                  <div key={item._id} className="py-4 flex items-center gap-4">
                    <img
                      src={item.image || placeholderImage}
                      alt={item.name}
                      className="w-20 h-20 object-contain rounded-lg shadow-sm"
                    />
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-green-800">{item.name}</h2>
                      <p className="text-lg font-semibold text-green-900">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={item.qty <= 1}
                        onClick={() => dispatch({ type: 'DECREMENT_QTY', payload: item._id })}
                        className={`p-2 rounded-full transition-colors ${item.qty <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-800 hover:bg-green-900 text-white'}`}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        <FaMinus />
                      </button>
                      <span className="font-bold text-xl w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => dispatch({ type: 'INCREMENT_QTY', payload: item._id })}
                        className="p-2 rounded-full bg-green-800 hover:bg-green-900 text-white transition-colors"
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        <FaPlus />
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item._id })}
                        className="ml-4 p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <FaTrashAlt size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="bg-white rounded-3xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Delivery Address</h2>
              {loading ? (
                <p className="text-gray-600">Loading addresses...</p>
              ) : error ? (
                <p className="text-red-600">{error}</p>
              ) : addresses.length === 0 ? (
                <p className="text-gray-600">
                  No saved addresses. Please <Link to="/profile/addresses" className="text-green-700 hover:underline">add one</Link> in your profile.
                </p>
              ) : (
                <div className="space-y-4">
                  {addresses.map(addr => (
                    <div
                      key={addr._id}
                      onClick={() => setSelectedAddressId(String(addr._id))}
                      className={`relative p-4 rounded-xl border-2 transition-colors cursor-pointer ${
                        selectedAddressId === String(addr._id)
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {selectedAddressId === String(addr._id) && (
                        <FaCheckCircle className="absolute top-2 right-2 text-green-600" />
                      )}
                      <h3 className="font-semibold text-gray-800 flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-green-600" />
                        {addr.name || 'Unnamed Address'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{addr.street}, {addr.city}</p>
                      <p className="text-sm text-gray-600">{addr.state}, {addr.zip}, {addr.country}</p>
                      <p className="text-sm text-gray-600">Phone: {addr.mobile || 'Not provided'}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4">Order Summary</h2>
              <div className={`p-4 rounded-lg flex items-center gap-2 mb-4 ${subtotal >= deliveryFeeThreshold ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                {subtotal >= deliveryFeeThreshold ? (
                  <>
                    <FaShippingFast size={20} />
                    <p className="font-semibold">Hooray! You've got free delivery.</p>
                  </>
                ) : (
                  <>
                    <FaExclamationCircle size={20} />
                    <p>Shop for **₹{(deliveryFeeThreshold - subtotal).toFixed(2)}** more to get free delivery.</p>
                  </>
                )}
              </div>
              <div className="space-y-2 text-gray-700 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-semibold">{deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between items-center">
                <span className="text-2xl font-bold text-green-800">Total:</span>
                <span className="text-2xl font-bold text-green-800">₹{totalPrice.toFixed(2)}</span>
              </div>
              <button
                onClick={handleProceed}
                className="w-full mt-6 bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-full font-semibold text-lg transition-colors"
                disabled={isProceedDisabled}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
