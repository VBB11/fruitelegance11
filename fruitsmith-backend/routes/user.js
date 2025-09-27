const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Products');
const mongoose = require('mongoose');

// Get user profile (without password)
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get orders for authenticated user
router.get('/orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate('items.productId', 'name category')
      .sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get addresses for authenticated user
router.get('/addresses', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.addresses || []);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new address for authenticated user
router.post('/addresses', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json(user.addresses.slice(-1)[0]);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
});


// Update an address for an authenticated user
router.put('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const addressIndex = user.addresses.findIndex(addr => String(addr._id) === req.params.id);
    if (addressIndex === -1) {
      return res.status(404).json({ error: 'Address not found' });
    }

    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...req.body };
    await user.save();
    res.json(user.addresses[addressIndex]);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an address for an authenticated user
router.delete('/addresses/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
        return res.status(400).json({ error: 'Invalid address ID format.' });
    }

    const result = await User.updateOne(
        { _id: userId },
        { $pull: { addresses: { _id: addressId } } }
    );

    if (result.modifiedCount === 0) {
        return res.status(404).json({ error: 'Address not found or not deleted.' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete address.' });
  }
});


// Get user favourites
router.get('/favourites', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

// Add favourite
router.post('/favourites', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  if (!productId) return res.status(400).json({ error: 'Product ID is required' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.favorites.includes(productId)) {
      user.favorites.push(productId);
      await user.save();
    }
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

// Remove favourite
router.delete('/favourites/:productId', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    await user.save();
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

// Create new order after payment
router.post('/orders', verifyToken, async (req, res) => {
  try {
    const { cart, shippingAddress, totalAmount, paymentId } = req.body;
    const userId = req.user.id;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty.' });
    }

    const orderItems = await Promise.all(cart.map(async (cartItem) => {
      const product = await Product.findById(cartItem._id);
      if (!product) {
        throw new Error(`Product with ID ${cartItem._id} not found.`);
      }
      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        qty: cartItem.qty,
        image: product.image,
      };
    }));

    const newOrder = new Order({
      userId,
      items: orderItems,
      shippingAddress,
      totalAmount,
      status: 'Processing',
      paymentId
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

module.exports = router;