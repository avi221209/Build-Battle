import React from 'react';
import {
  MessageSquare,
  Smile,
  Meh,
  Frown,
  Tag,
  Flame
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KpiCards: React.FC = () => {
  const { datasetStats, countingPolicy, drilldownSentiment } = useApp();

  const total = datasetStats.totalRecords;
  const posPct = total > 0 ? Math.round((datasetStats.sentimentCounts.positive / total) * 100) : 0;
  const neuPct = total > 0 ? Math.round((datasetStats.sentimentCounts.neutral / total) * 100) : 0;
  const negPct = total > 0 ? Math.round((datasetStats.sentimentCounts.negative / total) * 100) : 0;

  // Determine top category
  let topCategory = 'None';
  let topCategoryCount = 0;
  Object.entries(datasetStats.categoriesCount).forEach(([cat, count]) => {
    if (count > topCategoryCount) {
      topCategoryCount = count;
      topCategory = cat;
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total & Unique Volume */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {countingPolicy === 'raw' ? 'Total Mentions' : 'Unique Feedback'}
          </span>
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <MessageSquare className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {datasetStats.totalRecords.toLocaleString()}
          </div>
          <span className="text-xs font-medium text-slate-500">
            {datasetStats.uniqueRecords.toLocaleString()} distinct
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Duplicates identified:</span>
          <span className="font-semibold text-amber-800 dark:text-amber-300">
            {datasetStats.duplicatesRemoved.toLocaleString()} ({datasetStats.duplicatePercentage}%)
          </span>
        </div>
      </div>

      {/* 2. Sentiment Breakdown */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Sentiment Split</span>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <Smile className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => drilldownSentiment('positive')}
            className="group text-left"
            title="Filter by Positive Sentiment"
          >
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 group-hover:underline">
              {posPct}%
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <Smile className="w-2.5 h-2.5" /> Pos
            </div>
          </button>
          <div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={() => drilldownSentiment('neutral')}
            className="group text-left"
            title="Filter by Neutral Sentiment"
          >
            <div className="text-lg font-bold text-slate-600 dark:text-slate-300 group-hover:underline">
              {neuPct}%
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <Meh className="w-2.5 h-2.5" /> Neu
            </div>
          </button>
          <div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-700" />
          <button
            onClick={() => drilldownSentiment('negative')}
            className="group text-left"
            title="Filter by Negative Sentiment"
          >
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400 group-hover:underline">
              {negPct}%
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-0.5">
              <Frown className="w-2.5 h-2.5" /> Neg
            </div>
          </button>
        </div>
        <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
          <div style={{ width: `${posPct}%` }} className="bg-emerald-500" />
          <div style={{ width: `${neuPct}%` }} className="bg-slate-400" />
          <div style={{ width: `${negPct}%` }} className="bg-rose-500" />
        </div>
      </div>

      {/* 3. Top Reported Category */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Top Category</span>
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Tag className="w-4 h-4" />
          </div>
        </div>
        <div className="text-lg font-bold text-slate-900 dark:text-white truncate" title={topCategory}>
          {topCategory}
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-xs text-slate-500">
            {topCategoryCount.toLocaleString()} records
          </span>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
            {total > 0 ? Math.round((topCategoryCount / total) * 100) : 0}% of cohort
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-400">
          Source categories preserved separately from AI topics
        </div>
      </div>

      {/* 4. High-Priority Issues Requiring Attention */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">High-Priority Focus</span>
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <Flame className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {datasetStats.highPriorityCount.toLocaleString()}
          </div>
          <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80">
            Urgent Triage
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Avg. Model Confidence:</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
            {Math.round(datasetStats.averageConfidence * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
