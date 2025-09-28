require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import authModule that exports router and transporter
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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
const allowedOrigins = [
  "https://fruitelegance.in",
  "http://localhost:3000"
];
// Middleware setup
app.use(cors(allowedOrigins));
app.use(express.json());

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  console.log('Request body:', req.body);
  next();
});

// Use router from authModule.router (important!)
app.use('/api/auth', authModule.router);

app.use('/api/user', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/categories', categoryRoutes.publicRoutes);
app.use('/api/admin/categories', verifyToken, verifyAdmin, categoryRoutes.adminRoutes);
app.use('/api/products', productRoutes.publicRoutes);
app.use('/api/admin/products', verifyToken, verifyAdmin, productRoutes.adminRoutes);
app.use('/api/admin', verifyToken, verifyAdmin, adminOrdersRoutes);

app.get('/', (req, res) => {
  res.send('Backend server is up and running');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
