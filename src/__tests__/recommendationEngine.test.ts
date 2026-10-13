import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../services/recommendationEngine';
import { PriorityIssue } from '../types/priority';

describe('Recommendation Engine Unit Tests', () => {
  it('returns empty array when given empty priority issues', () => {
    expect(generateRecommendations([])).toEqual([]);
  });

  it('generates concrete, actionable recommendations from priority issues across all topics', () => {
    const createIssue = (id: string, topic: PriorityIssue['topic'], category: string): PriorityIssue => ({
      id,
      title: `${topic}: Issue`,
      topic,
      category,
      priorityLevel: 'High',
      priorityScore: 85,
      factors: {
        volumeFactor: 80,
        sentimentFactor: 80,
        severityFactor: 80,
        fraudRiskMultiplier: 1.0,
        confidenceFactor: 85
      },
      explanation: 'Explanation text',
      totalMentions: 50,
      uniqueReviewsCount: 20,
      negativeRatio: 0.9,
      representativeEvidence: ['evidence quote'],
      matchingRecordIds: ['rec-1'],
      suggestedOwner: 'Team Owner',
      recommendedAction: 'Action',
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const issues: PriorityIssue[] = [
      createIssue('1', 'Fraud and suspicious transactions', 'Fraud and Scam'),
      createIssue('2', 'Refunds and payments', 'Customer Service'),
      createIssue('3', 'Customer support', 'Customer Service'),
      createIssue('4', 'Delivery and fulfillment', 'Operational Issues'),
      createIssue('5', 'Product quality and features', 'Product Feedback'),
      createIssue('6', 'Website and ordering', 'Operational Issues')
    ];

    const recs = generateRecommendations(issues);

    expect(recs).toHaveLength(6);

    // Fraud
    expect(recs[0].suggestedTeam).toBe('Fraud & Risk');
    expect(recs[0].verificationMetric).toContain('Fraud dispute rate');

    // Refunds
    expect(recs[1].suggestedTeam).toBe('Engineering');
    expect(recs[1].problem).toContain('gateway 504 timeouts');
    expect(recs[1].verificationMetric).toContain('Refund processing SLA');

    // Customer support
    expect(recs[2].suggestedTeam).toBe('Customer Support');
    expect(recs[2].problem).toContain('hold times');
    expect(recs[2].verificationMetric).toContain('First Contact Resolution');

    // Delivery and fulfillment
    expect(recs[3].suggestedTeam).toBe('Logistics & Operations');
    expect(recs[3].problem).toContain('packages left unattended');
    expect(recs[3].verificationMetric).toContain('Delivery exception');

    // Product quality
    expect(recs[4].suggestedTeam).toBe('Product & UX');
    expect(recs[4].problem).toContain('battery degradation');
    expect(recs[4].verificationMetric).toContain('Product return rate');

    // Website & ordering (default case)
    expect(recs[5].suggestedTeam).toBe('Engineering');
    expect(recs[5].problem).toContain('Unstable checkout');
    expect(recs[5].verificationMetric).toContain('Checkout API p99 latency');
  });
});
