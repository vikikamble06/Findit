const Claim = require('../models/Claim');
const Item = require('../models/Item');
const Notification = require('../models/Notification');

// @route   POST /api/claims
const submitClaim = async (req, res, next) => {
  try {
    const { itemId, distinguishingMarks, contentsOrDetails, additionalProof } = req.body;

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if user is the reporter
    if (String(item.reporter) === String(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit an ownership claim on an item that you reported.'
      });
    }

    if (item.status === 'resolved' || item.status === 'archived') {
      return res.status(400).json({
        success: false,
        message: 'This item has already been marked as resolved or archived.'
      });
    }

    // Check if claimant already has a claim for this item
    const existingClaim = await Claim.findOne({
      item: itemId,
      claimant: req.user._id
    });

    if (existingClaim) {
      return res.status(409).json({
        success: false,
        message: `You have already submitted a claim for this item (Status: ${existingClaim.status}).`
      });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user._id,
      verificationAnswers: {
        distinguishingMarks,
        contentsOrDetails: contentsOrDetails || '',
        additionalProof: additionalProof || ''
      },
      status: 'pending'
    });

    // Mark item status as pending review
    if (item.status === 'open') {
      item.status = 'pending';
      await item.save();
    }

    // Notify item reporter
    await Notification.create({
      recipient: item.reporter,
      type: 'claim_submitted',
      title: 'New Ownership Claim Submitted',
      message: `A campus user has submitted an ownership claim for your report "${item.title}". It is awaiting admin verification.`,
      item: item._id,
      claim: claim._id
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: 'Claim submitted successfully. Campus administrators will verify your details.',
      claim
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/claims/my
const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id })
      .populate('item', 'title category color campusZone approximateLocation date images status type')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: claims.length,
      claims
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/claims/:id
const getClaimById = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate('item')
      .populate('claimant', 'name email studentId department')
      .populate('adminReview.reviewedBy', 'name')
      .lean();

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    const isClaimant = String(claim.claimant._id) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    const isReporter = String(claim.item.reporter) === String(req.user._id);

    if (!isClaimant && !isAdmin && !isReporter) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this claim'
      });
    }

    res.status(200).json({
      success: true,
      claim
    });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/claims/:id/withdraw
const withdrawClaim = async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }

    if (String(claim.claimant) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to withdraw this claim'
      });
    }

    if (claim.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw an already approved claim'
      });
    }

    await Claim.findByIdAndDelete(claim._id);

    // If no other pending claims, reset item status to open
    const otherClaimsCount = await Claim.countDocuments({
      item: claim.item,
      status: 'pending'
    });

    if (otherClaimsCount === 0) {
      await Item.findByIdAndUpdate(claim.item, { status: 'open' });
    }

    res.status(200).json({
      success: true,
      message: 'Claim withdrawn successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitClaim,
  getMyClaims,
  getClaimById,
  withdrawClaim
};
