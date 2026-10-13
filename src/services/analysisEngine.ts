import {
  AnalyzedFeedbackRecord,
  RawFeedbackRecord,
  SentimentType,
  TopicType,
  IssueCategoryType,
  UrgencyLevel
} from '../types/feedback';
import { normalizeReviewText } from './deduplication';

// Lexicon for sentiment scoring
const POSITIVE_LEXICON = [
  'helpful', 'resolved', 'impressed', 'great', 'fast', 'patient', 'exceptional',
  'apologize', 'rectified', 'polite', 'quick', 'friendly', 'turnaround', 'smoothly',
  'empathy', 'proactively', 'transparent', 'seamlessly', 'pleasant', 'super',
  'outstanding', 'kudos', 'delightful', 'cleaner', 'magnificent', 'rich', 'crystal clear',
  'love', 'ergonomic', 'recommended', 'flawlessly', 'snappy', 'sturdy', 'silently',
  'lifesaver', 'brilliant', 'featherweight', 'whisper-quiet', 'wonderful', 'honored',
  'responsive', 'replacement', 'excellent', 'smooth'
];

const NEGATIVE_LEXICON = [
  'unacceptable', 'disconnected', 'robotic', 'unhelpful', 'rude', 'dismissive',
  'suspended', 'outdated', 'dropped', 'refused', 'escalate', 'outage', 'abruptly',
  'exhausted', 'unmotivated', 'canned', 'hung up', 'incorrect', 'penalty', 'frustrating',
  'inaccurate', 'misplaced', 'unauthorized', 'fraud', 'fraudulent', 'phishing', 'fake', 'counterfeit',
  'cloned', 'leaked', 'bypassed', 'drained', 'stolen', 'breach', 'scam', 'scammed', 'hacker',
  'skimmed', 'infringing', 'crashed', 'delayed', 'broken', 'latency', 'timeout',
  'oversell', 'misrouted', 'deadlock', 'blacklisted', 'damaged', 'fails', 'unresponsive',
  'flimsy', 'glitchy', 'shrunk', 'unraveling', 'overheat', 'defect', 'defects',
  'terrible', 'awful', 'horrible', 'worst', 'poor', 'useless', 'disaster'
];

const HIGH_URGENCY_TRIGGERS = [
  'urgent', 'unauthorized', 'fraud', 'stolen', 'leaked', 'bypassed', 'drain',
  'hacker', 'crashed', 'outage', 'lost package', 'deadlock', 'breach', 'counterfeit',
  'blacklisted', 'immediately', 'critical', 'danger'
];

export function analyzeSingleRecord(
  raw: RawFeedbackRecord,
  isDuplicate = false,
  duplicateCount = 1
): AnalyzedFeedbackRecord {
  const text = raw.review;
  const lowerText = text.toLowerCase();
  const normKey = normalizeReviewText(text);

  // 1. Sentiment analysis with whole-word matching
  let posCount = 0;
  let negCount = 0;
  const matchedEvidence: string[] = [];

  POSITIVE_LEXICON.forEach(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      posCount++;
      matchedEvidence.push(word);
    }
  });

  NEGATIVE_LEXICON.forEach(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      negCount++;
      matchedEvidence.push(word);
    }
  });

  let sentiment: SentimentType = 'neutral';
  let sentimentScore = 0;

  // Check for positive resolution phrasing
  const hasPositiveResolution =
    /responsive.*replacement|replacement.*responsive|rectified|apologize|resolved.*promptly|resolved immediately/i.test(lowerText);

  if (hasPositiveResolution) {
    sentiment = 'positive';
    sentimentScore = 0.6;
  } else if (negCount > posCount) {
    sentiment = 'negative';
    sentimentScore = -Math.min(1.0, 0.4 + (negCount - posCount) * 0.2);
  } else if (posCount > negCount) {
    sentiment = 'positive';
    sentimentScore = Math.min(1.0, 0.4 + (posCount - negCount) * 0.2);
  } else {
    // Look at strong indicators
    if (negCount > 0 && posCount > 0) {
      sentiment = 'neutral'; // mixed
      sentimentScore = 0;
    } else {
      sentiment = 'neutral';
      sentimentScore = 0;
    }
  }

  // 2. Topic Inference (Independent of source category)
  let topic: TopicType = 'Other or unclassified';

  if (/whatsapp|phishing|stolen|scam|fraud|fraudulent|counterfeit|unauthorized|clone|hacker|compromised|fake/i.test(lowerText)) {
    topic = 'Fraud and suspicious transactions';
  } else if (/refund|billing|charge|double billing|overcharged|vat invoice|transaction|deducted|currency/i.test(lowerText)) {
    topic = 'Refunds and payments';
  } else if (/checkout|cart|login|password|mobile app|website|domain|loading|crashed|500 error|safari|browser|button/i.test(lowerText) && !/hardware|battery|screen|audio|volume/i.test(lowerText)) {
    topic = 'Website and ordering';
  } else if (/product|defect|defects|battery|audio|build quality|flimsy|ergonomic|keyboard|screen|hardware|material|durability|performance|feature|design|volume slider|slider/i.test(lowerText)) {
    topic = 'Product quality and features';
  } else if (/delivery|courier|warehouse|shipment|tracking|transit|parcel|logistics|driver|customs|doorstep/i.test(lowerText)) {
    topic = 'Delivery and fulfillment';
  } else if (/customer service|support|agent|representative|live chat|helpdesk|ticket|ivr|phone call|canned|call back|rep|unresponsive|hold/i.test(lowerText) && !/defect.*replacement/i.test(lowerText)) {
    topic = 'Customer support';
  } else if (/support|agent|representative|seller/i.test(lowerText)) {
    topic = 'Customer support';
  } else {
    // Map from category if not explicitly captured
    if (raw.category === 'Customer Service') topic = 'Customer support';
    else if (raw.category === 'Fraud and Scam') topic = 'Fraud and suspicious transactions';
    else if (raw.category === 'Operational Issues') topic = 'Delivery and fulfillment';
    else if (raw.category === 'Product Feedback') topic = 'Product quality and features';
  }

  // 3. Issue Category Type
  let issueType: IssueCategoryType = 'UX Friction';

  if (sentiment === 'positive') {
    issueType = 'Praise';
  } else if (/fraud|scam|counterfeit|phishing|stolen|unauthorized/i.test(lowerText)) {
    issueType = 'Fraud Report';
  } else if (/crashed|bug|timeout|deadlock|500 error|glitchy|unresponsive/i.test(lowerText)) {
    issueType = 'Bug';
  } else if (/delay|warehouse|lost package|misplaced|missing|misrouted|\blate\b/i.test(lowerText)) {
    issueType = 'Service Failure';
  } else if (/terms|fee|penalty|policy|cancel|refused/i.test(lowerText)) {
    issueType = 'Policy Grievance';
  } else if (/would love|please add|feature request|requesting/i.test(lowerText)) {
    issueType = 'Feature Request';
  } else if (/bottleneck|downtime|outage|latency/i.test(lowerText)) {
    issueType = 'Operational Bottleneck';
  }

  // 4. Urgency Inference
  let urgency: UrgencyLevel = 'Low';
  let hasCriticalTrigger = false;

  for (const trigger of HIGH_URGENCY_TRIGGERS) {
    if (lowerText.includes(trigger)) {
      hasCriticalTrigger = true;
      break;
    }
  }

  if (hasCriticalTrigger || sentimentScore <= -0.7) {
    urgency = (lowerText.includes('fraud') || lowerText.includes('unauthorized') || lowerText.includes('crashed'))
      ? 'Critical'
      : 'High';
  } else if (sentiment === 'negative') {
    urgency = 'Medium';
  } else {
    urgency = 'Low';
  }

  // 5. Evidence Snippets (extract concrete clauses)
  const sentences = text.split(/(?<=[.!?])\s+/);
  const evidenceSnippets: string[] = [];

  sentences.forEach(s => {
    const sLower = s.toLowerCase();
    const hasTrigger = matchedEvidence.some(m => sLower.includes(m));
    if (hasTrigger && evidenceSnippets.length < 2) {
      evidenceSnippets.push(s.trim());
    }
  });

  if (evidenceSnippets.length === 0 && sentences.length > 0) {
    evidenceSnippets.push(sentences[0].trim());
  }

  // 6. Concise Summary
  let summary = '';
  if (sentences.length > 0) {
    summary = sentences[0].length > 90 ? sentences[0].substring(0, 87) + '...' : sentences[0];
  } else {
    summary = text.substring(0, 87) + '...';
  }

  // 7. Confidence estimation (0.75 - 0.95 base for rule matching)
  const confidence = Math.min(0.96, Math.max(0.72, 0.70 + (posCount + negCount) * 0.05));

  return {
    id: raw.id,
    review: text,
    sourceCategory: raw.category,
    sentiment,
    sentimentScore,
    topic,
    issueType,
    summary,
    urgency,
    confidence: Math.round(confidence * 100) / 100,
    evidenceSnippets,
    isDuplicate,
    duplicateCount,
    normalizedKey: normKey,
    analyzedAt: new Date().toISOString(),
    analysisMethod: 'deterministic_lexicon'
  };
}

/**
 * Batch analysis with progress updates and caching
 */
export async function batchAnalyzeFeedback(
  records: (RawFeedbackRecord & { isDuplicate?: boolean; duplicateCount?: number })[],
  onProgress?: (processed: number, total: number) => void
): Promise<AnalyzedFeedbackRecord[]> {
  const cache = new Map<string, AnalyzedFeedbackRecord>();
  const results: AnalyzedFeedbackRecord[] = [];
  const total = records.length;
  const chunkSize = 250;

  for (let i = 0; i < total; i += chunkSize) {
    const chunk = records.slice(i, i + chunkSize);
    
    chunk.forEach(rec => {
      const normKey = normalizeReviewText(rec.review);
      let analyzed = cache.get(normKey);

      if (!analyzed) {
        analyzed = analyzeSingleRecord(rec, rec.isDuplicate || false, rec.duplicateCount || 1);
        cache.set(normKey, analyzed);
      }

      // Return individual record preserving its unique ID and specific metadata
      results.push({
        ...analyzed,
        id: rec.id,
        isDuplicate: rec.isDuplicate || false,
        duplicateCount: rec.duplicateCount || 1
      });
    });

    if (onProgress) {
      onProgress(Math.min(i + chunkSize, total), total);
    }

    // Yield to main thread for non-blocking UI responsiveness
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  return results;
}
