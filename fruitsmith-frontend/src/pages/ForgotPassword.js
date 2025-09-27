import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      setMessage(response.data.message || 'Email sent with password reset instructions');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please check the email address.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f1dd] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-green-800">Forgot Password</h2>

        {message && (
          <div className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50" role="alert">
            <FaCheckCircle className="mr-2" />
            <span className="font-semibold">{message}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50" role="alert">
            <FaTimesCircle className="mr-2" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">Email Address:</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
              placeholder="Enter your registered email"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white font-bold py-3 rounded-full hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Sending...
              </>
            ) : (
              'Send Reset Email'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/login" className="text-green-700 hover:underline font-semibold">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;