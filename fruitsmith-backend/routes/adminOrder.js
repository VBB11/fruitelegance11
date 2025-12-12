// routes/adminorder.js
const express = require('express');
const router = express.Router();
const adminOrderController = require('../controllers/adminOrderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

router.use(verifyToken);
router.use(verifyAdmin); // Only admin access

// === NEW ROUTE FOR SUMMARY DATA ===
// Route to get aggregated KPIs (Total Revenue, Total Orders, Status Breakdown)
router.get('/orders/summary', adminOrderController.getOrdersSummary); 
// ==================================

// Get all orders (existing)
router.get('/orders', adminOrderController.getAllOrders);

// Get order details by ID (existing)
router.get('/orders/:id', adminOrderController.getOrderById);

// Update order status (existing)
router.patch('/orders/:id/status', adminOrderController.updateOrderStatus);

module.exports = router;