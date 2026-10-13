export type SentimentType = 'positive' | 'neutral' | 'negative';

export type TopicType =
  | 'Product quality and features'
  | 'Customer support'
  | 'Delivery and fulfillment'
  | 'Website and ordering'
  | 'Fraud and suspicious transactions'
  | 'Refunds and payments'
  | 'Other or unclassified';

export type IssueCategoryType =
  | 'Bug'
  | 'UX Friction'
  | 'Service Failure'
  | 'Fraud Report'
  | 'Policy Grievance'
  | 'Praise'
  | 'Feature Request'
  | 'Operational Bottleneck';

export type UrgencyLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface RawFeedbackRecord {
  id: string;
  review: string;
  category: string;
  [key: string]: unknown;
}

export interface AnalyzedFeedbackRecord {
  id: string;
  review: string;
  sourceCategory: string;
  sentiment: SentimentType;
  sentimentScore: number; // -1.0 to +1.0
  topic: TopicType;
  issueType: IssueCategoryType;
  summary: string;
  urgency: UrgencyLevel;
  confidence: number; // 0.0 to 1.0
  evidenceSnippets: string[];
  isDuplicate: boolean;
  duplicateCount: number;
  normalizedKey: string;
  analyzedAt: string;
  analysisMethod: 'deterministic_lexicon' | 'cloud_llm' | 'adapted_model';
  linkedIssueId?: string;
}

export interface DatasetStats {
  totalRecords: number;
  uniqueRecords: number;
  duplicatesRemoved: number;
  duplicatePercentage: number;
  categoriesCount: Record<string, number>;
  sentimentCounts: Record<SentimentType, number>;
  topicCounts: Record<TopicType, number>;
  averageConfidence: number;
  highPriorityCount: number;
  missingValuesDetected: number;
}
