import { describe, it, expect } from 'vitest';
import { normalizeReviewText, performDeduplication } from '../services/deduplication';

describe('Deduplication Engine Unit Tests', () => {
  describe('normalizeReviewText', () => {
    it('lowercases text and trims outer whitespace', () => {
      const input = '   Great Product!   ';
      expect(normalizeReviewText(input)).toBe('great product');
    });

    it('strips punctuation and compresses internal whitespace', () => {
      const input = 'The service... was    fast, friendly, and reliable!!!';
      expect(normalizeReviewText(input)).toBe('the service was fast friendly and reliable');
    });

    it('returns empty string for empty or whitespace-only inputs', () => {
      expect(normalizeReviewText('')).toBe('');
      expect(normalizeReviewText('   \n\t  ')).toBe('');
    });
  });

  describe('performDeduplication', () => {
    it('returns empty summary structure when given empty array', () => {
      const result = performDeduplication([]);
      expect(result.summary.rawCount).toBe(0);
      expect(result.summary.exactUniqueCount).toBe(0);
      expect(result.summary.normalizedUniqueCount).toBe(0);
      expect(result.summary.duplicatePercentage).toBe(0);
      expect(result.deduplicatedRecords).toHaveLength(0);
      expect(result.recordsWithDuplicateMetadata).toHaveLength(0);
    });

    it('accurately distinguishes exact duplicates from normalized near-duplicates', () => {
      const records = [
        { id: '1', review: 'Great delivery.' },
        { id: '2', review: 'Great delivery.' }, // exact duplicate of 1
        { id: '3', review: 'great delivery!' }, // normalized duplicate (differs by case and punctuation)
        { id: '4', review: 'Terrible experience.' } // unique singleton
      ];

      const result = performDeduplication(records);

      expect(result.summary.rawCount).toBe(4);
      expect(result.summary.exactUniqueCount).toBe(3); // 'Great delivery.', 'great delivery!', 'Terrible experience.'
      expect(result.summary.normalizedUniqueCount).toBe(2); // 'great delivery', 'terrible experience'
      expect(result.summary.exactDuplicatesRemoved).toBe(1);
      expect(result.summary.normalizedDuplicatesRemoved).toBe(2);
      expect(result.summary.duplicatePercentage).toBe(50); // 2 / 4 * 100 = 50%
      expect(result.summary.repetitionDistribution.singletons).toBe(1); // 'terrible experience' appeared 1 time
      expect(result.summary.repetitionDistribution.lowRepetition).toBe(1); // 'great delivery' appeared 3 times
    });

    it('enriches every record with exact metadata', () => {
      const records = [
        { id: 'a', review: 'Item broken on arrival.' },
        { id: 'b', review: 'item broken on arrival' }
      ];

      const result = performDeduplication(records);

      expect(result.recordsWithDuplicateMetadata).toHaveLength(2);
      expect(result.recordsWithDuplicateMetadata[0].isDuplicate).toBe(true);
      expect(result.recordsWithDuplicateMetadata[0].duplicateCount).toBe(2);
      expect(result.recordsWithDuplicateMetadata[0].normalizedKey).toBe('item broken on arrival');
      expect(result.deduplicatedRecords).toHaveLength(1);
      expect(result.deduplicatedRecords[0].id).toBe('a');
    });
  });
});
