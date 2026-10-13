import { AnalyzedFeedbackRecord } from '../types/feedback';
import { PriorityFactorBreakdown, PriorityIssue, PriorityLevel, PriorityWeights } from '../types/priority';

export const DEFAULT_PRIORITY_WEIGHTS: PriorityWeights = {
  volumeWeight: 0.35,
  negativeSentimentWeight: 0.25,
  severityWeight: 0.25,
  confidenceWeight: 0.15,
  fraudSecurityBoost: true,
  fraudMultiplierValue: 1.35
};

export function computePriorityScore(
  distinctCount: number,
  maxDistinctInCohort: number,
  negativeRatio: number,
  severityScore: number, // 0 - 100
  avgConfidence: number, // 0 - 1.0
  isFraudOrSecurity: boolean,
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS
): { score: number; level: PriorityLevel; factors: PriorityFactorBreakdown; explanation: string } {
  // 1. Normalized Volume factor (0-100) based on distinct customer records
  const volumeFactor = Math.min(100, Math.round((distinctCount / Math.max(1, maxDistinctInCohort)) * 100));

  // 2. Negative Sentiment factor (0-100)
  const sentimentFactor = Math.round(negativeRatio * 100);

  // 3. Severity factor (0-100)
  const sevFactor = Math.round(severityScore);

  // 4. Confidence factor (0-100)
  const confFactor = Math.round(avgConfidence * 100);

  // Weighted base score
  let baseScore =
    volumeFactor * weights.volumeWeight +
    sentimentFactor * weights.negativeSentimentWeight +
    sevFactor * weights.severityWeight +
    confFactor * weights.confidenceWeight;

  // Fraud / Security Risk multiplier (Configurable heuristic assumption)
  const multValue = weights.fraudMultiplierValue ?? 1.35;
  const fraudMultiplier = weights.fraudSecurityBoost && isFraudOrSecurity ? multValue : 1.0;
  let finalScore = Math.min(100, Math.round(baseScore * fraudMultiplier));

  // Thresholds
  let level: PriorityLevel = 'Low';
  if (finalScore >= 78) level = 'Critical';
  else if (finalScore >= 58) level = 'High';
  else if (finalScore >= 38) level = 'Medium';
  else level = 'Low';

  const explanation =
    `Computed using ${distinctCount} distinct complaints (volume weight ${Math.round(weights.volumeWeight * 100)}%), ` +
    `${Math.round(negativeRatio * 100)}% negative sentiment, ` +
    `severity metric of ${sevFactor}/100, and model confidence of ${confFactor}%. ` +
    (fraudMultiplier > 1.0 ? `[Applied ${multValue}x Security & Risk Multiplier (heuristic assumption)]` : '');

  return {
    score: finalScore,
    level,
    factors: {
      volumeFactor,
      sentimentFactor,
      severityFactor: sevFactor,
      fraudRiskMultiplier: fraudMultiplier,
      confidenceFactor: confFactor
    },
    explanation
  };
}

/**
 * Groups analyzed feedback into distinct actionable priority issues
 */
export function generatePriorityIssues(
  records: AnalyzedFeedbackRecord[],
  weights: PriorityWeights = DEFAULT_PRIORITY_WEIGHTS
): PriorityIssue[] {
  if (!records || records.length === 0) return [];

  // Group by (topic + issueType) or semantic signature
  const clusters = new Map<string, {
    key: string;
    topic: AnalyzedFeedbackRecord['topic'];
    category: string;
    records: AnalyzedFeedbackRecord[];
    uniqueNormalizedKeys: Set<string>;
    evidenceQuotes: Set<string>;
  }>();

  records.forEach(rec => {
    // Only cluster negative or high-friction issues for priority triage
    if (rec.sentiment === 'positive') return;

    const clusterKey = `${rec.topic}:::${rec.issueType}`;
    let cluster = clusters.get(clusterKey);
    if (!cluster) {
      cluster = {
        key: clusterKey,
        topic: rec.topic,
        category: rec.sourceCategory,
        records: [],
        uniqueNormalizedKeys: new Set<string>(),
        evidenceQuotes: new Set<string>()
      };
      clusters.set(clusterKey, cluster);
    }

    cluster.records.push(rec);
    cluster.uniqueNormalizedKeys.add(rec.normalizedKey);
    rec.evidenceSnippets.forEach((s: string) => cluster!.evidenceQuotes.add(s));
  });

  // Find max distinct count among clusters for volume normalization
  let maxDistinctCount = 1;
  clusters.forEach(c => {
    if (c.uniqueNormalizedKeys.size > maxDistinctCount) {
      maxDistinctCount = c.uniqueNormalizedKeys.size;
    }
  });

  const priorityIssues: PriorityIssue[] = [];

  clusters.forEach((cluster, key) => {
    const totalMentions = cluster.records.length;
    const distinctCount = cluster.uniqueNormalizedKeys.size;
    const negCount = cluster.records.filter(r => r.sentiment === 'negative').length;
    const negativeRatio = totalMentions > 0 ? negCount / totalMentions : 0;

    // Severity metric
    let severitySum = 0;
    cluster.records.forEach(r => {
      if (r.urgency === 'Critical') severitySum += 100;
      else if (r.urgency === 'High') severitySum += 75;
      else if (r.urgency === 'Medium') severitySum += 50;
      else severitySum += 25;
    });
    const avgSeverity = severitySum / Math.max(1, totalMentions);

    // Confidence average
    const avgConfidence = cluster.records.reduce((acc, r) => acc + r.confidence, 0) / Math.max(1, totalMentions);

    const isFraudOrSecurity = cluster.topic === 'Fraud and suspicious transactions' || cluster.category === 'Fraud and Scam';

    const { score, level, factors, explanation } = computePriorityScore(
      distinctCount,
      maxDistinctCount,
      negativeRatio,
      avgSeverity,
      avgConfidence,
      isFraudOrSecurity,
      weights
    );

    // Human-friendly title and owners
    let title = `${cluster.topic}: Recurring ${cluster.records[0].issueType} Incidents`;
    let suggestedOwner = 'Product & Engineering';
    let recommendedAction = 'Investigate recurring incidents and trace root causes.';

    if (cluster.topic === 'Fraud and suspicious transactions') {
      title = `Security Alert: Suspicious Activities & Fraudulent Incursions`;
      suggestedOwner = 'Fraud & Risk Triage Team';
      recommendedAction = 'Enforce mandatory 3D Secure / 2FA verification and freeze offending seller accounts.';
    } else if (cluster.topic === 'Refunds and payments') {
      title = `Payment Friction: Gateway Failures & Delayed Settlements`;
      suggestedOwner = 'Billing & Payment Operations';
      recommendedAction = 'Audit payment webhook failure rates and streamline automated refund queues.';
    } else if (cluster.topic === 'Customer support') {
      title = `Support Bottleneck: Prolonged Hold Times & Agent Routing`;
      suggestedOwner = 'Customer Experience Operations';
      recommendedAction = 'Refactor agent escalation SLAs and update automated IVR routing trees.';
    } else if (cluster.topic === 'Delivery and fulfillment') {
      title = `Fulfillment Delays: Courier Tracking & Warehouse Dispatch`;
      suggestedOwner = 'Logistics & Supply Chain';
      recommendedAction = 'Implement real-time carrier webhook sync and inspect warehouse packing stations.';
    } else if (cluster.topic === 'Product quality and features') {
      title = `Product Defect Spike: Build Quality & Durability Grievances`;
      suggestedOwner = 'Quality Assurance & Hardware Team';
      recommendedAction = 'Perform batch QA inspections and revise supplier component tolerances.';
    } else if (cluster.topic === 'Website and ordering') {
      title = `Platform Stability: Checkout Crashes & High-Latency Spikes`;
      suggestedOwner = 'Site Reliability Engineering (SRE)';
      recommendedAction = 'Scale checkout cluster instances and debug unhandled 500 error boundaries.';
    }

    priorityIssues.push({
      id: `issue-${key.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
      title,
      topic: cluster.topic,
      category: cluster.category,
      priorityLevel: level,
      priorityScore: score,
      factors,
      explanation,
      totalMentions,
      uniqueReviewsCount: distinctCount,
      negativeRatio: Math.round(negativeRatio * 100) / 100,
      representativeEvidence: Array.from(cluster.evidenceQuotes).slice(0, 3),
      matchingRecordIds: cluster.records.map(r => r.id),
      suggestedOwner,
      recommendedAction,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  // Sort descending by priority score
  return priorityIssues.sort((a, b) => b.priorityScore - a.priorityScore);
}
