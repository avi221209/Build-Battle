import { describe, it, expect } from 'vitest';
import {
  computePriorityScore,
  generatePriorityIssues,
  DEFAULT_PRIORITY_WEIGHTS
} from '../services/priorityEngine';
import { AnalyzedFeedbackRecord, TopicType } from '../types/feedback';

describe('Priority Engine Unit Tests', () => {
  describe('computePriorityScore', () => {
    it('computes weighted score from volume, negative ratio, severity, and confidence', () => {
      const distinctCount = 50;
      const maxDistinctInCohort = 100;
      const negativeRatio = 0.8;
      const severityScore = 60;
      const avgConfidence = 0.9;
      const isFraudOrSecurity = false;

      const result = computePriorityScore(
        distinctCount,
        maxDistinctInCohort,
        negativeRatio,
        severityScore,
        avgConfidence,
        isFraudOrSecurity,
        DEFAULT_PRIORITY_WEIGHTS
      );

      // volumeFactor = 50 * 0.35 = 17.5
      // sentimentFactor = 80 * 0.25 = 20
      // sevFactor = 60 * 0.25 = 15
      // confFactor = 90 * 0.15 = 13.5
      // baseScore = 17.5 + 20 + 15 + 13.5 = 66
      expect(result.score).toBe(66);
      expect(result.level).toBe('High'); // 58 <= 66 < 78
      expect(result.factors.volumeFactor).toBe(50);
      expect(result.factors.sentimentFactor).toBe(80);
      expect(result.factors.severityFactor).toBe(60);
      expect(result.factors.confidenceFactor).toBe(90);
      expect(result.factors.fraudRiskMultiplier).toBe(1.0);
    });

    it('applies the configurable 1.35x multiplier for fraud/security items as documented heuristic assumption', () => {
      const distinctCount = 50;
      const maxDistinctInCohort = 100;
      const negativeRatio = 0.8;
      const severityScore = 60;
      const avgConfidence = 0.9;
      const isFraudOrSecurity = true;

      const result = computePriorityScore(
        distinctCount,
        maxDistinctInCohort,
        negativeRatio,
        severityScore,
        avgConfidence,
        isFraudOrSecurity,
        DEFAULT_PRIORITY_WEIGHTS
      );

      // baseScore = 66. 66 * 1.35 = 89.1 -> rounded to 89
      expect(result.score).toBe(89);
      expect(result.level).toBe('Critical'); // >= 78
      expect(result.factors.fraudRiskMultiplier).toBe(1.35);
      expect(result.explanation).toContain('1.35x Security & Risk Multiplier (heuristic assumption)');
    });

    it('honors disabled fraudSecurityBoost or customized multiplier values', () => {
      const distinctCount = 50;
      const maxDistinctInCohort = 100;
      const negativeRatio = 0.8;
      const severityScore = 60;
      const avgConfidence = 0.9;

      // With boost disabled
      const noBoostResult = computePriorityScore(
        distinctCount,
        maxDistinctInCohort,
        negativeRatio,
        severityScore,
        avgConfidence,
        true,
        { ...DEFAULT_PRIORITY_WEIGHTS, fraudSecurityBoost: false }
      );
      expect(noBoostResult.score).toBe(66);
      expect(noBoostResult.factors.fraudRiskMultiplier).toBe(1.0);

      // With custom multiplier 1.20
      const customBoostResult = computePriorityScore(
        distinctCount,
        maxDistinctInCohort,
        negativeRatio,
        severityScore,
        avgConfidence,
        true,
        { ...DEFAULT_PRIORITY_WEIGHTS, fraudMultiplierValue: 1.2 }
      );
      // 66 * 1.2 = 79.2 -> 79
      expect(customBoostResult.score).toBe(79);
      expect(customBoostResult.factors.fraudRiskMultiplier).toBe(1.2);
    });
  });

  describe('generatePriorityIssues', () => {
    it('returns empty array when given empty records', () => {
      expect(generatePriorityIssues([])).toEqual([]);
    });

    it('groups negative issues into clusters, ignores pure positive praise, and sorts descending by priority score', () => {
      const mockRecords: AnalyzedFeedbackRecord[] = [
        {
          id: '1',
          review: 'Fraudulent transaction unauthorized card charge',
          sourceCategory: 'Fraud and Scam',
          sentiment: 'negative',
          sentimentScore: -0.9,
          topic: 'Fraud and suspicious transactions',
          issueType: 'Fraud Report',
          summary: 'Fraudulent transaction unauthorized card charge',
          urgency: 'Critical',
          confidence: 0.95,
          evidenceSnippets: ['unauthorized card charge'],
          isDuplicate: false,
          duplicateCount: 1,
          normalizedKey: 'fraudulent transaction unauthorized card charge',
          analyzedAt: new Date().toISOString(),
          analysisMethod: 'deterministic_lexicon'
        },
        {
          id: '2',
          review: 'Shipping delayed by 2 days',
          sourceCategory: 'Operational Issues',
          sentiment: 'negative',
          sentimentScore: -0.5,
          topic: 'Delivery and fulfillment',
          issueType: 'Service Failure',
          summary: 'Shipping delayed by 2 days',
          urgency: 'Medium',
          confidence: 0.85,
          evidenceSnippets: ['shipping delayed'],
          isDuplicate: false,
          duplicateCount: 1,
          normalizedKey: 'shipping delayed by 2 days',
          analyzedAt: new Date().toISOString(),
          analysisMethod: 'deterministic_lexicon'
        },
        {
          id: '3',
          review: 'Fantastic fast service loved it!',
          sourceCategory: 'Customer Service',
          sentiment: 'positive',
          sentimentScore: 0.8,
          topic: 'Customer support',
          issueType: 'Praise',
          summary: 'Fantastic fast service',
          urgency: 'Low',
          confidence: 0.9,
          evidenceSnippets: ['fantastic fast service'],
          isDuplicate: false,
          duplicateCount: 1,
          normalizedKey: 'fantastic fast service loved it',
          analyzedAt: new Date().toISOString(),
          analysisMethod: 'deterministic_lexicon'
        }
      ];

      const issues = generatePriorityIssues(mockRecords);

      // Only 2 issues formed (positive record is not an operational triage issue)
      expect(issues).toHaveLength(2);
      // Fraud issue should have highest priority score
      expect(issues[0].topic).toBe('Fraud and suspicious transactions');
      expect(issues[0].priorityLevel).toBe('Critical');
      expect(issues[0].suggestedOwner).toBe('Fraud & Risk Triage Team');
      expect(issues[0].status).toBe('Open');
      expect(issues[0].priorityScore).toBeGreaterThan(issues[1].priorityScore);
    });

    it('covers all operational topic branches, owners, and recommended actions', () => {
      const topics: { topic: TopicType; owner: string }[] = [
        { topic: 'Refunds and payments', owner: 'Billing & Payment Operations' },
        { topic: 'Customer support', owner: 'Customer Experience Operations' },
        { topic: 'Delivery and fulfillment', owner: 'Logistics & Supply Chain' },
        { topic: 'Product quality and features', owner: 'Quality Assurance & Hardware Team' },
        { topic: 'Website and ordering', owner: 'Site Reliability Engineering (SRE)' },
        { topic: 'Other or unclassified', owner: 'Product & Engineering' }
      ];

      const records: AnalyzedFeedbackRecord[] = topics.map((t, idx) => ({
        id: `t-${idx}`,
        review: `Negative incident for ${t.topic}`,
        sourceCategory: 'Operations',
        sentiment: 'negative',
        sentimentScore: -0.6,
        topic: t.topic,
        issueType: 'Bug',
        summary: `Incident ${idx}`,
        urgency: 'High',
        confidence: 0.85,
        evidenceSnippets: ['incident'],
        isDuplicate: false,
        duplicateCount: 1,
        normalizedKey: `negative incident for ${t.topic}`,
        analyzedAt: new Date().toISOString(),
        analysisMethod: 'deterministic_lexicon'
      }));

      const issues = generatePriorityIssues(records);
      expect(issues.length).toBe(topics.length);

      topics.forEach(t => {
        const found = issues.find(i => i.topic === t.topic);
        expect(found).toBeDefined();
        expect(found?.suggestedOwner).toBe(t.owner);
      });
    });

    it('correctly maps Low and Medium priority score ranges', () => {
      // Score in Low range (< 38)
      const lowResult = computePriorityScore(1, 100, 0.1, 25, 0.5, false, DEFAULT_PRIORITY_WEIGHTS);
      expect(lowResult.level).toBe('Low');

      // Score in Medium range (38 <= score < 58)
      const medResult = computePriorityScore(30, 100, 0.5, 50, 0.7, false, DEFAULT_PRIORITY_WEIGHTS);
      expect(medResult.level).toBe('Medium');
    });
  });
});
