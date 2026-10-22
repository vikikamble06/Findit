const { z } = require('zod');
const { CATEGORIES, CAMPUS_ZONES, ITEM_TYPES, ITEM_STATUSES, CLAIM_STATUSES } = require('../utils/constants');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().trim().max(30).optional(),
  department: z.string().trim().max(80).optional()
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

const itemSchema = z.object({
  type: z.enum(ITEM_TYPES, { errorMap: () => ({ message: 'Type must be "lost" or "found"' }) }),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Invalid category' }) }),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  color: z.string().trim().min(2, 'Color is required').max(50),
  campusZone: z.enum(CAMPUS_ZONES, { errorMap: () => ({ message: 'Invalid campus zone' }) }),
  approximateLocation: z.string().trim().min(3, 'Location details must be at least 3 characters').max(180),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
});

const itemUpdateSchema = itemSchema.partial().extend({
  status: z.enum(ITEM_STATUSES).optional()
});

const claimSchema = z.object({
  distinguishingMarks: z.string().trim().min(5, 'Distinguishing marks must be at least 5 characters').max(1000),
  contentsOrDetails: z.string().trim().max(1000).optional(),
  additionalProof: z.string().trim().max(1000).optional()
});

const claimReviewSchema = z.object({
  status: z.enum(['approved', 'rejected', 'more-info-needed']),
  notes: z.string().trim().max(500).optional()
});

const itemStatusSchema = z.object({
  status: z.enum(ITEM_STATUSES)
});

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerSchema,
  loginSchema,
  itemSchema,
  itemUpdateSchema,
  claimSchema,
  claimReviewSchema,
  itemStatusSchema,
  validateBody
};
