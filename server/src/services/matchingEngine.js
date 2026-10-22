const Item = require('../models/Item');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const { ZONE_ADJACENCY, COLOR_SYNONYMS } = require('../utils/constants');
const { calculateTextSimilarity } = require('../utils/textSimilarity');

const WEIGHTS = {
  category: 25,
  text: 30,
  color: 15,
  location: 20,
  date: 10
};

/**
 * Calculate category similarity (0 to 1)
 */
function calculateCategoryScore(catA, catB) {
  if (!catA || !catB) return 0.5; // Unknown
  if (catA.toLowerCase() === catB.toLowerCase()) return 1.0;

  // Closely related category pairings
  const related = {
    'Bags & Wallets': ['Accessories', 'Clothing'],
    'Accessories': ['Bags & Wallets', 'Keys', 'Electronics'],
    'Electronics': ['Accessories'],
    'Clothing': ['Accessories', 'Bags & Wallets'],
    'Books & Stationery': ['Documents & IDs']
  };

  if (related[catA] && related[catA].includes(catB)) return 0.45;
  if (related[catB] && related[catB].includes(catA)) return 0.45;

  return 0.0;
}

/**
 * Calculate color similarity (0 to 1)
 */
function calculateColorScore(colorA, colorB) {
  if (!colorA || !colorB) return 0.5;
  const cA = colorA.toLowerCase().trim();
  const cB = colorB.toLowerCase().trim();

  if (cA === cB) return 1.0;
  if (cA === 'other' || cB === 'other') return 0.4;

  const synonymsA = COLOR_SYNONYMS[cA] || [];
  if (synonymsA.includes(cB)) return 0.85;

  const synonymsB = COLOR_SYNONYMS[cB] || [];
  if (synonymsB.includes(cA)) return 0.85;

  return 0.0;
}

/**
 * Calculate location similarity using campus zone proximity (0 to 1)
 */
function calculateLocationScore(zoneA, zoneB) {
  if (!zoneA || !zoneB) return 0.5;
  if (zoneA === zoneB) return 1.0;

  const adjacentA = ZONE_ADJACENCY[zoneA] || [];
  if (adjacentA.includes(zoneB)) return 0.70;

  const adjacentB = ZONE_ADJACENCY[zoneB] || [];
  if (adjacentB.includes(zoneA)) return 0.70;

  return 0.25;
}

/**
 * Calculate date proximity score using decay function (0 to 1)
 */
function calculateDateScore(dateA, dateB) {
  if (!dateA || !dateB) return 0.5;

  const dA = new Date(dateA).getTime();
  const dB = new Date(dateB).getTime();
  if (isNaN(dA) || isNaN(dB)) return 0.5;

  const diffMs = Math.abs(dA - dB);
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 1) return 1.0;
  if (diffDays <= 3) return 0.85;
  if (diffDays <= 7) return 0.65;
  if (diffDays <= 14) return 0.45;
  if (diffDays <= 30) return 0.25;
  return 0.10;
}

/**
 * Generate human-readable explanation of the match
 */
function generateExplanation(itemA, itemB, breakdown, overallScore) {
  const matchParts = [];
  const diffParts = [];

  // Category
  if (breakdown.categoryScore >= 0.9) {
    matchParts.push(`identical category (${itemA.category})`);
  } else if (breakdown.categoryScore > 0.3) {
    matchParts.push(`related categories (${itemA.category} & ${itemB.category})`);
  }

  // Text
  if (breakdown.textScore >= 0.4) {
    matchParts.push('strongly matching keywords in title & description');
  } else if (breakdown.textScore >= 0.2) {
    matchParts.push('similar descriptive terms');
  }

  // Color
  if (breakdown.colorScore >= 0.9) {
    matchParts.push(`matching ${itemA.color} color`);
  } else if (breakdown.colorScore >= 0.7) {
    matchParts.push(`closely related colors (${itemA.color} vs ${itemB.color})`);
  } else if (itemA.color !== 'Other' && itemB.color !== 'Other') {
    diffParts.push(`different colors (${itemA.color} vs ${itemB.color})`);
  }

  // Location
  if (breakdown.locationScore >= 0.9) {
    matchParts.push(`same campus zone (${itemA.campusZone})`);
  } else if (breakdown.locationScore >= 0.6) {
    matchParts.push(`adjacent campus zones (${itemA.campusZone} & ${itemB.campusZone})`);
  } else {
    diffParts.push(`different zones (${itemA.campusZone} vs ${itemB.campusZone})`);
  }

  // Date
  if (breakdown.dateScore >= 0.8) {
    matchParts.push('reported within 1-3 days of each other');
  } else if (breakdown.dateScore >= 0.6) {
    matchParts.push('reported within the same week');
  }

  const level = overallScore >= 75 ? 'Strong similarity' : overallScore >= 50 ? 'Potential match' : 'Low similarity';
  let text = `${level} (${overallScore}%): `;

  if (matchParts.length > 0) {
    text += `Shares ${matchParts.join(', ')}. `;
  } else {
    text += 'Some overlapping item features. ';
  }

  if (diffParts.length > 0) {
    text += `Note differences: ${diffParts.join(', ')}.`;
  }

  return text.trim();
}

/**
 * Calculate similarity between two items
 */
function compareItems(itemA, itemB) {
  const catScore = calculateCategoryScore(itemA.category, itemB.category);
  const textScore = calculateTextSimilarity(itemA, itemB);
  const colorScore = calculateColorScore(itemA.color, itemB.color);
  const locScore = calculateLocationScore(itemA.campusZone, itemB.campusZone);
  const dateScore = calculateDateScore(itemA.date, itemB.date);

  const weightedTotal =
    (catScore * WEIGHTS.category) +
    (textScore * WEIGHTS.text) +
    (colorScore * WEIGHTS.color) +
    (locScore * WEIGHTS.location) +
    (dateScore * WEIGHTS.date);

  const normalizedScore = Math.round(Math.min(100, Math.max(0, weightedTotal)));

  let matchCategory = 'low';
  if (normalizedScore >= 75) matchCategory = 'high';
  else if (normalizedScore >= 50) matchCategory = 'possible';

  const breakdown = {
    categoryScore: catScore,
    textScore: textScore,
    colorScore: colorScore,
    locationScore: locScore,
    dateScore: dateScore
  };

  const explanation = generateExplanation(itemA, itemB, breakdown, normalizedScore);

  return {
    score: normalizedScore,
    breakdown,
    matchCategory,
    explanation
  };
}

/**
 * Run matching engine for a newly created or updated item
 * Finds candidates of opposite type with status 'open' or 'pending',
 * calculates similarity, persists matches, and sends notifications for strong matches.
 */
async function processMatchesForItem(item) {
  if (!item || item.status === 'resolved' || item.status === 'archived') {
    return [];
  }

  const oppositeType = item.type === 'lost' ? 'found' : 'lost';

  // Retrieve candidate items from database
  const candidates = await Item.find({
    type: oppositeType,
    status: { $in: ['open', 'pending'] },
    _id: { $ne: item._id }
  }).lean();

  const results = [];

  for (const candidate of candidates) {
    const comparison = compareItems(item, candidate);

    // Only persist matches with score >= 50 (possible or high)
    if (comparison.score >= 50) {
      const lostId = item.type === 'lost' ? item._id : candidate._id;
      const foundId = item.type === 'found' ? item._id : candidate._id;

      const matchDoc = await Match.findOneAndUpdate(
        { lostItem: lostId, foundItem: foundId },
        {
          lostItem: lostId,
          foundItem: foundId,
          similarityScore: comparison.score,
          scoreBreakdown: {
            categoryScore: Math.round(comparison.breakdown.categoryScore * 100),
            textScore: Math.round(comparison.breakdown.textScore * 100),
            colorScore: Math.round(comparison.breakdown.colorScore * 100),
            locationScore: Math.round(comparison.breakdown.locationScore * 100),
            dateScore: Math.round(comparison.breakdown.dateScore * 100)
          },
          explanation: comparison.explanation,
          matchCategory: comparison.matchCategory,
          status: 'suggested'
        },
        { upsert: true, new: true }
      );

      results.push(matchDoc);

      // If high confidence match (>= 75), notify both users if not already notified
      if (comparison.score >= 70) {
        const itemOwnerId = item.reporter;
        const candidateOwnerId = candidate.reporter;

        // Notify creator of current item
        await Notification.create({
          recipient: itemOwnerId,
          type: 'match_found',
          title: `Potential Match Found (${comparison.score}%)`,
          message: `A ${oppositeType} report "${candidate.title}" in ${candidate.campusZone} matches your item "${item.title}".`,
          item: item._id
        }).catch(() => {});

        // Notify candidate owner if different user
        if (String(itemOwnerId) !== String(candidateOwnerId)) {
          await Notification.create({
            recipient: candidateOwnerId,
            type: 'match_found',
            title: `Potential Match Found (${comparison.score}%)`,
            message: `A new ${item.type} report "${item.title}" in ${item.campusZone} matches your item "${candidate.title}".`,
            item: candidate._id
          }).catch(() => {});
        }
      }
    }
  }

  return results;
}

module.exports = {
  WEIGHTS,
  calculateCategoryScore,
  calculateColorScore,
  calculateLocationScore,
  calculateDateScore,
  generateExplanation,
  compareItems,
  processMatchesForItem
};
