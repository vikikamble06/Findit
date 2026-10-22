const QRCode = require('qrcode');
const Item = require('../models/Item');
const Match = require('../models/Match');
const Claim = require('../models/Claim');
const { processMatchesForItem } = require('../services/matchingEngine');

// @route   GET /api/items
const getItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      campusZone,
      color,
      status,
      search,
      startDate,
      endDate,
      reporter,
      page = 1,
      limit = 12,
      sort = 'newest'
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (campusZone) query.campusZone = campusZone;
    if (color && color !== 'All') query.color = new RegExp(`^${color}$`, 'i');
    if (reporter) query.reporter = reporter;

    // Filter by status (default to open & pending for public browsing)
    if (status) {
      query.status = status;
    } else if (!reporter) {
      query.status = { $in: ['open', 'pending'] };
    }

    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Text search
    if (search && search.trim()) {
      const trimmedSearch = search.trim();
      query.$or = [
        { title: { $regex: trimmedSearch, $options: 'i' } },
        { description: { $regex: trimmedSearch, $options: 'i' } },
        { approximateLocation: { $regex: trimmedSearch, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'date_desc') sortOption = { date: -1 };
    else if (sort === 'date_asc') sortOption = { date: 1 };

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(query)
        .populate('reporter', 'name department')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Item.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: items.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1,
        limit: limitNum
      },
      items
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/items/:id
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reporter', 'name department createdAt')
      .lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Check if the current user has claimed this item
    let userClaim = null;
    if (req.user) {
      userClaim = await Claim.findOne({
        item: item._id,
        claimant: req.user._id
      }).select('status createdAt adminReview');
    }

    res.status(200).json({
      success: true,
      item,
      userClaim
    });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/items
const createItem = async (req, res, next) => {
  try {
    const {
      type,
      title,
      category,
      description,
      color,
      campusZone,
      approximateLocation,
      date,
      tags
    } = req.body;

    // Process uploaded images
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        imagePaths.push(`/uploads/${file.filename}`);
      });
    }

    // Generate campus QR code data URL for public reference
    const qrPayload = JSON.stringify({
      app: 'FindIt-Campus',
      type,
      title,
      campusZone,
      reportedAt: new Date().toISOString()
    });
    const qrCode = await QRCode.toDataURL(qrPayload).catch(() => '');

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const item = await Item.create({
      reporter: req.user._id,
      type,
      title,
      category,
      description,
      color,
      campusZone,
      approximateLocation,
      date: new Date(date),
      images: imagePaths,
      tags: parsedTags,
      qrCode,
      status: 'open'
    });

    // Run matching engine asynchronously to calculate similarities
    processMatchesForItem(item).catch((err) => {
      console.error('Error running matching engine for new item:', err.message);
    });

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully!`,
      item
    });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/items/:id
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Ensure only reporter or admin can edit
    if (String(item.reporter) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this report'
      });
    }

    const {
      title,
      category,
      description,
      color,
      campusZone,
      approximateLocation,
      date,
      status,
      tags
    } = req.body;

    if (title) item.title = title;
    if (category) item.category = category;
    if (description) item.description = description;
    if (color) item.color = color;
    if (campusZone) item.campusZone = campusZone;
    if (approximateLocation) item.approximateLocation = approximateLocation;
    if (date) item.date = new Date(date);
    if (status) item.status = status;
    if (tags) {
      item.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // Append newly uploaded images if any
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        item.images.push(`/uploads/${file.filename}`);
      });
    }

    await item.save();

    // Re-run matching if core matching fields changed
    if (title || category || color || campusZone || description) {
      processMatchesForItem(item).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      item
    });
  } catch (err) {
    next(err);
  }
};

// @route   DELETE /api/items/:id
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Ensure only reporter or admin can delete
    if (String(item.reporter) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this report'
      });
    }

    // Delete item and related matches & claims
    await Promise.all([
      Item.findByIdAndDelete(item._id),
      Match.deleteMany({ $or: [{ lostItem: item._id }, { foundItem: item._id }] }),
      Claim.deleteMany({ item: item._id })
    ]);

    res.status(200).json({
      success: true,
      message: 'Item report deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/items/:id/matches
const getItemMatches = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Build query for matches
    const matchQuery = item.type === 'lost'
      ? { lostItem: item._id }
      : { foundItem: item._id };

    const matches = await Match.find(matchQuery)
      .populate({
        path: item.type === 'lost' ? 'foundItem' : 'lostItem',
        select: 'title category color campusZone approximateLocation date images status reporter',
        populate: {
          path: 'reporter',
          select: 'name department'
        }
      })
      .sort({ similarityScore: -1 })
      .lean();

    // Format response so candidate item is always under `matchedItem`
    const formatted = matches
      .map((m) => {
        const candidate = item.type === 'lost' ? m.foundItem : m.lostItem;
        if (!candidate) return null;
        return {
          _id: m._id,
          similarityScore: m.similarityScore,
          scoreBreakdown: m.scoreBreakdown,
          explanation: m.explanation,
          matchCategory: m.matchCategory,
          status: m.status,
          createdAt: m.createdAt,
          matchedItem: candidate
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      count: formatted.length,
      matches: formatted
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getItemMatches
};
