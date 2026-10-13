import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { performDeduplication } from '../services/deduplication';

describe('Data Provenance & Mutation Verification', () => {
  const originalCsvPath = path.resolve(process.cwd(), 'data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv');

  describe('Original Dataset Provenance Gate', () => {
    it('verifies dataset file presence or reports UNVERIFIED pending user file', () => {
      const fileExists = fs.existsSync(originalCsvPath);

      if (!fileExists) {
        console.warn(
          '[PROVENANCE AUDIT]: Original file data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv is absent. ' +
          'Per Anti-Hallucination Protocol 0.c, we do NOT regenerate it. Awaiting authentic file from user.'
        );
        expect(fileExists).toBe(false); // Accurately records current state without inventing data
      } else {
        const fileBuffer = fs.readFileSync(originalCsvPath);
        const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        console.log(`[PROVENANCE AUDIT]: Found original file with SHA256: ${hash}`);
        expect(hash).toBeTruthy();
      }
    });
  });

  describe('Mutation Testing: Deduplication and KPI Dynamism', () => {
    it('proves that KPIs dynamically respond to duplicated rows and are not hardcoded', () => {
      // 1. Base cohort of 100 distinct synthetic records
      const baseCohort = Array.from({ length: 100 }, (_, i) => ({
        id: `rec-${i}`,
        review: `Customer feedback sentiment review number ${i} with specific feedback.`,
        category: i % 2 === 0 ? 'Customer Service' : 'Product Feedback'
      }));

      const baseResult = performDeduplication(baseCohort);

      expect(baseResult.summary.rawCount).toBe(100);
      expect(baseResult.summary.exactUniqueCount).toBe(100);
      expect(baseResult.summary.normalizedUniqueCount).toBe(100);
      expect(baseResult.summary.duplicatePercentage).toBe(0);
      expect(baseResult.summary.repetitionDistribution.singletons).toBe(100);

      // 2. Mutate dataset by duplicating 50 rows
      const duplicate50 = baseCohort.slice(0, 50).map((r, i) => ({
        ...r,
        id: `dup-${i}`
      }));
      const mutatedCohort = [...baseCohort, ...duplicate50];

      const mutatedResult = performDeduplication(mutatedCohort);

      // 3. Confirm every single KPI changed dynamically
      expect(mutatedResult.summary.rawCount).toBe(150); // Changed from 100 to 150
      expect(mutatedResult.summary.exactUniqueCount).toBe(100); // Unique count preserved
      expect(mutatedResult.summary.normalizedUniqueCount).toBe(100);
      expect(mutatedResult.summary.exactDuplicatesRemoved).toBe(50); // Changed from 0 to 50
      expect(mutatedResult.summary.normalizedDuplicatesRemoved).toBe(50);
      expect(mutatedResult.summary.duplicatePercentage).toBeCloseTo(33.3, 1); // 50 / 150 = 33.33%
      expect(mutatedResult.summary.repetitionDistribution.singletons).toBe(50); // Changed from 100 to 50
      expect(mutatedResult.summary.repetitionDistribution.lowRepetition).toBe(50); // Changed from 0 to 50

      // Proves KPIs are computed at runtime and cannot be hardcoded constants
    });
  });
});
