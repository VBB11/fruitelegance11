import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaSpinner, FaTimesCircle } from 'react-icons/fa';
import config from './config/config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Load Google Identity Services script for Google sign-in button
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    window.onGoogleLibraryLoad = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large' }
      );
    };

    script.onload = () => {
      window.onGoogleLibraryLoad();
    };

    // Cleanup script on unmount
    return () => {
      document.body.removeChild(script);
      delete window.google;
      delete window.onGoogleLibraryLoad;
    };
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      setError('');
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_API_URL || config.backendUrl || 'http://localhost:4000';
      const res = await axios.post(`${API_BASE_URL}/api/auth/google`, { tokenId: response.credential });
      const { token, role, user } = res.data;

      login({ token, user, role });

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || config.backendUrl || 'http://localhost:4000';
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const { token, role, user } = response.data;

      login({ token, user, role });

      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f1dd] px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-green-800">Login</h2>
        {error && (
            <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50" role="alert">
                <FaTimesCircle className="mr-2" />
                <span className="font-semibold">{error}</span>
            </div>
        )}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Email:</label>
          <input
            type="email"
            autoComplete="username"
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
            autoComplete="current-password"
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
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            'Login'
          )}
        </button>

        <div className="mt-6 text-center text-gray-600">
            <p>Or continue with</p>
        </div>
        <div className="mt-4 flex justify-center">
            <div id="googleSignInDiv"></div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/signup" className="text-green-700 hover:underline font-semibold">
            Don't have an account? Sign Up
          </Link>
        </div>
        <div className="mt-2 text-center">
          <Link to="/forgot-password" className="text-green-700 hover:underline font-semibold">
            Forgot Password?
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;