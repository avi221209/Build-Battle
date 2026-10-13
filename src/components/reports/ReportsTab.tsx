import React, { useRef } from 'react';
import {
  Printer,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ReportsTab: React.FC = () => {
  const {
    datasetName,
    datasetSha256,
    datasetStats,
    countingPolicy,
    priorityIssues,
    recommendations,
    allAnalyzedRecords,
    showToast
  } = useApp();

  const reportRef = useRef<HTMLDivElement>(null);
  const [reportGeneratedAt] = React.useState(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportFullCsv = () => {
    // Export strictly authentic unique reviews
    const uniqueRecords = allAnalyzedRecords.filter(r => !r.isDuplicate);
    if (uniqueRecords.length === 0) {
      showToast('No unique records available to export.');
      return;
    }

    const headers = ['id', 'review', 'category', 'sentiment', 'sentiment_score', 'topic', 'urgency', 'confidence'];
    const rows = uniqueRecords.map(r => [
      `"${r.id}"`,
      `"${r.review.replace(/"/g, '""')}"`,
      `"${r.sourceCategory}"`,
      `"${r.sentiment}"`,
      r.sentimentScore,
      `"${r.topic}"`,
      `"${r.urgency}"`,
      r.confidence
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `insightflow_unique_feedback_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${uniqueRecords.length.toLocaleString()} unique reviews to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Executive Intelligence Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            C-suite customer voice dossier with data quality disclosures and verified action items
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={handleExportFullCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div
        ref={reportRef}
        className="p-8 sm:p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-float text-slate-900 dark:text-slate-100 space-y-8"
      >
        {/* Report Header */}
        <div className="border-b-2 border-brand-600 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase font-extrabold tracking-widest text-brand-600 dark:text-brand-400 mb-1">
              InsightFlow Executive Briefing
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Customer Feedback & Operational Triage Report
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Active Dataset: <strong className="font-mono text-slate-700 dark:text-slate-300">{datasetName}</strong>
              {datasetSha256 && (
                <span className="block mt-0.5 font-mono text-[11px] text-slate-400">
                  SHA-256: <span className="select-all text-slate-600 dark:text-slate-300">{datasetSha256}</span>
                </span>
              )}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 shrink-0">
            <div>Generated: <strong>{reportGeneratedAt}</strong></div>
            <div>Counting Policy: <strong className="capitalize">{countingPolicy}</strong></div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600" />
            1. Executive Summary & Overview
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            This report synthesizes <strong className="font-semibold">{allAnalyzedRecords.length.toLocaleString()} customer voice records</strong> ingested into InsightFlow. Algorithmic deduplication identifies <strong className="font-semibold">{datasetStats.uniqueRecords.toLocaleString()} unique semantic complaints</strong> and <strong className="font-semibold text-amber-600">{datasetStats.duplicatesRemoved.toLocaleString()} duplicate mentions ({datasetStats.duplicatePercentage}%)</strong>.
            The dominant sentiment is{' '}
            <strong className="text-rose-600">
              {Math.round((datasetStats.sentimentCounts.negative / datasetStats.totalRecords) * 100)}% Negative
            </strong>, driven primarily by recurring incidents in fraud protection, customer support hold delays, and fulfillment failures.
          </p>

          {/* Key KPI Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Cohort</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{allAnalyzedRecords.length.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Unique Reviews</span>
              <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">{datasetStats.uniqueRecords.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Critical Issues</span>
              <span className="text-xl font-extrabold text-rose-600">{priorityIssues.filter(i => i.priorityLevel === 'Critical').length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Action Plans</span>
              <span className="text-xl font-extrabold text-emerald-600">{recommendations.length}</span>
            </div>
          </div>
        </section>

        {/* 2. Data Quality & Deduplication Note */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            2. Data Quality & Deduplication Disclosure
          </h3>
          <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-950 dark:text-amber-200 space-y-2">
            <p>
              <strong>Methodology Disclosure:</strong> Exact and normalized deduplication reveals whether identical feedback texts repeat throughout the raw dataset. Because the source dataset lacks unique customer IDs, InsightFlow avoids assuming repeated texts represent separate individuals.
            </p>
            <p>
              <strong>Counting Policy Active:</strong> Currently configured to{' '}
              <span className="font-bold underline">
                {countingPolicy === 'raw'
                  ? `Raw Mentions (${datasetStats.totalRecords.toLocaleString()})`
                  : `Deduplicated Cohort (${datasetStats.uniqueRecords.toLocaleString()})`}
              </span>.
              Deduplication prevents repeated automated submissions from artificially inflating triage priority.
            </p>
          </div>
        </section>

        {/* 3. Top Priority Issues & Risk Register */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            3. Top Operational Issues & Risk Register
          </h3>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
            {priorityIssues.slice(0, 4).map((issue) => (
              <div key={issue.id} className="p-4 space-y-2 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        issue.priorityLevel === 'Critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {issue.priorityLevel} (Score: {issue.priorityScore})
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{issue.title}</h4>
                  </div>
                  <span className="font-semibold text-slate-500">
                    Owner: {issue.suggestedOwner}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {issue.recommendedAction}
                </p>
                <div className="text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 p-2 rounded">
                  Representative Citation: "{issue.representativeEvidence[0]}"
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Strategic Recommendations */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            4. Strategic Remediation Action Plans
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {recommendations.slice(0, 4).map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rec.title}</h4>
                  <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded">
                    {rec.suggestedTeam}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{rec.problem}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300">
                  <strong>Verification Metric:</strong> {rec.verificationMetric}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Limitations & Compliance */}
        <section className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Methodology & Limitations Notice:
          </p>
          <p>
            1. All numbers derive strictly from the active dataset without synthetic data replacement.
          </p>
          <p>
            2. Customer review text contains no timestamp attributes; chronological trends are intentionally omitted to prevent data fabrication.
          </p>
          <p>
            3. Classification performed via deterministic lexicon and rule engine fallback with documented confidence estimation.
          </p>
        </section>
      </div>
    </div>
  );
};
