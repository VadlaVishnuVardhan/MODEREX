const express = require('express');
const {
  getFlaggedContent,
  reviewFlaggedContent,
  getAdminStats,
  handleFlaggedAction,
} = require('../controllers/admin.controller');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/adminMiddleware');

const adminRouter = express.Router();

// All admin routes require authentication and admin privileges
adminRouter.use(authMiddleware, adminMiddleware);

adminRouter.get('/flagged', getFlaggedContent);
adminRouter.post('/flagged/:flaggedId/review', reviewFlaggedContent);
adminRouter.get('/stats', getAdminStats);

module.exports = adminRouter;
