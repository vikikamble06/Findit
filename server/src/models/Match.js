const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Lost item reference is required'],
      index: true
    },
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Found item reference is required'],
      index: true
    },
    similarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      index: true
    },
    scoreBreakdown: {
      categoryScore: { type: Number, default: 0 },
      textScore: { type: Number, default: 0 },
      colorScore: { type: Number, default: 0 },
      locationScore: { type: Number, default: 0 },
      dateScore: { type: Number, default: 0 }
    },
    explanation: {
      type: String,
      required: true,
      trim: true
    },
    matchCategory: {
      type: String,
      enum: ['high', 'possible', 'low'],
      default: 'possible',
      index: true
    },
    status: {
      type: String,
      enum: ['suggested', 'dismissed', 'confirmed'],
      default: 'suggested'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate matches between the exact same pair
matchSchema.index({ lostItem: 1, foundItem: 1 }, { unique: true });
matchSchema.index({ similarityScore: -1 });

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;
