const express = require('express');
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getItemMatches
} = require('../controllers/itemController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { actionLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const { itemSchema, itemUpdateSchema, validateBody } = require('../validators/schemas');

const router = express.Router();

router.get('/', optionalAuth, getItems);
router.get('/:id', optionalAuth, getItemById);
router.get('/:id/matches', optionalAuth, getItemMatches);

router.post(
  '/',
  requireAuth,
  actionLimiter,
  upload.array('images', 4),
  validateBody(itemSchema),
  createItem
);

router.patch(
  '/:id',
  requireAuth,
  upload.array('images', 4),
  validateBody(itemUpdateSchema),
  updateItem
);

router.delete('/:id', requireAuth, deleteItem);

module.exports = router;
