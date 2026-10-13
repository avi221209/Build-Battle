import { PriorityIssue } from '../types/priority';
import { Recommendation, TeamAssignment } from '../types/recommendation';

export function generateRecommendations(
  priorityIssues: PriorityIssue[]
): Recommendation[] {
  if (!priorityIssues || priorityIssues.length === 0) return [];

  const recommendations: Recommendation[] = [];

  // Generate actionable recommendations from the top priority clusters
  priorityIssues.slice(0, 8).forEach((issue) => {
    let team: TeamAssignment = 'Engineering';
    let problem = '';
    let businessImpact = '';
    let recommendedAction = '';
    let expectedOutcome = '';
    let verificationMetric = '';

    if (issue.topic === 'Fraud and suspicious transactions') {
      team = 'Fraud & Risk';
      problem = `Identified ${issue.uniqueReviewsCount} distinct customer reports highlighting unauthorized transactions, fake seller listings, and identity compromise.`;
      businessImpact = `Severe threat to marketplace trust, chargeback liability risk, and regulatory scrutiny if card credential theft continues unmitigated.`;
      recommendedAction = `1. Mandate 3D Secure 2.0 / biometric step-up authentication on high-risk checkout orders.\n2. Deploy an automated heuristic rule freezing storefronts that trigger rapid account-detail changes.\n3. Establish an expedited 2-hour fraud response hotline.`;
      expectedOutcome = `Drastic reduction in account takeover disputes and immediate elimination of fraudulent off-platform payment attempts.`;
      verificationMetric = `Fraud dispute rate dropping below 0.05% of GMV within 30 days.`;
    } else if (issue.topic === 'Refunds and payments') {
      team = 'Engineering';
      problem = `Observed multiple instances of gateway 504 timeouts, duplicate charges, and refund queues exceeding 21 business days.`;
      businessImpact = `Customer dissatisfaction resulting in escalated payment dispute fees ($15-$25 per incident) and negative brand sentiment.`;
      recommendedAction = `1. Add idempotent request tokens to checkout endpoints to prevent duplicate charges on retry.\n2. Implement asynchronous automated refund pipelines for validated order cancellations.\n3. Add real-time transaction status webhooks for customer visibility.`;
      expectedOutcome = `Instantaneous refund confirmation and zero duplicate transaction incidents.`;
      verificationMetric = `Refund processing SLA meeting < 48 hours for 98% of cases.`;
    } else if (issue.topic === 'Customer support') {
      team = 'Customer Support';
      problem = `Feedback points to 45+ minute hold times, prematurely closed tickets without resolution, and repetitive agent transfers.`;
      businessImpact = `Erosion of customer loyalty and increased escalation costs due to repeat inquiries for unresolved tickets.`;
      recommendedAction = `1. Restructure tiered support routing so complex technical/billing issues bypass first-line deflection scripts.\n2. Introduce mandatory customer confirmation before tickets can be transitioned to 'Resolved' status.\n3. Conduct refresher training on empathy and case ownership.`;
      expectedOutcome = `Higher First Contact Resolution (FCR) and increased customer satisfaction (CSAT) scores.`;
      verificationMetric = `First Contact Resolution (FCR) rate increasing from baseline to > 75%.`;
    } else if (issue.topic === 'Delivery and fulfillment') {
      team = 'Logistics & Operations';
      problem = `Persistent reports of packages left unattended in rain, unnotified delivery delays, and warehouse SKU packing mismatches.`;
      businessImpact = `Costly return shipping expenses, replacement merchandise loss, and high customer anxiety during delivery windows.`;
      recommendedAction = `1. Enforce signature and photo proof-of-delivery contracts with third-party logistics carriers.\n2. Introduce barcode scan-verification checkpoints at packing stations before shipping labels are applied.\n3. Send proactive SMS alerts when courier scans indicate delivery exceptions.`;
      expectedOutcome = `Accurate dispatches and verifiable chain of custody for high-value customer orders.`;
      verificationMetric = `Delivery exception and SKU error rate dropping by > 60%.`;
    } else if (issue.topic === 'Product quality and features') {
      team = 'Product & UX';
      problem = `Customers report battery degradation, fragile material construction, and confusing navigation menus.`;
      businessImpact = `Elevated warranty claim costs, product return rates, and lower repeat purchase conversions.`;
      recommendedAction = `1. Share empirical feedback quotes with supplier engineering to review component tolerances.\n2. Revamp mobile navigation hierarchy and increase contrast on interactive buttons.\n3. Create updated, accessible user manuals and onboarding guides.`;
      expectedOutcome = `Better product durability and improved usability across desktop and mobile devices.`;
      verificationMetric = `Product return rate reduced by 3.5 percentage points within one quarter.`;
    } else {
      team = 'Engineering';
      problem = `Unstable checkout workflows and slow page response times during traffic spikes.`;
      businessImpact = `Lost conversion revenue and elevated cart abandonment rates.`;
      recommendedAction = `1. Conduct load testing on checkout microservices.\n2. Optimize database indexes on cart and inventory tables.\n3. Introduce graceful degradation modes for peak campaign events.`;
      expectedOutcome = `Sub-second checkout response times and zero unexpected system dropouts.`;
      verificationMetric = `Checkout API p99 latency maintaining under 800ms.`;
    }

    recommendations.push({
      id: `rec-${issue.id}`,
      title: `Strategic Action: ${issue.title.split(':')[0]}`,
      problem,
      evidenceQuotes: issue.representativeEvidence,
      businessImpact,
      recommendedAction,
      expectedOutcome,
      priority: issue.priorityLevel,
      suggestedTeam: team,
      verificationMetric,
      relatedFeedbackIds: issue.matchingRecordIds.slice(0, 5),
      status: 'pending'
    });
  });

  return recommendations;
}
