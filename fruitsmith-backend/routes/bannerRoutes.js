// routes/bannerRoutes.js
const express = require('express');
const bannerController = require('../controllers/bannerController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const publicRouter = express.Router();
const adminRouter = express.Router();

// Public
publicRouter.get('/', bannerController.getBannersPublic);

// Admin
adminRouter.use(verifyToken);
adminRouter.use(verifyAdmin);
adminRouter.get('/', bannerController.getBannersAdmin);
adminRouter.post('/', bannerController.addBanner);
adminRouter.put('/:id', bannerController.updateBanner);
adminRouter.delete('/:id', bannerController.deleteBanner);

module.exports = {
  publicRoutes: publicRouter,
  adminRoutes: adminRouter,
};
