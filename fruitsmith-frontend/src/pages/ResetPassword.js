import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaLock } from 'react-icons/fa';
import config from './config/config';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for token existence only after initial render
    if (!token) {
      setError('Invalid or missing reset link. Please try the "Forgot Password" process again.');
    } else {
        // Clear message/error if token is present
        setError('');
        setMessage('');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Reset link is missing or invalid.');
      return;
    }

    if (newPassword.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || config.backendUrl || 'http://localhost:4000';
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        token,
        newPassword,
      });

      setMessage(response.data.message || 'Password reset successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/login');
      }, 3000); 

    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed. The link may have expired.');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f1dd] px-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-green-800 flex items-center justify-center gap-2">
            <FaLock className='text-green-700' size={24} /> Reset Your Password
        </h2>
        
        {error && (
            <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50" role="alert">
                <FaTimesCircle className="mr-2" />
                <span className="font-semibold">{error}</span>
            </div>
        )}
        {message && (
            <div className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50" role="alert">
                <FaCheckCircle className="mr-2" />
                <span className="font-semibold">{message}</span>
            </div>
        )}
        
        {/* Hide form if a final message is showing and no valid token is found */}
        {!(error && !token) && !message && (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">New Password (min 6 chars):</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">Confirm Password:</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white font-bold py-3 rounded-full hover:bg-green-800 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Resetting...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
            </form>
        )}
        
        <div className="mt-6 text-center">
            <Link to="/login" className="text-green-700 hover:underline font-semibold">
                Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;