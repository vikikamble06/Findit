import { describe, it, expect } from 'vitest';
const {
  calculateCategoryScore,
  calculateColorScore,
  calculateLocationScore,
  calculateDateScore,
  compareItems,
  WEIGHTS
} = require('../services/matchingEngine');
const { tokenize, jaccardSimilarity, calculateTextSimilarity } = require('../utils/textSimilarity');

describe('Intelligent Similarity-Based Matching Engine', () => {
  describe('Text Tokenization and Synonym Canonicalization', () => {
    it('removes common stop words and punctuation', () => {
      const tokens = tokenize('Lost my black wireless earbuds in the library!');
      expect(tokens).toContain('black');
      expect(tokens).toContain('earphones'); // Canonical synonym for earbuds
      expect(tokens).toContain('library');
      expect(tokens).not.toContain('in');
      expect(tokens).not.toContain('the');
      expect(tokens).not.toContain('my');
    });

    it('maps synonyms to canonical tokens', () => {
      expect(tokenize('airpods')).toEqual(['earphones']);
      expect(tokenize('sipper flask')).toEqual(['bottle', 'bottle']);
      expect(tokenize('studentcard')).toEqual(['id_card']);
      expect(tokenize('keychain')).toEqual(['keys']);
    });

    it('calculates Jaccard similarity correctly', () => {
      const tokensA = ['black', 'earphones', 'boat'];
      const tokensB = ['black', 'earphones', 'case'];
      // Intersection: ['black', 'earphones'] (2), Union: ['black', 'earphones', 'boat', 'case'] (4) -> 0.5
      const sim = jaccardSimilarity(tokensA, tokensB);
      expect(sim).toBe(0.5);
    });
  });

  describe('Attribute Scoring', () => {
    it('scores exact category matches at 1.0', () => {
      expect(calculateCategoryScore('Electronics', 'Electronics')).toBe(1.0);
    });

    it('scores related category matches at partial credit (~0.45)', () => {
      const score = calculateCategoryScore('Bags & Wallets', 'Accessories');
      expect(score).toBeGreaterThan(0.4);
    });

    it('scores unrelated categories at 0.0', () => {
      expect(calculateCategoryScore('Electronics', 'Clothing')).toBe(0.0);
    });

    it('scores exact and synonym colors accurately', () => {
      expect(calculateColorScore('Black', 'Black')).toBe(1.0);
      expect(calculateColorScore('Black', 'dark')).toBe(0.85);
      expect(calculateColorScore('Blue', 'Navy')).toBe(0.85);
      expect(calculateColorScore('Silver', 'Gray')).toBe(0.85);
      expect(calculateColorScore('Red', 'Green')).toBe(0.0);
    });

    it('scores campus zone proximity', () => {
      // Same zone
      expect(calculateLocationScore('Central Library', 'Central Library')).toBe(1.0);
      // Adjacent zone
      expect(calculateLocationScore('Central Library', 'Main Academic Complex')).toBe(0.70);
      // Distant zone
      expect(calculateLocationScore('Central Library', 'Sports Complex & Gym')).toBe(0.25);
    });

    it('applies date decay correctly', () => {
      const baseDate = new Date('2026-10-20T10:00:00Z');
      const sameDay = new Date('2026-10-20T14:00:00Z');
      const twoDaysLater = new Date('2026-10-22T10:00:00Z');
      const monthLater = new Date('2026-11-20T10:00:00Z');

      expect(calculateDateScore(baseDate, sameDay)).toBe(1.0);
      expect(calculateDateScore(baseDate, twoDaysLater)).toBe(0.85);
      expect(calculateDateScore(baseDate, monthLater)).toBe(0.10);
    });
  });

  describe('End-to-End Item Comparison', () => {
    it('produces high similarity score for complementary earbud reports', () => {
      const lostEarbuds = {
        title: 'Black BoAt Airdopes Wireless Earbuds',
        description: 'Lost black wireless earbuds inside charging case near window',
        category: 'Electronics',
        color: 'Black',
        campusZone: 'Central Library',
        date: new Date('2026-10-20')
      };

      const foundEarbuds = {
        title: 'Black Wireless Earphones with Case',
        description: 'Found black true wireless earphones on a desk in the library reading room',
        category: 'Electronics',
        color: 'Black',
        campusZone: 'Central Library',
        date: new Date('2026-10-21')
      };

      const result = compareItems(lostEarbuds, foundEarbuds);
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.matchCategory).toBe('high');
      expect(result.explanation).toContain('Strong similarity');
      expect(result.explanation).toContain('Electronics');
    });

    it('produces low similarity score for completely unrelated items', () => {
      const lostWatch = {
        title: 'Gold Analog Wristwatch',
        description: 'Titan gold vintage wristwatch lost near sports track',
        category: 'Accessories',
        color: 'Gold',
        campusZone: 'Sports Complex & Gym',
        date: new Date('2026-10-01')
      };

      const foundKeys = {
        title: 'Room Keys with Blue Keychain',
        description: 'Two brass keys found in computer lab',
        category: 'Keys',
        color: 'Blue',
        campusZone: 'Engineering Labs',
        date: new Date('2026-10-20')
      };

      const result = compareItems(lostWatch, foundKeys);
      expect(result.score).toBeLessThan(50);
      expect(result.matchCategory).toBe('low');
    });
  });
});
