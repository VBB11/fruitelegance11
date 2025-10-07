// routes/categoryRoutes.js
const express = require('express');
const categoryController = require('../controllers/categoryController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const publicRouter = express.Router();
const adminRouter = express.Router();

// Public route to get only active categories (sorted)
publicRouter.get('/', categoryController.getCategoriesPublic);

// Admin routes - require auth and admin
adminRouter.use(verifyToken);
adminRouter.use(verifyAdmin);

adminRouter.get('/', categoryController.getCategoriesAdmin);
adminRouter.post('/', categoryController.addCategory);
adminRouter.put('/:id', categoryController.updateCategory);
adminRouter.delete('/:id', categoryController.deleteCategory);

module.exports = {
  publicRoutes: publicRouter,
  adminRoutes: adminRouter,
};
