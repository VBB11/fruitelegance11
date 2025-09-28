import React, { useEffect, useState } from 'react';
import config from './config/config';

function AdminProfile() {
  const [adminInfo, setAdminInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchAdmin() {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      try {
        const res = await fetch(`${config.backendUrl}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch admin profile');
        }
        const data = await res.json();
        setAdminInfo(data);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchAdmin();
  }, []);

  if (error) return <p style={{color: 'red'}}>{error}</p>;
  if (!adminInfo) return <p>Loading admin info...</p>;

  return (
    <div>
      <h2>Admin Profile</h2>
      <p><strong>Email:</strong> {adminInfo.email}</p>
      <p><strong>Role:</strong> {adminInfo.role}</p>
      {/* Add more admin-specific info here */}
    </div>
  );
}

export default AdminProfile;
