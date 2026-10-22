const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);

const passThrough = (req, res, next) => next();

const apiLimiter = isTest
  ? passThrough
  : rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.'
      }
    });

const authLimiter = isTest
  ? passThrough
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 25,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many login or registration attempts. Please try again in 15 minutes.'
      }
    });

const actionLimiter = isTest
  ? passThrough
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 40,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: 'Too many submissions. Please slow down.'
      }
    });

module.exports = {
  apiLimiter,
  authLimiter,
  actionLimiter
};
