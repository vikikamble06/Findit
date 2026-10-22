const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'can', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to',
  'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'found', 'lost',
  'item', 'items', 'please', 'help', 'contact', 'anyone', 'someone'
]);

// Canonical concept mapping for synonyms
const SYNONYM_MAP = {
  earbuds: 'earphones',
  airpods: 'earphones',
  headphones: 'earphones',
  earpiece: 'earphones',
  buds: 'earphones',
  flask: 'bottle',
  sipper: 'bottle',
  thermos: 'bottle',
  waterbottle: 'bottle',
  idcard: 'id_card',
  studentcard: 'id_card',
  identity: 'id_card',
  badge: 'id_card',
  adapter: 'charger',
  cable: 'charger',
  cord: 'charger',
  powerbank: 'charger',
  jacket: 'hoodie',
  sweatshirt: 'hoodie',
  sweater: 'hoodie',
  coat: 'hoodie',
  register: 'notebook',
  diary: 'notebook',
  journal: 'notebook',
  purse: 'wallet',
  pouch: 'wallet',
  keychain: 'keys',
  keyring: 'keys',
  smartwatch: 'watch',
  spectacles: 'glasses',
  sunglasses: 'glasses',
  goggles: 'glasses',
  specs: 'glasses',
  macbook: 'laptop',
  thinkpad: 'laptop',
  chromebook: 'laptop',
  backpack: 'bag',
  schoolbag: 'bag',
  handbag: 'bag',
  duffle: 'bag'
};

/**
 * Clean and tokenize a text string, applying stop-word removal and synonym canonicalization
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  const rawTokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const normalized = [];
  for (const token of rawTokens) {
    if (STOP_WORDS.has(token)) continue;
    const canonical = SYNONYM_MAP[token] || token;
    normalized.push(canonical);
  }
  return normalized;
}

/**
 * Calculate Jaccard similarity between two token arrays: |A ∩ B| / |A ∪ B|
 */
function jaccardSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }

  const unionCount = new Set([...setA, ...setB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Calculate combined title and description similarity score (0 to 1)
 */
function calculateTextSimilarity(itemA, itemB) {
  const titleA = tokenize(itemA.title);
  const titleB = tokenize(itemB.title);
  const descA = tokenize(itemA.description);
  const descB = tokenize(itemB.description);

  const titleScore = jaccardSimilarity(titleA, titleB);
  const descScore = jaccardSimilarity(descA, descB);

  // Cross comparison: title of A in desc of B and vice versa
  const crossScore1 = jaccardSimilarity(titleA, descB);
  const crossScore2 = jaccardSimilarity(titleB, descA);
  const crossScore = Math.max(crossScore1, crossScore2);

  // Titles carry higher weight (50%), description (35%), cross-match (15%)
  const combined = (titleScore * 0.5) + (descScore * 0.35) + (crossScore * 0.15);
  return Math.min(1, Math.max(0, combined));
}

module.exports = {
  tokenize,
  jaccardSimilarity,
  calculateTextSimilarity,
  SYNONYM_MAP
};
