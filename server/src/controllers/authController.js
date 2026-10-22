const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const env = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      studentId: user.studentId,
      department: user.department,
      createdAt: user.createdAt
    }
  });
};

// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, studentId, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      studentId,
      department,
      role: 'user' // Default to user, admin is assigned via seed or admin controller
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by campus administration.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/auth/logout
const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Successfully logged out.'
  });
};

// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    const [reportsCount, claimsCount] = await Promise.all([
      Item.countDocuments({ reporter: req.user._id }),
      Claim.countDocuments({ claimant: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      user,
      stats: {
        reportsCount,
        claimsCount
      }
    });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/auth/me
const updateMe = async (req, res, next) => {
  try {
    const { name, studentId, department } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (studentId !== undefined) user.studentId = studentId;
    if (department !== undefined) user.department = department;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateMe
};
