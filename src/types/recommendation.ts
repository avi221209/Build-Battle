import { PriorityLevel } from './priority';

export type TeamAssignment =
  | 'Engineering'
  | 'Fraud & Risk'
  | 'Customer Support'
  | 'Logistics & Operations'
  | 'Product & UX';

export interface Recommendation {
  id: string;
  title: string;
  problem: string;
  evidenceQuotes: string[];
  businessImpact: string;
  recommendedAction: string;
  expectedOutcome: string;
  priority: PriorityLevel;
  suggestedTeam: TeamAssignment;
  verificationMetric: string;
  relatedFeedbackIds: string[];
  status: 'pending' | 'accepted' | 'dismissed' | 'converted_to_issue';
  linkedIssueId?: string;
}
