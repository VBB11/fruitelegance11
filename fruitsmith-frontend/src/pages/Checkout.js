import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { FaChevronLeft, FaMapMarkerAlt, FaWallet, FaCheckCircle } from 'react-icons/fa';
import config from './config/config';

const placeholderImage =
  "https://cdn.pixabay.com/photo/2016/04/01/10/07/fruit-1303048_1280.png";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, dispatch } = useCart();
  const { token, user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { address } = location.state || {};

  // This useEffect handles the redirects
  useEffect(() => {
    if (!address) {
      navigate('/cart', { replace: true });
      return;
    }
    if (cart.length === 0) {
      navigate('/', { replace: true });
      return;
    }
  }, [address, cart.length, navigate]);

  if (!address || cart.length === 0) {
    return <div className="p-6 text-center text-gray-600">Redirecting...</div>;
  }

  const openRazorpay = (orderId, amount, key) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }
      const options = {
        key,
        amount: amount * 100,
        currency: 'INR',
        name: 'Fruit Elegance',
        description: 'Order for Fresh Fruits',
        order_id: orderId,
        handler: function (response) {
          resolve(response);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: address.mobile,
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Payment cancelled'));
          },
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setError('Failed to load payment SDK. Please try again later.');
        return;
      }
      
      const createOrderRes = await axios.post(
        `${config.backendUrl}/api/payment/create-order`,
        { cart },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const { orderId, key, amount } = createOrderRes.data;

      const paymentResult = await openRazorpay(orderId, amount, key);
      
      await axios.post(
        `${config.backendUrl}/api/orders`,
        {
          cart,
          shippingAddress: address,
          totalAmount: amount,
          paymentId: paymentResult.razorpay_payment_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      dispatch({ type: 'CLEAR_CART' });
      localStorage.removeItem('cart');
      localStorage.removeItem('selectedAddress');
      alert('Order placed successfully!');
      navigate('/profile/orders');

    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Payment or order processing failed.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
  const deliveryFeeThreshold = 999;
  const deliveryFee = subtotal >= deliveryFeeThreshold ? 0 : 50;
  const totalPrice = subtotal + deliveryFee;

  return (
    <div className="relative bg-[#f9f1dd] min-h-screen select-none py-16 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link to="/cart" className="inline-flex items-center text-green-800 hover:text-green-900 transition-colors font-semibold">
            <FaChevronLeft className="mr-2" /> Back to Cart
          </Link>
        </div>

        <h1 className="text-4xl font-extrabold text-green-800 my-10 text-center">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                Order Summary
            </h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item._id} className="flex items-center gap-4 py-2 border-b border-gray-100">
                  <img
                    src={item.image || placeholderImage}
                    alt={item.name}
                    className="w-16 h-16 object-contain rounded-lg shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-green-800">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                  </div>
                  <p className="font-bold text-green-900">₹{item.price * item.qty}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-gray-700 mt-6 pt-4 border-t border-gray-200">
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
          </div>

          <div className="flex flex-col gap-8">
            <div className="bg-white rounded-3xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-600" />
                Delivery Address
              </h2>
              <div className="p-4 rounded-xl border-2 border-green-600 bg-green-50 shadow-sm">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{address.name}</h3>
                <p className="text-gray-600">{address.street}, {address.city}</p>
                <p className="text-gray-600">{address.state}, {address.zip}, {address.country}</p>
                <p className="text-gray-600 font-semibold mt-1">Phone: {address.mobile}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <FaWallet className="text-green-600" />
                Payment Method
              </h2>
              <div className="text-center">
                <p className="text-gray-600 mb-4">You will be redirected to a secure payment gateway.</p>
                {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-full font-semibold text-lg transition-colors"
                >
                  {loading ? 'Processing...' : `Pay ₹${totalPrice.toFixed(2)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
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

export default Checkout;