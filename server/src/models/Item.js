const mongoose = require('mongoose');
const { CATEGORIES, CAMPUS_ZONES, COLORS, ITEM_TYPES, ITEM_STATUSES } = require('../utils/constants');

const itemSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
      index: true
    },
    type: {
      type: String,
      enum: ITEM_TYPES,
      required: [true, 'Item type (lost or found) is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: [true, 'Category is required'],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [5, 'Description must be at least 5 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
      maxlength: [50, 'Color cannot exceed 50 characters']
    },
    campusZone: {
      type: String,
      enum: CAMPUS_ZONES,
      required: [true, 'Campus zone is required'],
      index: true
    },
    approximateLocation: {
      type: String,
      required: [true, 'Approximate location details are required'],
      trim: true,
      maxlength: [180, 'Location details cannot exceed 180 characters']
    },
    date: {
      type: Date,
      required: [true, 'Date of lost or found is required'],
      index: true
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ITEM_STATUSES,
      default: 'open',
      index: true
    },
    tags: {
      type: [String],
      default: []
    },
    qrCode: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound and text indexes for fast filtering & search
itemSchema.index({ type: 1, status: 1, category: 1 });
itemSchema.index({ type: 1, status: 1, campusZone: 1 });
itemSchema.index({ date: -1, status: 1 });
itemSchema.index({ title: 'text', description: 'text', approximateLocation: 'text' });

const Item = mongoose.model('Item', itemSchema);
module.exports = Item;
