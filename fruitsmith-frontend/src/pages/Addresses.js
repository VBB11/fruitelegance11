import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  FaPlus, 
  FaPencilAlt, 
  FaTrashAlt, 
  FaMapMarkerAlt, 
  FaTimesCircle, 
  FaLocationArrow, 
  FaSpinner 
} from 'react-icons/fa';
import config from './config/config';

function Addresses() {
  const { token, user } = useContext(AuthContext);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // New state for GPS
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

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || config.backendUrl || 'http://localhost:4000';

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchAddresses = async () => {
      setLoading(true);
      setError('');
      try {
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
  }, [token, API_BASE_URL]);

  // --- NEW: AUTO-FILL LOCATION LOGIC ---
  const fetchCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using Nominatim OpenStreetMap (Free Reverse Geocoding)
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          
          const addr = response.data.address;
          
          // Map external API fields to your local state
          setNewAddress((prev) => ({
            ...prev,
            // Combining building/road for the street field
            street: `${addr.house_number || ''} ${addr.road || addr.suburb || addr.neighbourhood || ''}`.trim(),
            city: addr.city || addr.town || addr.village || "",
            state: addr.state || "",
            zip: addr.postcode || "",
            country: addr.country || ""
          }));
          
          setError("Location detected! Please check the details.");
          setTimeout(() => setError(""), 4000);
        } catch (err) {
          setError("Could not find your address automatically. Please enter manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setError("Location access denied. Please enable it in your browser settings.");
        } else {
          setError("Location error: " + err.message);
        }
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

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
    if (!editingAddressId) return;
    setError('');
    setIsSubmitting(true);
    try {
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
      await axios.delete(`${API_BASE_URL}/api/user/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      if (editingAddressId === addressId) cancelEdit();
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to delete address.');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-600"><FaSpinner className="animate-spin mr-2"/> Loading...</div>;
  if (!user) return <div className="text-center p-20">Please log in to manage your addresses.</div>;

  return (
    <div className="bg-[#f9f1dd] min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-12">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-extrabold text-green-800">Saved Addresses</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-700 text-white py-2 px-6 rounded-full flex items-center hover:bg-green-800 transition shadow-md"
            >
              <FaPlus className="mr-2" /> Add New
            </button>
          )}
        </div>

        {error && (
            <div className={`flex items-center p-4 mb-6 rounded-lg ${error.includes('detected') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <FaTimesCircle className="mr-2" />
                <span className="font-semibold">{error}</span>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Address List */}
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="py-12 text-center text-gray-500 border-2 border-dashed rounded-2xl">
                <p>No saved addresses yet.</p>
              </div>
            ) : (
              addresses.map(addr => (
                <div key={addr._id} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800 mb-1 flex items-center">
                        <FaMapMarkerAlt className="text-green-700 mr-2" /> {addr.name}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{addr.street}, {addr.city}, {addr.state} {addr.zip}</p>
                      <p className="text-gray-600 font-semibold mt-2 text-sm italic">Mobile: {addr.mobile}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(addr)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"><FaPencilAlt /></button>
                      <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"><FaTrashAlt /></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Form Section */}
          {showForm && (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-100 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-2xl font-bold text-green-800">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h3>
                
                {/* LOCATE ME BUTTON */}
                {!editingAddressId && (
                  <button
                    type="button"
                    onClick={fetchCurrentLocation}
                    disabled={isLocating}
                    className="flex items-center gap-2 text-sm font-extrabold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    {isLocating ? <FaSpinner className="animate-spin" /> : <FaLocationArrow />}
                    {isLocating ? "Detecting..." : "Use Current Location"}
                  </button>
                )}
              </div>

              <form onSubmit={editingAddressId ? handleEditAddress : handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" name="name" value={newAddress.name} onChange={handleChange} placeholder="Full Name" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none" required />
                  <input type="tel" name="mobile" value={newAddress.mobile} onChange={handleChange} placeholder="Mobile Number" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none" required />
                </div>
                
                <input type="text" name="street" value={newAddress.street} onChange={handleChange} placeholder="House No, Building, Street Name" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none" required />
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="city" value={newAddress.city} onChange={handleChange} placeholder="City" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none" required />
                  <input type="text" name="state" value={newAddress.state} onChange={handleChange} placeholder="State" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" name="zip" value={newAddress.zip} onChange={handleChange} placeholder="Pincode / ZIP" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none" required />
                  <input type="text" name="country" value={newAddress.country} onChange={handleChange} placeholder="Country" className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-400 outline-none" required />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={isSubmitting || isLocating} className="flex-1 bg-green-700 text-white py-3 rounded-full font-bold hover:bg-green-800 transition disabled:opacity-50">
                    {isSubmitting ? 'Processing...' : (editingAddressId ? 'Update Address' : 'Save Address')}
                  </button>
                  <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-full font-bold hover:bg-gray-200 transition">
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