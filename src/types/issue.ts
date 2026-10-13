import { PriorityLevel } from './priority';

export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Dismissed';

export interface IssueNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface IssueActivity {
  id: string;
  action: string;
  timestamp: string;
  author: string;
}

export interface TrackedIssue {
  id: string;
  title: string;
  description: string;
  priority: PriorityLevel;
  status: IssueStatus;
  owner: string;
  team: string;
  linkedFeedbackCount: number;
  linkedFeedbackIds: string[];
  notes: IssueNote[];
  activityLog: IssueActivity[];
  createdAt: string;
  updatedAt: string;
}
