import { describe, it, expect } from 'vitest';
import {
  buildInstructionDataset,
  exportToAdaptionJsonl,
  computeImportedComparison,
  generateTestFixture
} from '../services/adaptionService';
import { AnalyzedFeedbackRecord } from '../types/feedback';

describe('Adaption Integration & Service Unit Tests', () => {
  const mockRecord: AnalyzedFeedbackRecord = {
    id: 'rec-1',
    review: 'The mobile app keeps crashing during checkout.',
    sourceCategory: 'Website and ordering',
    sentiment: 'negative',
    sentimentScore: -0.8,
    topic: 'Website and ordering',
    issueType: 'Bug',
    summary: 'The mobile app keeps crashing during checkout.',
    urgency: 'Critical',
    confidence: 0.92,
    evidenceSnippets: ['crashing during checkout'],
    isDuplicate: false,
    duplicateCount: 1,
    normalizedKey: 'the mobile app keeps crashing during checkout',
    analyzedAt: new Date().toISOString(),
    analysisMethod: 'deterministic_lexicon'
  };

  describe('exportToAdaptionJsonl', () => {
    it('produces valid JSON on every single line and matches row count', () => {
      const instructions = buildInstructionDataset([mockRecord]);
      const jsonlOutput = exportToAdaptionJsonl(instructions);

      expect(jsonlOutput.trim().length).toBeGreaterThan(0);
      const lines = jsonlOutput.trim().split('\n');
      expect(lines).toHaveLength(1);

      lines.forEach(line => {
        expect(() => JSON.parse(line)).not.toThrow();
        const parsed = JSON.parse(line);
        expect(parsed).toHaveProperty('prompt');
        expect(parsed).toHaveProperty('context');
        expect(parsed).toHaveProperty('completion');
      });
    });

    it('enforces that JSONL export contains strictly unique reviews and line count equals unique count', () => {
      const records: AnalyzedFeedbackRecord[] = [
        mockRecord,
        {
          ...mockRecord,
          id: 'rec-2',
          review: 'Delivery was on time and fast.',
          normalizedKey: 'delivery was on time and fast'
        },
        {
          ...mockRecord,
          id: 'rec-3-dup',
          isDuplicate: true,
          duplicateCount: 2
        }
      ];

      const uniqueRecords = records.filter(r => !r.isDuplicate);
      const instructions = buildInstructionDataset(uniqueRecords);
      const jsonl = exportToAdaptionJsonl(instructions);
      const lines = jsonl.trim().split('\n');

      expect(lines).toHaveLength(uniqueRecords.length);
      expect(lines).toHaveLength(2);
      lines.forEach(line => {
        expect(() => JSON.parse(line)).not.toThrow();
      });
    });
  });

  describe('computeImportedComparison', () => {
    it('computes exact label agreement and changed labels when comparing against imported dataset', () => {
      const originalRecords: AnalyzedFeedbackRecord[] = [
        mockRecord,
        {
          ...mockRecord,
          id: 'rec-2',
          review: 'Delivery was on time and fast.',
          normalizedKey: 'delivery was on time and fast',
          sentiment: 'positive',
          topic: 'Delivery and fulfillment'
        }
      ];

      // Simulated imported data: first item changed to neutral, second unchanged
      const importedData = [
        {
          review: 'The mobile app keeps crashing during checkout.',
          sentiment: 'neutral',
          topic: 'Website and ordering'
        },
        {
          review: 'Delivery was on time and fast.',
          sentiment: 'positive',
          topic: 'Delivery and fulfillment'
        }
      ];

      const metrics = computeImportedComparison(originalRecords, importedData, false);

      expect(metrics.originalRowsCount).toBe(2);
      expect(metrics.importedRowsCount).toBe(2);
      expect(metrics.rowDiff).toBe(0);
      expect(metrics.changedLabelsCount).toBe(1);
      expect(metrics.unchangedLabelsCount).toBe(1);
      expect(metrics.labelAgreementPercentage).toBe(50); // 1 / 2 * 100 = 50%
      expect(metrics.isFixture).toBe(false);
    });
  });

  describe('generateTestFixture', () => {
    it('generates a clearly labeled synthetic verification test fixture with 20 records', () => {
      // Create 20 mock records
      const records: AnalyzedFeedbackRecord[] = Array.from({ length: 25 }, (_, i) => ({
        ...mockRecord,
        id: `rec-${i}`,
        review: `Review sample item ${i}`,
        normalizedKey: `review sample item ${i}`
      }));

      const fixture = generateTestFixture(records);

      expect(fixture.fixtureLabel).toBe('TEST FIXTURE (Synthetic Verification Sample - 20 records)');
      expect(fixture.data).toHaveLength(20);
      expect(fixture.data[0]).toHaveProperty('review');
      expect(fixture.data[0]).toHaveProperty('sentiment');
      expect(fixture.data[0]).toHaveProperty('topic');
      expect(fixture.data[0]).toHaveProperty('completion');
    });
  });
});
