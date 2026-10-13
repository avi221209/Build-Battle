import { AnalyzedFeedbackRecord } from '../types/feedback';
import { normalizeReviewText } from './deduplication';
import {
  AdaptionColumnMapping,
  AdaptionRecipeSelection,
  ImportedComparisonMetrics,
  InstructionRow
} from '../types/adaption';

export const DEFAULT_RECIPE_SELECTION: AdaptionRecipeSelection = {
  promptDeduplication: true,
  promptRephrasing: true,
  reasoningTraces: true,
  hallucinationMitigation: true,
  brandVoice: true,
  blueprintEnabled: true,
  blueprintSystemPrompt:
    'You are InsightFlow Enterprise Assistant. Classify customer voice with high fidelity, cite supporting evidence verbatim from context, and provide structured, objective action items.',
  blueprintLength: 'Concise',
  blueprintSafetyCategories: ['Harassment', 'Hate', 'Fraud', 'PII Exposure']
};

export const DEFAULT_COLUMN_MAPPING: AdaptionColumnMapping = {
  promptColumn: 'instruction_prompt',
  contextColumns: ['review', 'category'],
  completionColumn: 'analysis_completion',
  universalPromptText:
    'Analyze the customer review provided in Context. Extract sentiment (positive, neutral, negative), primary topic, issue type, urgency level, and concise summary with supporting evidence.',
  generateMissingCompletion: true
};

/**
 * Builds an instruction dataset from active feedback records for fine-tuning or evaluation.
 * Follows Adaption documentation role definitions: Prompt, Context, Completion.
 */
export function buildInstructionDataset(
  records: AnalyzedFeedbackRecord[],
  universalPrompt: string = DEFAULT_COLUMN_MAPPING.universalPromptText
): InstructionRow[] {
  return records.map(rec => {
    const originalCompletion = JSON.stringify({
      sentiment: rec.sentiment,
      topic: rec.topic,
      issue_type: rec.issueType,
      urgency: rec.urgency,
      confidence: rec.confidence,
      summary: rec.summary,
      evidence_snippets: rec.evidenceSnippets
    }, null, 2);

    const reasoningTrace =
      `1. Review context evaluates text: "${rec.review}".\n` +
      `2. Identified key phrases related to ${rec.sourceCategory}.\n` +
      `3. Sentiment evaluated as ${rec.sentiment.toUpperCase()} with confidence score ${rec.confidence}.\n` +
      `4. Inferred primary operational topic as '${rec.topic}'.`;

    return {
      id: rec.id,
      instruction: universalPrompt,
      context: `Source Category: ${rec.sourceCategory}\nCustomer Review: "${rec.review}"`,
      originalReview: rec.review,
      sourceCategory: rec.sourceCategory,
      originalCompletion,
      reasoningTrace
    };
  });
}

/**
 * Generates JSONL content formatted for Adaption instruction fine-tuning.
 * Each line is a valid JSON object with prompt, context, completion.
 */
export function exportToAdaptionJsonl(rows: InstructionRow[]): string {
  return rows.map(row => JSON.stringify({
    prompt: row.instruction,
    context: row.context,
    completion: row.adaptedCompletion || row.originalCompletion
  })).join('\n');
}

/**
 * Computes empirical comparison metrics between the original dataset and an imported adapted dataset.
 * Computes exact label agreement, label changes, and row count diff from data.
 */
export function computeImportedComparison(
  originalRecords: AnalyzedFeedbackRecord[],
  importedData: Array<{ review?: string; sentiment?: string; topic?: string; completion?: string }>,
  isFixture: boolean = false,
  fixtureLabel?: string
): ImportedComparisonMetrics {
  const originalMap = new Map<string, AnalyzedFeedbackRecord>();
  originalRecords.forEach(r => {
    originalMap.set(r.normalizedKey, r);
  });

  let changedLabelsCount = 0;
  let unchangedLabelsCount = 0;
  const diffSamples: ImportedComparisonMetrics['diffSamples'] = [];

  importedData.forEach(item => {
    const reviewText = item.review || '';
    const normKey = normalizeReviewText(reviewText);
    const orig = originalMap.get(normKey);

    let adaptedSentiment = item.sentiment;
    let adaptedTopic = item.topic;

    // Parse completion if provided as stringified JSON
    if ((!adaptedSentiment || !adaptedTopic) && item.completion) {
      try {
        const parsed = JSON.parse(item.completion);
        adaptedSentiment = adaptedSentiment || parsed.sentiment || parsed.analysis?.sentiment;
        adaptedTopic = adaptedTopic || parsed.topic || parsed.analysis?.primary_topic;
      } catch {
        // Fallback to text matching if raw string
      }
    }

    if (orig && adaptedSentiment) {
      const origSent = orig.sentiment.toLowerCase();
      const adaptSent = adaptedSentiment.toLowerCase();
      const origTop = orig.topic.toLowerCase();
      const adaptTop = (adaptedTopic || orig.topic).toLowerCase();

      const isChanged = origSent !== adaptSent || origTop !== adaptTop;
      if (isChanged) {
        changedLabelsCount++;
      } else {
        unchangedLabelsCount++;
      }

      if (diffSamples.length < 15) {
        diffSamples.push({
          review: orig.review,
          originalSentiment: orig.sentiment,
          adaptedSentiment: adaptedSentiment,
          originalTopic: orig.topic,
          adaptedTopic: adaptedTopic || orig.topic,
          changed: isChanged
        });
      }
    }
  });

  const totalCompared = changedLabelsCount + unchangedLabelsCount;
  const labelAgreementPercentage = totalCompared > 0
    ? Math.round((unchangedLabelsCount / totalCompared) * 1000) / 10
    : 0;

  return {
    originalRowsCount: originalRecords.length,
    importedRowsCount: importedData.length,
    rowDiff: originalRecords.length - importedData.length,
    labelAgreementPercentage,
    changedLabelsCount,
    unchangedLabelsCount,
    isFixture,
    fixtureLabel,
    diffSamples
  };
}

/**
 * Creates a deterministic, clearly labelled TEST FIXTURE for verifying the before/after comparison.
 * Contains 20 sample rows with standardized completions for verification.
 */
export function generateTestFixture(records: AnalyzedFeedbackRecord[]): {
  fixtureLabel: string;
  data: Array<{ review: string; sentiment: string; topic: string; completion: string }>;
} {
  const sample = records.slice(0, 20);
  const data = sample.map((rec, idx) => {
    // Modify 4 rows to test label changes detection honestly
    const shouldAlter = idx % 5 === 0;
    const sentiment = shouldAlter
      ? (rec.sentiment === 'negative' ? 'neutral' : 'positive')
      : rec.sentiment;
    const topic = shouldAlter ? 'Product quality and features' : rec.topic;

    return {
      review: rec.review,
      sentiment,
      topic,
      completion: JSON.stringify({
        sentiment,
        topic,
        adapted_note: 'Standardized by Adaption recipe'
      })
    };
  });

  return {
    fixtureLabel: 'TEST FIXTURE (Synthetic Verification Sample - 20 records)',
    data
  };
}
