import Papa from 'papaparse';
import { RawFeedbackRecord } from '../types/feedback';

export interface CsvValidationResult {
  isValid: boolean;
  totalRows: number;
  headers: string[];
  missingValuesCount: number;
  invalidRowsCount: number;
  mappedReviewColumn: string;
  mappedCategoryColumn: string;
  previewRows: Record<string, string>[];
  records: RawFeedbackRecord[];
  errors: string[];
}

/**
 * Deterministic record ID generator using 32-bit FNV-1a hash of normalized review + row index.
 * Guarantees identical IDs across file reloads and re-parses.
 */
export function generateDeterministicRecordId(normalizedReview: string, rowIndex: number): string {
  let h = 0x811c9dc5;
  const input = `${rowIndex}:${normalizedReview.trim().toLowerCase()}`;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const hashHex = (h >>> 0).toString(16).padStart(8, '0');
  return `rec-${rowIndex + 1}-${hashHex}`;
}

export function parseAndValidateCsv(
  csvContent: string,
  columnMapping?: { reviewCol?: string; categoryCol?: string }
): CsvValidationResult {
  if (!csvContent || csvContent.trim().length === 0) {
    return {
      isValid: false,
      totalRows: 0,
      headers: [],
      missingValuesCount: 0,
      invalidRowsCount: 0,
      mappedReviewColumn: '',
      mappedCategoryColumn: '',
      previewRows: [],
      records: [],
      errors: ['CSV file is empty.']
    };
  }

  const parseResult = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
  });

  const headers = (parseResult.meta.fields || []).map(h => h.trim()).filter(Boolean);
  const errors: string[] = [];

  if (headers.length === 0 || parseResult.data.length === 0) {
    return {
      isValid: false,
      totalRows: 0,
      headers: [],
      missingValuesCount: 0,
      invalidRowsCount: 0,
      mappedReviewColumn: '',
      mappedCategoryColumn: '',
      previewRows: [],
      records: [],
      errors: ['CSV file is empty or contains no readable rows.']
    };
  }

  // Determine review and category columns
  let reviewCol = columnMapping?.reviewCol?.trim();
  let categoryCol = columnMapping?.categoryCol?.trim();

  // If no explicit mapping provided, auto-detect ONLY if header matches review/text/feedback/comment/message/content
  if (!reviewCol) {
    const matched = headers.find(h => /^(review|text|feedback|comment|message|content)$/i.test(h.trim()));
    reviewCol = matched || '';
  }

  if (!categoryCol) {
    const matchedCat = headers.find(h => /^(category|tag|department|type|topic)$/i.test(h.trim()));
    categoryCol = matchedCat || '';
  }

  // Critical: If no column matches review/text/feedback, DO NOT fall back to headers[0].
  // Mark file invalid and return error for column mapping UI.
  if (!reviewCol) {
    errors.push('No review column detected (expected "review", "text", or "feedback"). Please map the review column.');
    return {
      isValid: false,
      totalRows: parseResult.data.length,
      headers,
      missingValuesCount: 0,
      invalidRowsCount: parseResult.data.length,
      mappedReviewColumn: '',
      mappedCategoryColumn: categoryCol || '',
      previewRows: parseResult.data.slice(0, 10),
      records: [],
      errors
    };
  }

  let missingValuesCount = 0;
  let invalidRowsCount = 0;
  const records: RawFeedbackRecord[] = [];

  parseResult.data.forEach((row, index) => {
    const reviewText = (row[reviewCol] || '').trim();
    const categoryText = (categoryCol ? row[categoryCol] || '' : 'General').trim();

    if (!reviewText) {
      missingValuesCount++;
      invalidRowsCount++;
      return;
    }

    // Spread ...row BEFORE id, review, and category so system values are never overridden by CSV columns
    records.push({
      ...row,
      id: generateDeterministicRecordId(reviewText, index),
      review: reviewText,
      category: categoryText || 'Uncategorized',
    });
  });

  const previewRows = parseResult.data.slice(0, 10);

  return {
    isValid: errors.length === 0 && records.length > 0,
    totalRows: parseResult.data.length,
    headers,
    missingValuesCount,
    invalidRowsCount,
    mappedReviewColumn: reviewCol,
    mappedCategoryColumn: categoryCol,
    previewRows,
    records,
    errors: records.length === 0 ? ['No valid non-empty review rows found.'] : errors
  };
}
