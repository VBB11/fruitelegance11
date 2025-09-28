import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import config from './config/config';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || config.backendUrl || 'http://localhost:4000';
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, { name, email, password });
      
      setMessage(response.data.message || 'Signup successful! Redirecting to login...');
      
      // Redirect after a short delay to allow user to read the success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      setMessage(error.response?.data?.error || 'Signup failed');
    }
    setLoading(false);
  };

  const getMessageStyle = () => {
    if (!message) return null;
    const isError = message.toLowerCase().includes('failed') || message.toLowerCase().includes('error');
    return isError
      ? { className: "bg-red-50 text-red-800", icon: <FaTimesCircle className="mr-2" /> }
      : { className: "bg-green-50 text-green-800", icon: <FaCheckCircle className="mr-2" /> };
  };

  const messageStyle = getMessageStyle();

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f1dd] px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-green-800">Create Account</h2>
        <h3 className="text-md mb-2 text-center text-gray-500 font-bold">Use your Email for updates!!!</h3>
        <h4 className="text-md mb-6 text-center text-gray-600">Join us and enjoy fresh fruits delivered to your doorstep!</h4>
        
        {message && (
            <div className={`flex items-center p-4 mb-4 rounded-lg font-semibold ${messageStyle.className}`} role="alert">
                {messageStyle.icon}
                <span>{message}</span>
            </div>
        )}
        
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Name:</label>
          <input
            type="text"
            autoComplete="name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Email:</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Password:</label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white font-bold py-3 rounded-full hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Signing up...
            </>
          ) : (
            'Sign up'
          )}
        </button>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-green-700 hover:underline font-semibold">
            Already have an account? Log In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Signup;