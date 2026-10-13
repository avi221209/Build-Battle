
export interface DeduplicationSummary {
  rawCount: number;
  exactUniqueCount: number;
  normalizedUniqueCount: number;
  exactDuplicatesRemoved: number;
  normalizedDuplicatesRemoved: number;
  duplicatePercentage: number;
  repetitionDistribution: {
    singletons: number;       // Appeared exactly 1 time
    lowRepetition: number;    // Appeared 2-10 times
    mediumRepetition: number; // Appeared 11-50 times
    highRepetition: number;   // Appeared 50+ times
  };
}

export interface DeduplicatedResult<T extends { review: string }> {
  originalRecords: T[];
  deduplicatedRecords: T[];
  summary: DeduplicationSummary;
  recordsWithDuplicateMetadata: (T & {
    isDuplicate: boolean;
    duplicateCount: number;
    normalizedKey: string;
  })[];
}

/**
 * Normalizes a review string for robust near-exact duplicate detection:
 * trims whitespace, converts to lowercase, normalizes multiple spaces, strips trailing punctuation
 */
export function normalizeReviewText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // remove punctuation for fuzzy match key
    .replace(/\s+/g, ' ')
    .trim();
}

export function performDeduplication<T extends { review: string; id: string }>(
  records: T[]
): DeduplicatedResult<T> {
  const rawCount = records.length;
  
  // Track exact and normalized matches
  const exactMap = new Map<string, number>();
  const normalizedMap = new Map<string, { firstRecord: T; count: number; ids: string[] }>();

  records.forEach(rec => {
    // Exact count
    exactMap.set(rec.review, (exactMap.get(rec.review) || 0) + 1);

    // Normalized count
    const normKey = normalizeReviewText(rec.review);
    const existing = normalizedMap.get(normKey);
    if (!existing) {
      normalizedMap.set(normKey, { firstRecord: rec, count: 1, ids: [rec.id] });
    } else {
      existing.count += 1;
      existing.ids.push(rec.id);
    }
  });

  const exactUniqueCount = exactMap.size;
  const normalizedUniqueCount = normalizedMap.size;
  const exactDuplicatesRemoved = rawCount - exactUniqueCount;
  const normalizedDuplicatesRemoved = rawCount - normalizedUniqueCount;
  const duplicatePercentage = rawCount > 0 ? (normalizedDuplicatesRemoved / rawCount) * 100 : 0;

  let singletons = 0;
  let lowRepetition = 0;
  let mediumRepetition = 0;
  let highRepetition = 0;

  normalizedMap.forEach(item => {
    if (item.count === 1) singletons++;
    else if (item.count <= 10) lowRepetition++;
    else if (item.count <= 50) mediumRepetition++;
    else highRepetition++;
  });

  // Unique records (1 representative per normalized review)
  const deduplicatedRecords: T[] = Array.from(normalizedMap.values()).map(v => v.firstRecord);

  // Metadata enriched records
  const recordsWithDuplicateMetadata = records.map(rec => {
    const normKey = normalizeReviewText(rec.review);
    const item = normalizedMap.get(normKey);
    const count = item ? item.count : 1;
    return {
      ...rec,
      isDuplicate: count > 1,
      duplicateCount: count,
      normalizedKey: normKey
    };
  });

  return {
    originalRecords: records,
    deduplicatedRecords,
    summary: {
      rawCount,
      exactUniqueCount,
      normalizedUniqueCount,
      exactDuplicatesRemoved,
      normalizedDuplicatesRemoved,
      duplicatePercentage: Math.round(duplicatePercentage * 10) / 10,
      repetitionDistribution: {
        singletons,
        lowRepetition,
        mediumRepetition,
        highRepetition
      }
    },
    recordsWithDuplicateMetadata
  };
}
