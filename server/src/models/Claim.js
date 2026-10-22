const mongoose = require('mongoose');
const { CLAIM_STATUSES } = require('../utils/constants');

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item is required'],
      index: true
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Claimant is required'],
      index: true
    },
    status: {
      type: String,
      enum: CLAIM_STATUSES,
      default: 'pending',
      index: true
    },
    verificationAnswers: {
      distinguishingMarks: {
        type: String,
        required: [true, 'Distinguishing marks or proof of ownership is required'],
        trim: true,
        minlength: [5, 'Distinguishing marks must be at least 5 characters'],
        maxlength: [1000, 'Distinguishing marks cannot exceed 1000 characters']
      },
      contentsOrDetails: {
        type: String,
        trim: true,
        maxlength: [1000, 'Contents or details cannot exceed 1000 characters']
      },
      additionalProof: {
        type: String,
        trim: true,
        maxlength: [1000, 'Additional proof cannot exceed 1000 characters']
      }
    },
    adminReview: {
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [500]
      },
      reviewedAt: {
        type: Date
      }
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate active claims by same user on same item
claimSchema.index({ item: 1, claimant: 1 }, { unique: true });

const Claim = mongoose.model('Claim', claimSchema);
module.exports = Claim;
