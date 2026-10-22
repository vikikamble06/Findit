const express = require('express');
const {
  getDashboardStats,
  getAllClaims,
  reviewClaim,
  updateItemStatus,
  getAllUsers,
  updateUserStatus,
  getAuditLogs
} = require('../controllers/adminController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { claimReviewSchema, itemStatusSchema, validateBody } = require('../validators/schemas');

const router = express.Router();

// All admin routes require admin privileges
router.use(requireAuth, requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/claims', getAllClaims);
router.patch('/claims/:id/review', validateBody(claimReviewSchema), reviewClaim);
router.patch('/items/:id/status', validateBody(itemStatusSchema), updateItemStatus);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
