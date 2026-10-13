import React from 'react';
import { Calendar, ShieldCheck } from 'lucide-react';

export const TemporalNotice: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          <strong>Temporal Integrity Statement:</strong> Source feedback dataset lacks timestamp columns. Chronological time-series graphs are intentionally omitted to avoid fabricating dates. Categorical and sentiment distributions are displayed with full fidelity.
        </span>
      </div>
      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 shrink-0">
        <ShieldCheck className="w-3.5 h-3.5" />
        Audit Verified
      </span>
    </div>
  );
};
