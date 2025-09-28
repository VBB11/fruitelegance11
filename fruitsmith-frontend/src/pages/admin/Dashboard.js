import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';
import axios from 'axios';
import config from '../config/config';

function Dashboard() {
  const [stats, setStats] = useState({ categories: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const [catRes, prodRes, orderRes] = await Promise.all([
          axios.get(`${config.backendUrl}/api/categories`),
          axios.get(`${config.backendUrl}/api/products`),
          axios.get(`${config.backendUrl}/api/admin/orders`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        ]);

        const categoriesCount = Array.isArray(catRes.data.categories) ? catRes.data.categories.length :
          Array.isArray(catRes.data) ? catRes.data.length : 0;
        const productsCount = Array.isArray(prodRes.data.products) ? prodRes.data.products.length :
          Array.isArray(prodRes.data) ? prodRes.data.length : 0;
        const ordersCount = Array.isArray(orderRes.data.orders) ? orderRes.data.orders.length : 0;

        setStats({
          categories: categoriesCount,
          products: productsCount,
          orders: ordersCount,
        });
        setError('');
      } catch (e) {
        setError('Failed to load statistics');
      }
      setLoading(false);
    }

    fetchStats();
  }, []);

  const cardStyle = {
    flex: 1,
    padding: 30,
    backgroundColor: '#007bff',
    color: '#fff',
    borderRadius: 12,
    cursor: 'pointer',
    userSelect: 'none',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    boxShadow: '0 6px 12px rgba(0,123,255,0.4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease'
  };

  const iconStyle = {
    fontSize: 50
  };

  return (
    <>
      <AdminNav />
      <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
        <h1>Admin Dashboard</h1>
        {loading ? (
          <p>Loading statistics...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 20, marginBottom: 30 }}>
              <Card title="Manage Categories" link="/admin/categories" icon="📂" cardStyle={cardStyle} iconStyle={iconStyle} />
              <Card title="Manage Products" link="/admin/products" icon="🛒" cardStyle={cardStyle} iconStyle={iconStyle} />
              <Card title="Manage Orders" link="/admin/orders" icon="📋" cardStyle={cardStyle} iconStyle={iconStyle} />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Card({ title, link, icon, cardStyle, iconStyle }) {
  return (
    <Link
      to={link}
      style={{ textDecoration: 'none', flex: 1 }}
      onMouseEnter={e => {
        e.currentTarget.firstChild.style.backgroundColor = '#0056b3';
        e.currentTarget.firstChild.style.boxShadow = '0 8px 16px rgba(0,86,179,0.6)';
      }}
      onMouseLeave={e => {
        e.currentTarget.firstChild.style.backgroundColor = '#007bff';
        e.currentTarget.firstChild.style.boxShadow = '0 6px 12px rgba(0,123,255,0.4)';
      }}
    >
      <div style={cardStyle}>
        <div style={iconStyle}>{icon}</div>
        {title}
      </div>
    </Link>
  );
}

export default Dashboard;
