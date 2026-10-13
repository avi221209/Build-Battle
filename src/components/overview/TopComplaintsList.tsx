import React from 'react';
import { AlertCircle, ChevronRight, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TopComplaintsList: React.FC = () => {
  const { allAnalyzedRecords, countingPolicy, setSearchQuery, setCurrentTab } = useApp();

  // Find top recurring complaints by normalizedKey
  const complaintGroups = new Map<string, {
    key: string;
    sampleReview: string;
    category: string;
    topic: string;
    count: number;
    urgency: string;
    sentimentScore: number;
  }>();

  allAnalyzedRecords.forEach(r => {
    if (r.sentiment !== 'negative') return;

    const existing = complaintGroups.get(r.normalizedKey);
    if (!existing) {
      complaintGroups.set(r.normalizedKey, {
        key: r.normalizedKey,
        sampleReview: r.review,
        category: r.sourceCategory,
        topic: r.topic,
        count: 1,
        urgency: r.urgency,
        sentimentScore: r.sentimentScore
      });
    } else {
      existing.count += 1;
    }
  });

  const sortedComplaints = Array.from(complaintGroups.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const handleInspect = (reviewText: string) => {
    setSearchQuery(reviewText.substring(0, 30));
    setCurrentTab('explorer');
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" aria-hidden="true" />
            Top Recurring Customer Complaints
          </h2>
          <p className="text-xs text-slate-500">
            Ranked by repeated frequency across raw feedback mentions
          </p>
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {complaintGroups.size} distinct complaint clusters
        </span>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {sortedComplaints.map((item, idx) => (
          <div
            key={item.key}
            className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
                  "{item.sampleReview}"
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>
                  <span className="px-2 py-0.5 rounded font-medium bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    {item.topic}
                  </span>
                  {item.urgency === 'Critical' && (
                    <span className="px-2 py-0.5 rounded font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Critical
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.count.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">mentions</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {countingPolicy === 'deduplicated' ? '1 unique customer' : `${item.count} total rows`}
                </div>
              </div>
              <button
                onClick={() => handleInspect(item.sampleReview)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Inspect matching records in Explorer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
