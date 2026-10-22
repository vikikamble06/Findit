const express = require('express');
const {
  submitClaim,
  getMyClaims,
  getClaimById,
  withdrawClaim
} = require('../controllers/claimController');
const { requireAuth } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimiter');
const { claimSchema, validateBody } = require('../validators/schemas');

const router = express.Router();

router.post('/', requireAuth, actionLimiter, validateBody(claimSchema), submitClaim);
router.get('/my', requireAuth, getMyClaims);
router.get('/:id', requireAuth, getClaimById);
router.patch('/:id/withdraw', requireAuth, withdrawClaim);

module.exports = router;
