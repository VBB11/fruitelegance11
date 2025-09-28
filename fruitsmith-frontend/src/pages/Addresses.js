import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaPlus, FaPencilAlt, FaTrashAlt, FaMapMarkerAlt, FaChevronLeft, FaTimesCircle } from 'react-icons/fa';
import config from './config/config';

function Addresses() {
  const { token, user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: '',
    mobile: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchAddresses = async () => {
      setLoading(true);
      setError('');
      try {
        const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || config.backendUrl || 'http://localhost:4000';
        const res = await axios.get(`${API_BASE_URL}/api/user/addresses`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAddresses(res.data);
      } catch {
        setError('Failed to load addresses.');
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [token]);

  const handleChange = (e) => {
    setNewAddress(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEdit = (address) => {
    setEditingAddressId(address._id);
    setNewAddress({
      name: address.name || '',
      mobile: address.mobile || '',
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
    });
    setShowForm(true);
    setError('');
  };

  const cancelEdit = () => {
    setEditingAddressId(null);
    setNewAddress({ name: '', mobile: '', street: '', city: '', state: '', zip: '', country: '' });
    setShowForm(false);
    setError('');
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || config.backendUrl || 'http://localhost:4000';
      const res = await axios.post(`${API_BASE_URL}/api/user/addresses`, newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(prev => [...prev, res.data]);
      cancelEdit();
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to add address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAddress = async (e) => {
    e.preventDefault();
    if (!editingAddressId) {
      setError('No address selected for editing.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || config.backendUrl || 'http://localhost:4000';
      const res = await axios.put(`${API_BASE_URL}/api/user/addresses/${editingAddressId}`, newAddress, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(prev => prev.map(addr => (addr._id === editingAddressId ? res.data : addr)));
      cancelEdit();
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to update address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    setError('');
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || config.backendUrl || 'http://localhost:4000';
      await axios.delete(`${API_BASE_URL}/api/user/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      if (editingAddressId === addressId) cancelEdit();
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to delete address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-lg text-gray-600">
        Loading addresses...
      </div>
    );
  }
  
  if (!user) {
      return (
          <div className="flex items-center justify-center min-h-[60vh] text-lg text-gray-600">
              Please log in to manage your addresses.
          </div>
      );
  }

  return (
    <div className="bg-[#f9f1dd] min-h-screen p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-8 sm:p-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-green-800">Saved Addresses</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-700 text-white py-2 px-4 rounded-full flex items-center hover:bg-green-800 transition"
            >
              <FaPlus className="mr-2" /> Add New
            </button>
          )}
        </div>

        {error && (
            <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50" role="alert">
                <FaTimesCircle className="mr-2" />
                <span className="font-semibold">{error}</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="py-8 text-center text-gray-600">
                <p>You have no saved addresses.</p>
                <p>Add your first address to get started!</p>
              </div>
            ) : (
              addresses.map(addr => (
                <div key={addr._id} className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 mb-1 flex items-center">
                        <FaMapMarkerAlt className="text-green-700 mr-2" />
                        {addr.name}
                      </h3>
                      <p className="text-gray-600">{addr.street}</p>
                      <p className="text-gray-600">{`${addr.city}, ${addr.state} ${addr.zip}`}</p>
                      <p className="text-gray-600">{addr.country}</p>
                      <p className="text-gray-600 font-semibold mt-1">Mobile: {addr.mobile}</p>
                    </div>
                    <div className="flex space-x-2 mt-1">
                      <button
                        onClick={() => startEdit(addr)}
                        className="p-2 rounded-full text-blue-600 hover:bg-blue-50 transition"
                        aria-label="Edit address"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="p-2 rounded-full text-red-600 hover:bg-red-50 transition"
                        aria-label="Delete address"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {showForm && (
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-green-800 mb-6">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <form onSubmit={editingAddressId ? handleEditAddress : handleAddAddress} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={newAddress.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  required
                  autoComplete="name"
                />
                <input
                  type="tel"
                  name="mobile"
                  value={newAddress.mobile}
                  onChange={handleChange}
                  placeholder="Mobile Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  required
                  autoComplete="tel"
                />
                <input
                  type="text"
                  name="street"
                  value={newAddress.street}
                  onChange={handleChange}
                  placeholder="Street"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  required
                  autoComplete="street-address"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                    autoComplete="address-level2"
                  />
                  <input
                    type="text"
                    name="state"
                    value={newAddress.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                    autoComplete="address-level1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="zip"
                    value={newAddress.zip}
                    onChange={handleChange}
                    placeholder="ZIP Code"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                    autoComplete="postal-code"
                  />
                  <input
                    type="text"
                    name="country"
                    value={newAddress.country}
                    onChange={handleChange}
                    placeholder="Country"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    required
                    autoComplete="country-name"
                  />
                </div>
                <div className="flex space-x-4 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 text-white py-3 px-4 rounded-full font-semibold transition-colors ${
                      isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-800'
                    }`}
                  >
                    {isSubmitting ? 'Saving...' : editingAddressId ? 'Save Address' : 'Add Address'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-full font-semibold hover:bg-gray-300 transition"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Addresses;