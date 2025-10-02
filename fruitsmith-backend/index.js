require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import authModule that exports { router, transporter }
const authModule = require('./routes/auth');

const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminOrdersRoutes = require('./routes/adminOrder');

const { verifyToken, verifyAdmin } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 4000;

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Proper CORS configuration (array of allowed origins)
const allowedOrigins = [
  'https://fruitelegance.in',
  'https://app.fruitelegance.in',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Optional: request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}]`, req.method, req.url);
  next();
});

// Mount routers
// IMPORTANT: Use the router from the exported object
app.use('/api/auth', authModule.router); // => /api/auth/guest-checkout

// Optional quick health to verify mount; remove after testing
app.get('/api/auth/health', (req, res) => res.json({ ok: true }));

app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoryRoutes.publicRoutes);
app.use('/api/admin/categories', verifyToken, verifyAdmin, categoryRoutes.adminRoutes);
app.use('/api/products', productRoutes.publicRoutes);
app.use('/api/admin/products', verifyToken, verifyAdmin, productRoutes.adminRoutes);
app.use('/api/admin', verifyToken, verifyAdmin, adminOrdersRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Backend server is up and running');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
