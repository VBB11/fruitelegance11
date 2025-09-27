const express = require('express');
const categoryController = require('../controllers/categoryController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const publicRouter = express.Router();
const adminRouter = express.Router();

// Public route to get categories
publicRouter.get('/', categoryController.getCategories);

// Admin routes - require auth and admin
adminRouter.use(verifyToken);
adminRouter.use(verifyAdmin);

// Admin get categories (optional but useful)
adminRouter.get('/', categoryController.getCategories);
adminRouter.post('/', categoryController.addCategory);
adminRouter.put('/:id', categoryController.updateCategory);
adminRouter.delete('/:id', categoryController.deleteCategory);

module.exports = {
  publicRoutes: publicRouter,
  adminRoutes: adminRouter,
};
