import { describe, it, expect } from 'vitest';
import { analyzeSingleRecord, batchAnalyzeFeedback } from '../services/analysisEngine';
import { RawFeedbackRecord } from '../types/feedback';

describe('Analysis Engine Unit & Golden Tests', () => {
  describe('Golden Test Cases', () => {
    it('correctly classifies positive experience with website', () => {
      const raw: RawFeedbackRecord = {
        id: 'test-1',
        review: 'I had a great experience with the website and checkout process.',
        category: 'Operational Issues'
      };
      const result = analyzeSingleRecord(raw);

      expect(result.sentiment).toBe('positive');
      expect(result.topic).toBe('Website and ordering');
      expect(result.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('correctly classifies mixed review with positive resolution', () => {
      const raw: RawFeedbackRecord = {
        id: 'test-2',
        review: 'The product arrived with some defects, but the seller was responsive and provided a replacement.',
        category: 'Product Feedback'
      };
      const result = analyzeSingleRecord(raw);

      expect(result.sentiment).toBe('positive');
      expect(result.topic).toBe('Product quality and features');
      expect(result.evidenceSnippets.some(s => s.toLowerCase().includes('responsive'))).toBe(true);
      expect(result.evidenceSnippets.some(s => s.toLowerCase().includes('replacement'))).toBe(true);
    });

    it('correctly classifies fraudulent scam complaints with critical urgency', () => {
      const raw: RawFeedbackRecord = {
        id: 'test-3',
        review: 'I was scammed by a fraudulent seller who drained my bank account through unauthorized payment links.',
        category: 'Fraud and Scam'
      };
      const result = analyzeSingleRecord(raw);

      expect(result.sentiment).toBe('negative');
      expect(result.topic).toBe('Fraud and suspicious transactions');
      expect(result.urgency).toBe('Critical');
      expect(result.issueType).toBe('Fraud Report');
    });

    it('correctly classifies unresponsive customer service complaints', () => {
      const raw: RawFeedbackRecord = {
        id: 'test-4',
        review: 'Customer service was unresponsive after I waited on hold for two hours.',
        category: 'Customer Service'
      };
      const result = analyzeSingleRecord(raw);

      expect(result.sentiment).toBe('negative');
      expect(result.topic).toBe('Customer support');
      expect(result.evidenceSnippets.some(s => s.toLowerCase().includes('unresponsive'))).toBe(true);
    });
  });

  describe('Comprehensive Branch & Category Coverage', () => {
    it('classifies refund grievances correctly', () => {
      const raw: RawFeedbackRecord = {
        id: 'ref-1',
        review: 'Double billing on credit card statement and refund was not deducted.',
        category: 'Customer Service'
      };
      const result = analyzeSingleRecord(raw);
      expect(result.topic).toBe('Refunds and payments');
    });

    it('classifies delivery logistics delays correctly', () => {
      const raw: RawFeedbackRecord = {
        id: 'del-1',
        review: 'Courier lost package in warehouse transit and delivery was delayed by driver.',
        category: 'Operational Issues'
      };
      const result = analyzeSingleRecord(raw);
      expect(result.topic).toBe('Delivery and fulfillment');
      expect(result.issueType).toBe('Service Failure');
    });

    it('classifies feature requests and policy grievances', () => {
      const req: RawFeedbackRecord = {
        id: 'feat-1',
        review: 'Please add dark mode support and feature request for offline sync.',
        category: 'Product Feedback'
      };
      const resReq = analyzeSingleRecord(req);
      expect(resReq.issueType).toBe('Feature Request');

      const pol: RawFeedbackRecord = {
        id: 'pol-1',
        review: 'Canceled order fee penalty was unfair and terms policy was refused.',
        category: 'Customer Service'
      };
      const resPol = analyzeSingleRecord(pol);
      expect(resPol.issueType).toBe('Policy Grievance');
    });

    it('classifies operational bottlenecks and crashes', () => {
      const bot: RawFeedbackRecord = {
        id: 'bot-1',
        review: 'Downtime and latency bottleneck caused major outage.',
        category: 'Operational Issues'
      };
      const resBot = analyzeSingleRecord(bot);
      expect(resBot.issueType).toBe('Operational Bottleneck');

      const bug: RawFeedbackRecord = {
        id: 'bug-1',
        review: 'Website crashed with a deadlock error.',
        category: 'Operational Issues'
      };
      const resBug = analyzeSingleRecord(bug);
      expect(resBug.issueType).toBe('Bug');
      expect(resBug.urgency).toBe('Critical');
    });

    it('falls back to sourceCategory when no explicit keywords match', () => {
      const c1 = analyzeSingleRecord({ id: 'c1', review: 'Unclassified text sample alpha', category: 'Customer Service' });
      expect(c1.topic).toBe('Customer support');

      const c2 = analyzeSingleRecord({ id: 'c2', review: 'Unclassified text sample beta', category: 'Fraud and Scam' });
      expect(c2.topic).toBe('Fraud and suspicious transactions');

      const c3 = analyzeSingleRecord({ id: 'c3', review: 'Unclassified text sample gamma', category: 'Operational Issues' });
      expect(c3.topic).toBe('Delivery and fulfillment');

      const c4 = analyzeSingleRecord({ id: 'c4', review: 'Unclassified text sample delta', category: 'Product Feedback' });
      expect(c4.topic).toBe('Product quality and features');
    });

    it('evaluates batchAnalyzeFeedback with progress tracking and caching', async () => {
      const records: RawFeedbackRecord[] = [
        { id: 'b1', review: 'Fast turnaround and exceptional delivery.', category: 'Operational Issues' },
        { id: 'b2', review: 'Fast turnaround and exceptional delivery.', category: 'Operational Issues', isDuplicate: true, duplicateCount: 2 },
        { id: 'b3', review: 'Counterfeit scam seller stolen funds.', category: 'Fraud and Scam' }
      ];

      let progressCalls = 0;
      const results = await batchAnalyzeFeedback(records, (_processed, _total) => {
        progressCalls++;
      });

      expect(results).toHaveLength(3);
      expect(progressCalls).toBeGreaterThan(0);
      expect(results[0].sentiment).toBe('positive');
      expect(results[2].sentiment).toBe('negative');
    });
  });
});
