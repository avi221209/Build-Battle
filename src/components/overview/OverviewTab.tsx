import React, { Suspense } from 'react';
import { KpiCards } from './KpiCards';
import { TopComplaintsList } from './TopComplaintsList';
import { DeduplicationBanner } from './DeduplicationBanner';
import { TemporalNotice } from './TemporalNotice';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

const Charts = React.lazy(() =>
  import('./Charts').then(m => ({ default: m.Charts }))
);

const ChartsFallback: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[360px]"
  >
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[320px] text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Loading sentiment analysis charts...
      </span>
    </div>
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[320px] text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-2" />
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Loading category volume charts...
      </span>
    </div>
  </div>
);

export const OverviewTab: React.FC = () => {
  const { setCurrentTab } = useApp();

  return (
    <div className="space-y-6">
      {/* Page Title & Vision Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Customer Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            From Customer Voice to Business Action — Live triage of incoming customer experiences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentTab('priority')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-100 transition-colors"
          >
            <span>Inspect Priority Issues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentTab('adaption')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Adaption Recipe Studio</span>
          </button>
        </div>
      </div>

      {/* Deduplication Transparency Banner */}
      <DeduplicationBanner />

      {/* KPI Cards */}
      <KpiCards />

      {/* Interactive Charts Suite (Lazy Loaded) */}
      <Suspense fallback={<ChartsFallback />}>
        <Charts />
      </Suspense>

      {/* Top Recurring Complaints Ranking */}
      <TopComplaintsList />

      {/* Temporal Notice */}
      <TemporalNotice />
    </div>
  );
};
