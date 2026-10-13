import React, { useState } from 'react';
import { Layers, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DeduplicationBanner: React.FC = () => {
  const { deduplicationSummary, countingPolicy, setCountingPolicy, datasetSha256 } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!deduplicationSummary) return null;

  const {
    rawCount,
    normalizedUniqueCount,
    normalizedDuplicatesRemoved,
    duplicatePercentage
  } = deduplicationSummary;

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/20 p-4 shadow-subtle transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-amber-950 dark:text-amber-100">
                Data Quality Transparency & Deduplication Insight
              </h4>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200">
                {duplicatePercentage}% Repeated Rows ({normalizedDuplicatesRemoved.toLocaleString()} / {rawCount.toLocaleString()})
              </span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-1 max-w-3xl">
              The dataset contains <span className="font-semibold">{rawCount.toLocaleString()} total entries</span>, but only{' '}
              <span className="font-semibold">{normalizedUniqueCount.toLocaleString()} unique feedback texts</span>.
              Active Counting Policy is currently set to{' '}
              <span className="font-bold underline decoration-amber-500">
                {countingPolicy === 'raw'
                  ? `Raw Mentions (All ${rawCount.toLocaleString()})`
                  : `Deduplicated (Unique ${normalizedUniqueCount.toLocaleString()})`}
              </span>.
            </p>
            {datasetSha256 && (
              <div className="mt-2 text-[11px] font-mono text-amber-900/80 dark:text-amber-300/80 flex items-center gap-1.5 overflow-x-auto">
                <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-700 dark:text-amber-400">Dataset SHA-256:</span>
                <span className="bg-amber-100/80 dark:bg-amber-900/40 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/40 select-all">{datasetSha256}</span>
              </div>
            )}
          </div>
        </div>

        {/* Toggle & Details */}
        <div className="flex items-center gap-2 self-start md:self-center shrink-0">
          <button
            onClick={() => setCountingPolicy(countingPolicy === 'raw' ? 'deduplicated' : 'raw')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors"
          >
            Switch to {countingPolicy === 'raw' ? `Unique (${normalizedUniqueCount.toLocaleString()})` : `Raw (${rawCount.toLocaleString()})`}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors flex items-center gap-1"
          >
            <span>{isExpanded ? 'Less' : 'Why this matters'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Explanation */}
      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200/90 space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/60 dark:bg-slate-900/50 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Raw Records</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{rawCount.toLocaleString()}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Captures every mention frequency across ingestion</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Unique Reviews</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{normalizedUniqueCount.toLocaleString()}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Distinct semantic review contents</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Duplicates Removed</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">{normalizedDuplicatesRemoved.toLocaleString()}</span>
              <p className="text-[10px] text-slate-500 mt-0.5">Identical text records consolidated</p>
            </div>
          </div>

          <div className="space-y-1.5 leading-relaxed">
            <p className="flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Why deduplication changes metrics:</strong> If an automated system or batch export repeatedly logs identical text, counting each repetition as an independent customer complaint artificially inflates volume and skews priority scoring.
              </span>
            </p>
            <p className="flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Customer Identity Note:</strong> Because the dataset contains only <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono text-[10px]">review</code> and <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono text-[10px]">category</code> without customer IDs, InsightFlow avoids fabricating customer identities. Both raw mentions and unique customer cohorts remain accessible at all times.
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
