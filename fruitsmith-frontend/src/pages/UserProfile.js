import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle, FaEnvelope, FaSpinner, FaExclamationCircle, FaUserPlus, FaEdit, FaLock } from 'react-icons/fa';
import dayjs from 'dayjs';

// Initials Avatar Component
function InitialsAvatar({ name, size = 120, bgColor = '#4CAF50', textColor = '#fff' }) {
  const getInitials = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div
      className="flex items-center justify-center rounded-full font-bold select-none transition-all duration-300 transform shadow-lg"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        width: size,
        height: size,
        fontSize: size * 0.5,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      }}
    >
      {initials}
    </div>
  );
}

// Main User Profile Component
export default function UserProfile() {
  const [user, setUser] = useState(null);
  const { token } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!token) {
        setError('Please log in to view your profile.');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:4000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch user data.');
        }

        const data = await response.json();
        setUser(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    }
    fetchUserProfile();
  }, [token]);

  const handleDummyAction = (action) => {
    alert(`${action} functionality is coming soon!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl">
          <FaSpinner className="animate-spin text-4xl text-green-500 mb-4" />
          <p className="text-xl text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl text-red-600">
          <FaExclamationCircle className="text-4xl mb-4" />
          <p className="text-xl font-medium text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
        <div className="absolute top-0 left-0 w-full h-1/2 rounded-t-3xl bg-gradient-to-r from-green-500 to-green-700" />
        
        <div className="relative z-10 text-center -mt-16">
          <div className="mx-auto mb-6">
            <InitialsAvatar name={user.name} size={120} />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">{user.name}</h1>
          <p className="text-lg text-gray-500 mb-6 font-medium">User Profile</p>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
              <FaUserCircle className="text-green-600 mr-4 text-2xl" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-500">Name</span>
                <span className="text-lg font-bold text-gray-800">{user.name}</span>
              </div>
            </div>
            <div className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
              <FaEnvelope className="text-green-600 mr-4 text-2xl" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-500">Email Address</span>
                <span className="text-lg font-bold text-gray-800 break-words">{user.email}</span>
              </div>
            </div>
            {user.createdAt && (
              <div className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                <FaUserPlus className="text-green-600 mr-4 text-2xl" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-500">Joined On</span>
                  <span className="text-lg font-bold text-gray-800">{dayjs(user.createdAt).format('MMMM D, YYYY')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Account Actions</h2>
            <button
              onClick={() => handleDummyAction('Edit Profile')}
              className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => handleDummyAction('Change Password')}
              className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              <FaLock />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}