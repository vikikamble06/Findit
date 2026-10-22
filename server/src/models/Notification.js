const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true
    },
    type: {
      type: String,
      enum: ['match_found', 'claim_submitted', 'claim_status_changed', 'item_resolved', 'system'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item'
    },
    claim: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
