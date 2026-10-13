import { describe, it, expect } from 'vitest';
import { parseAndValidateCsv, generateDeterministicRecordId } from '../services/csvIngestion';

describe('CSV Ingestion, Stable IDs, Field Overrides & Column Detection', () => {
  const sampleCsvContent = `review,category\n"Great fast checkout experience.",Website\n"Fraudulent payment deducted twice.",Fraud and Scam\n"Defective battery casing on arrival.",Product Feedback`;

  describe('Deterministic & Stable Record IDs', () => {
    it('generates deterministic IDs that are identical across repeated parses of the exact same content', () => {
      const parseRun1 = parseAndValidateCsv(sampleCsvContent);
      const parseRun2 = parseAndValidateCsv(sampleCsvContent);

      expect(parseRun1.isValid).toBe(true);
      expect(parseRun2.isValid).toBe(true);
      expect(parseRun1.records).toHaveLength(3);
      expect(parseRun2.records).toHaveLength(3);

      // Verify each record ID matches identically across parses
      parseRun1.records.forEach((rec, i) => {
        expect(rec.id).toBe(parseRun2.records[i].id);
        expect(rec.id).toMatch(/^rec-\d+-[a-f0-9]{8}$/);
      });
    });

    it('proves that issues linked to record IDs still resolve after a file reload/reparse', () => {
      // 1. Initial parse
      const initialParse = parseAndValidateCsv(sampleCsvContent);
      const recordToTrack = initialParse.records[1]; // Fraud record

      // 2. Simulate issue created and linked to originating record ID
      const trackedIssue = {
        issueId: 'tracked-101',
        title: 'Investigate Fraudulent Payment',
        originatingFeedbackIds: [recordToTrack.id],
      };

      // 3. User reloads application or re-parses identical CSV
      const reloadedParse = parseAndValidateCsv(sampleCsvContent);

      // 4. Resolve the linked feedback records from the reloaded dataset
      const resolvedRecords = reloadedParse.records.filter(r =>
        trackedIssue.originatingFeedbackIds.includes(r.id)
      );

      expect(resolvedRecords).toHaveLength(1);
      expect(resolvedRecords[0].id).toBe(recordToTrack.id);
      expect(resolvedRecords[0].review).toBe('Fraudulent payment deducted twice.');
      expect(resolvedRecords[0].category).toBe('Fraud and Scam');
    });

    it('pure function generateDeterministicRecordId returns consistent hashes for normalized reviews', () => {
      const id1 = generateDeterministicRecordId('Fast shipping and great service.', 0);
      const id2 = generateDeterministicRecordId('   Fast Shipping and Great Service.   ', 0);
      const idDiffRow = generateDeterministicRecordId('Fast shipping and great service.', 1);

      expect(id1).toBe(id2); // Case and whitespace normalization yields identical ID
      expect(id1).not.toBe(idDiffRow); // Different row index yields different ID
    });
  });

  describe('Field Override Protection', () => {
    it('prevents CSV columns named "id" and "review" from overriding system deterministic ID and trimmed review', () => {
      // CSV containing explicit columns named "id" and "review"
      const adversarialCsv = `id,review,category,user_custom_note
"adversarial-id-9999","  Actual customer complaint about broken screen.  ",Product Feedback,"extra metadata"`;

      const result = parseAndValidateCsv(adversarialCsv);
      expect(result.isValid).toBe(true);
      expect(result.records).toHaveLength(1);

      const record = result.records[0];

      // System-generated deterministic ID MUST take precedence over the CSV's "adversarial-id-9999"
      expect(record.id).not.toBe('adversarial-id-9999');
      expect(record.id).toMatch(/^rec-1-[a-f0-9]{8}$/);

      // Review text must be properly trimmed
      expect(record.review).toBe('Actual customer complaint about broken screen.');

      // Extra metadata column from row is preserved
      expect((record as Record<string, unknown>).user_custom_note).toBe('extra metadata');
    });
  });

  describe('Strict Column Detection & Empty-File Handling', () => {
    it('does NOT fall back to headers[0] when no column matches review/text/feedback', () => {
      // CSV with arbitrary headers not matching review/text/feedback
      const wrongColumnCsv = `serial_number,device_model,warehouse_code\nSN-12345,Model-X,WH-01\nSN-67890,Model-Y,WH-02`;

      const result = parseAndValidateCsv(wrongColumnCsv);

      // Must be marked INVALID until user maps the column
      expect(result.isValid).toBe(false);
      expect(result.records).toHaveLength(0);
      expect(result.mappedReviewColumn).toBe('');
      expect(result.headers).toEqual(['serial_number', 'device_model', 'warehouse_code']);
      expect(result.errors.some(e => e.includes('No review column detected'))).toBe(true);
      expect(result.previewRows).toHaveLength(2);
    });

    it('successfully parses wrong-column CSV once manual columnMapping is supplied', () => {
      const wrongColumnCsv = `serial_number,user_notes,department\nSN-123,Device screen is cracked,Hardware QA`;

      // Pass manual column mapping
      const result = parseAndValidateCsv(wrongColumnCsv, {
        reviewCol: 'user_notes',
        categoryCol: 'department',
      });

      expect(result.isValid).toBe(true);
      expect(result.records).toHaveLength(1);
      expect(result.mappedReviewColumn).toBe('user_notes');
      expect(result.mappedCategoryColumn).toBe('department');
      expect(result.records[0].review).toBe('Device screen is cracked');
      expect(result.records[0].category).toBe('Hardware QA');
    });

    it('marks empty file and whitespace-only file as invalid', () => {
      const emptyResult1 = parseAndValidateCsv('');
      expect(emptyResult1.isValid).toBe(false);
      expect(emptyResult1.errors.some(e => e.toLowerCase().includes('empty'))).toBe(true);

      const emptyResult2 = parseAndValidateCsv('   \n\r\n   ');
      expect(emptyResult2.isValid).toBe(false);
      expect(emptyResult2.errors.some(e => e.toLowerCase().includes('empty'))).toBe(true);

      const headerOnlyEmpty = parseAndValidateCsv('review,category\n');
      expect(headerOnlyEmpty.isValid).toBe(false);
      expect(headerOnlyEmpty.records).toHaveLength(0);
    });
  });
});
