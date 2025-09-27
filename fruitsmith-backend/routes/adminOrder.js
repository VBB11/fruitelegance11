// routes/adminorder.js
const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.use(verifyToken);
router.use(verifyAdmin); // Only admin access

// Get all orders
router.get('/orders', adminOrderController.getAllOrders);

// Get order details by ID
router.get('/orders/:id', adminOrderController.getOrderById);

// Update order status
router.patch('/orders/:id/status', adminOrderController.updateOrderStatus);

module.exports = router;
