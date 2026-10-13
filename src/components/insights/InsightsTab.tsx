import React from 'react';
import {
  Sparkles,
  Tag,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TopicType } from '../../types/feedback';

export const InsightsTab: React.FC = () => {
  const { activeRecords, drilldownTopic, drilldownCategory } = useApp();

  // Topic aggregated metrics
  const topicStats = new Map<TopicType, {
    topic: TopicType;
    totalMentions: number;
    uniqueCount: Set<string>;
    positiveCount: number;
    neutralCount: number;
    negativeCount: number;
    criticalCount: number;
    sampleReviews: string[];
  }>();

  activeRecords.forEach(r => {
    let t = topicStats.get(r.topic);
    if (!t) {
      t = {
        topic: r.topic,
        totalMentions: 0,
        uniqueCount: new Set<string>(),
        positiveCount: 0,
        neutralCount: 0,
        negativeCount: 0,
        criticalCount: 0,
        sampleReviews: []
      };
      topicStats.set(r.topic, t);
    }

    t.totalMentions++;
    t.uniqueCount.add(r.normalizedKey);
    if (r.sentiment === 'positive') t.positiveCount++;
    else if (r.sentiment === 'neutral') t.neutralCount++;
    else t.negativeCount++;

    if (r.urgency === 'Critical') t.criticalCount++;

    if (t.sampleReviews.length < 2 && !t.sampleReviews.includes(r.review)) {
      t.sampleReviews.push(r.review);
    }
  });

  const sortedTopics = Array.from(topicStats.values()).sort((a, b) => b.totalMentions - a.totalMentions);

  // Cross-Tabulation Matrix: Source Category vs Inferred Topic
  const matrixData: Record<string, Record<string, number>> = {};
  const allCategories = ['Customer Service', 'Fraud and Scam', 'Operational Issues', 'Product Feedback'];
  const allTopics: TopicType[] = [
    'Customer support',
    'Fraud and suspicious transactions',
    'Refunds and payments',
    'Delivery and fulfillment',
    'Product quality and features',
    'Website and ordering'
  ];

  allCategories.forEach(cat => {
    matrixData[cat] = {};
    allTopics.forEach(top => {
      matrixData[cat][top] = 0;
    });
  });

  activeRecords.forEach(r => {
    if (matrixData[r.sourceCategory] && matrixData[r.sourceCategory][r.topic] !== undefined) {
      matrixData[r.sourceCategory][r.topic]++;
    }
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Insights & Semantic Topics
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Rule-based Analysis
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Discover recurring patterns, cross-category bleed, and customer sentiment drivers
          </p>
        </div>
      </div>

      {/* Cross-Tabulation Matrix Card */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Category vs. Inferred Topic Alignment Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Demonstrates that source dataset categories contain nuanced operational sub-topics
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            Cross-Correlation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Source Category</th>
                {allTopics.map(t => (
                  <th key={t} className="py-2.5 px-3 font-semibold text-center truncate max-w-[140px]" title={t}>
                    {t.split(' ')[0]}...
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allCategories.map(cat => (
                <tr key={cat} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    <button
                      onClick={() => drilldownCategory(cat)}
                      className="hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {cat}
                    </button>
                  </td>
                  {allTopics.map(top => {
                    const count = matrixData[cat]?.[top] || 0;
                    return (
                      <td key={top} className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-mono font-medium ${
                            count > 500
                              ? 'bg-brand-600 text-white font-bold'
                              : count > 100
                              ? 'bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300'
                              : count > 0
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        >
                          {count.toLocaleString()}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topic Cards Deep-Dive */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Operational Topic Profiles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedTopics.map((item) => {
            const negPct = item.totalMentions > 0 ? Math.round((item.negativeCount / item.totalMentions) * 100) : 0;
            const posPct = item.totalMentions > 0 ? Math.round((item.positiveCount / item.totalMentions) * 100) : 0;

            return (
              <div
                key={item.topic}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Tag className="w-4 h-4 text-purple-500" />
                        {item.topic}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span>{item.totalMentions.toLocaleString()} mentions</span>
                        <span>•</span>
                        <span>{item.uniqueCount.size.toLocaleString()} unique customers</span>
                      </div>
                    </div>

                    {item.criticalCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> {item.criticalCount} Critical
                      </span>
                    )}
                  </div>

                  {/* Sentiment Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">{negPct}% Negative</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{posPct}% Positive</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div style={{ width: `${negPct}%` }} className="bg-rose-500" />
                      <div style={{ width: `${100 - negPct - posPct}%` }} className="bg-slate-300 dark:bg-slate-700" />
                      <div style={{ width: `${posPct}%` }} className="bg-emerald-500" />
                    </div>
                  </div>

                  {/* Sample Quotes */}
                  <div className="mt-4 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Representative Customer Quotes:
                    </span>
                    {item.sampleReviews.map((quote, qIdx) => (
                      <p
                        key={qIdx}
                        className="text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2"
                      >
                        "{quote}"
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                  <button
                    onClick={() => drilldownTopic(item.topic)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    <span>View all matching records</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
