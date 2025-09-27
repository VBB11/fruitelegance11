// productRoutes.js
const express = require('express');
const productController = require('../controllers/productController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const publicRouter = express.Router();
const adminRouter = express.Router();

// Public routes
publicRouter.get('/', productController.getProducts);
publicRouter.get('/:id', productController.getProductById);

// Admin routes - protected
adminRouter.use(verifyToken);
adminRouter.use(verifyAdmin);

// The getProductsAdmin route is here. No changes needed to this line.
adminRouter.get('/', productController.getProductsAdmin);
adminRouter.post('/', productController.addProduct);
adminRouter.put('/:id', productController.updateProduct);
adminRouter.delete('/:id', productController.deleteProduct);

module.exports = {
  publicRoutes: publicRouter,
  adminRoutes: adminRouter,
};