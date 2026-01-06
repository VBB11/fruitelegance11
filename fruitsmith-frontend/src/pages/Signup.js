import React, { useState, useEffect } from 'react';
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

  /* ---------------- GOOGLE SIGNUP ---------------- */
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
        document.getElementById('googleSignupDiv'),
        { theme: 'outline', size: 'large' }
      );
    };

    script.onload = () => {
      window.onGoogleLibraryLoad();
    };

    return () => {
      document.body.removeChild(script);
      delete window.google;
      delete window.onGoogleLibraryLoad;
    };
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      setMessage('');
      setLoading(true);

      const API_BASE_URL =
        process.env.REACT_APP_API_URL ||
        config.backendUrl ||
        'http://localhost:4000';

      await axios.post(`${API_BASE_URL}/api/auth/google`, {
        tokenId: response.credential,
      });

      setMessage('Signup successful with Google! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Google signup failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- NORMAL SIGNUP ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const API_BASE_URL =
        process.env.REACT_APP_API_URL ||
        config.backendUrl ||
        'http://localhost:4000';

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/signup`,
        { name, email, password }
      );

      setMessage(response.data.message || 'Signup successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const isError =
    message.toLowerCase().includes('failed') ||
    message.toLowerCase().includes('error');

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f9f1dd] px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-extrabold mb-6 text-center text-green-800">
          Create Account
        </h2>

        {message && (
          <div
            className={`flex items-center p-4 mb-4 rounded-lg font-semibold ${
              isError
                ? 'bg-red-50 text-red-800'
                : 'bg-green-50 text-green-800'
            }`}
          >
            {isError ? (
              <FaTimesCircle className="mr-2" />
            ) : (
              <FaCheckCircle className="mr-2" />
            )}
            <span>{message}</span>
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            Name:
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">
            Email:
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">
            Password:
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white font-bold py-3 rounded-full flex justify-center items-center disabled:opacity-50"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Signing up...
            </>
          ) : (
            'Sign up'
          )}
        </button>

        {/* -------- GOOGLE SIGNUP -------- */}
        <div className="mt-6 text-center text-gray-600">
          <p>Or continue with</p>
        </div>
        <div className="mt-4 flex justify-center">
          <div id="googleSignupDiv"></div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            Already have an account? Log In
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Signup;
