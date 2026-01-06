// orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Existing user routes (protected for regular users)
router.use(verifyToken);
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

// New admin routes (protected for admins only)
const adminRouter = express.Router();
adminRouter.use(verifyToken, verifyAdmin);

adminRouter.get('/orders', orderController.getAdminOrders);
adminRouter.patch('/orders/:id/status', orderController.updateOrderStatus);

// Mount the admin router under the /admin path
router.use('/admin', adminRouter);

module.exports = router;