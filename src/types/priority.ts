import { TopicType } from './feedback';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface PriorityFactorBreakdown {
  volumeFactor: number;          // 0-100: Impact of distinct record volume
  sentimentFactor: number;       // 0-100: Negative sentiment ratio intensity
  severityFactor: number;        // 0-100: Severity expressed in text (crash, stolen, fraud)
  fraudRiskMultiplier: number;   // 1.0 - 1.5x multiplier for fraud/security relevance
  confidenceFactor: number;      // 0-100: Model classification confidence
}

export interface PriorityWeights {
  volumeWeight: number;            // Default 0.35
  negativeSentimentWeight: number; // Default 0.25
  severityWeight: number;          // Default 0.25
  confidenceWeight: number;        // Default 0.15
  fraudSecurityBoost: boolean;     // Default true
  fraudMultiplierValue: number;    // Default 1.35 (documented heuristic assumption)
}

export interface PriorityIssue {
  id: string;
  title: string;
  topic: TopicType;
  category: string;
  priorityLevel: PriorityLevel;
  priorityScore: number;         // 0 - 100
  factors: PriorityFactorBreakdown;
  explanation: string;
  totalMentions: number;         // Raw mentions count
  uniqueReviewsCount: number;    // Distinct customers count
  negativeRatio: number;         // 0.0 to 1.0
  representativeEvidence: string[];
  matchingRecordIds: string[];
  suggestedOwner: string;
  recommendedAction: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Dismissed';
  createdAt: string;
  updatedAt: string;
}
