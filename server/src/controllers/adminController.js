const Item = require('../models/Item');
const Claim = require('../models/Claim');
const User = require('../models/User');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { logAdminAction } = require('../services/auditService');

// @route   GET /api/admin/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalItems,
      lostItems,
      foundItems,
      openItems,
      pendingClaims,
      resolvedItems,
      totalUsers,
      totalMatches,
      recentAuditLogs
    ] = await Promise.all([
      Item.countDocuments(),
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'open' }),
      Claim.countDocuments({ status: 'pending' }),
      Item.countDocuments({ status: 'resolved' }),
      User.countDocuments(),
      Match.countDocuments({ similarityScore: { $gte: 50 } }),
      AuditLog.find()
        .populate('admin', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalItems,
        lostItems,
        foundItems,
        openItems,
        pendingClaims,
        resolvedItems,
        totalUsers,
        totalMatches
      },
      recentAuditLogs
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/admin/claims
const getAllClaims = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));

    const [claims, total] = await Promise.all([
      Claim.find(query)
        .populate('item', 'title category color campusZone approximateLocation date images status type reporter')
        .populate('claimant', 'name email studentId department')
        .populate('adminReview.reviewedBy', 'name')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Claim.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      },
      claims
    });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/admin/claims/:id/review
const reviewClaim = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const claim = await Claim.findById(req.params.id).populate('item');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    claim.status = status;
    claim.adminReview = {
      reviewedBy: req.user._id,
      notes: notes || '',
      reviewedAt: new Date()
    };
    await claim.save();

    const item = await Item.findById(claim.item._id);

    if (status === 'approved') {
      // Mark item as resolved
      item.status = 'resolved';
      await item.save();

      // Reject all other pending claims on this item
      await Claim.updateMany(
        { item: item._id, _id: { $ne: claim._id }, status: 'pending' },
        {
          status: 'rejected',
          adminReview: {
            reviewedBy: req.user._id,
            notes: 'Another claim has been verified and approved by administration.',
            reviewedAt: new Date()
          }
        }
      );

      // Notify claimant
      await Notification.create({
        recipient: claim.claimant,
        type: 'claim_status_changed',
        title: 'Ownership Claim Approved! 🎉',
        message: `Your ownership claim for "${item.title}" has been verified and approved by campus administration. Please coordinate safe handover at the Campus Security / Student Affairs Office.`,
        item: item._id,
        claim: claim._id
      }).catch(() => {});

      // Notify item reporter
      await Notification.create({
        recipient: item.reporter,
        type: 'item_resolved',
        title: 'Item Claimed & Verified',
        message: `The report "${item.title}" has been successfully resolved and claimed. Thank you for your campus contribution!`,
        item: item._id
      }).catch(() => {});
    } else if (status === 'rejected') {
      // Check if there are other pending claims
      const remainingClaims = await Claim.countDocuments({
        item: item._id,
        status: 'pending'
      });

      if (remainingClaims === 0 && item.status === 'pending') {
        item.status = 'open';
        await item.save();
      }

      await Notification.create({
        recipient: claim.claimant,
        type: 'claim_status_changed',
        title: 'Claim Update: Verification Unsuccessful',
        message: `Your claim for "${item.title}" could not be verified with the provided details. Reason: ${notes || 'Information provided did not match item characteristics.'}`,
        item: item._id,
        claim: claim._id
      }).catch(() => {});
    } else if (status === 'more-info-needed') {
      await Notification.create({
        recipient: claim.claimant,
        type: 'claim_status_changed',
        title: 'More Information Required for Claim',
        message: `Campus administration requested additional details to verify your claim for "${item.title}": ${notes || 'Please provide additional proof.'}`,
        item: item._id,
        claim: claim._id
      }).catch(() => {});
    }

    // Log admin action
    await logAdminAction({
      adminId: req.user._id,
      action: `CLAIM_${status.toUpperCase()}`,
      resourceType: 'Claim',
      resourceId: claim._id,
      details: {
        itemId: item._id,
        itemTitle: item.title,
        status,
        notes
      },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Claim successfully updated to "${status}".`,
      claim
    });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/admin/items/:id/status
const updateItemStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    const previousStatus = item.status;
    item.status = status;
    await item.save();

    await logAdminAction({
      adminId: req.user._id,
      action: 'ITEM_STATUS_CHANGED',
      resourceType: 'Item',
      resourceId: item._id,
      details: { previousStatus, newStatus: status },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Item status updated to ${status}`,
      item
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/admin/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/admin/users/:id/status
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "suspended".'
      });
    }

    // Prevent admin from suspending self
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own account status.'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await logAdminAction({
      adminId: req.user._id,
      action: `USER_${status.toUpperCase()}`,
      resourceType: 'User',
      resourceId: user._id,
      details: { email: user.email, newStatus: status },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/admin/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('admin', 'name email role')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllClaims,
  reviewClaim,
  updateItemStatus,
  getAllUsers,
  updateUserStatus,
  getAuditLogs
};
