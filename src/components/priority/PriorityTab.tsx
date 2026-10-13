import React, { useState } from 'react';
import {
  AlertTriangle,
  Sliders,
  ShieldAlert,
  Info,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PriorityIssue, PriorityWeights } from '../../types/priority';

export const PriorityTab: React.FC = () => {
  const {
    priorityIssues,
    priorityWeights,
    updatePriorityWeights,
    updateIssueStatus,
    setSearchQuery,
    setCurrentTab
  } = useApp();

  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [tempWeights, setTempWeights] = useState<PriorityWeights>(priorityWeights);

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    updatePriorityWeights(tempWeights);
    setIsConfigOpen(false);
  };

  const handleInspectMatching = (issue: PriorityIssue) => {
    setSearchQuery(issue.topic);
    setCurrentTab('explorer');
  };

  const getPriorityBadge = (level: string) => {
    if (level === 'Critical') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" /> Critical Risk
        </span>
      );
    }
    if (level === 'High') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5" /> High Priority
        </span>
      );
    }
    if (level === 'Medium') {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          Medium
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Low
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Explainable Priority Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Transparent algorithmic ranking based on verified complaint frequency, severity, sentiment, and risk
          </p>
        </div>
        <button
          onClick={() => {
            setTempWeights(priorityWeights);
            setIsConfigOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors self-start sm:self-center"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Configure Scoring Weights</span>
        </button>
      </div>

      {/* Heuristic Formula Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">Methodology Note: </span>
          The priority formula is <strong className="text-slate-800 dark:text-slate-200">heuristic, configurable, and not externally validated</strong>. Priority scores (0–100) are computed at runtime from active feedback volume, negative sentiment proportion, and keyword severity. The 1.35x Fraud &amp; Scam multiplier is an operational heuristic assumption designed to surface financial and account safety complaints. No unverified financial loss or quantitative ROI claims are made.
        </div>
      </div>

      {/* Priority Issues List */}
      <div className="space-y-4">
        {priorityIssues.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            No priority issues detected for the active cohort.
          </div>
        ) : (
          priorityIssues.map((issue) => (
            <div
              key={issue.id}
              className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-subtle transition-all ${
                issue.priorityLevel === 'Critical'
                  ? 'border-rose-300 dark:border-rose-900/60'
                  : issue.priorityLevel === 'High'
                  ? 'border-amber-300 dark:border-amber-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Left: Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getPriorityBadge(issue.priorityLevel)}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {issue.title}
                    </h3>
                  </div>

                  {/* Metrics Badge Row */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{issue.totalMentions}</span> raw mentions
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{issue.uniqueReviewsCount}</span> distinct customers
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                      {Math.round(issue.negativeRatio * 100)}% negative sentiment
                    </span>
                    <span>•</span>
                    <span>Owner: <strong className="text-slate-700 dark:text-slate-300">{issue.suggestedOwner}</strong></span>
                  </div>

                  {/* Recommendation action */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                      Recommended Immediate Action:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {issue.recommendedAction}
                    </p>
                  </div>

                  {/* Supporting Quotes */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Empirical Customer Citations:
                    </span>
                    {issue.representativeEvidence.map((quote, qIdx) => (
                      <p
                        key={qIdx}
                        className="text-xs text-slate-700 dark:text-slate-300 italic bg-amber-50/40 dark:bg-amber-950/20 p-2 rounded border border-amber-100/60 dark:border-amber-900/30"
                      >
                        "{quote}"
                      </p>
                    ))}
                  </div>

                  {/* Factor Explanation Statement */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{issue.explanation}</span>
                  </div>
                </div>

                {/* Right: Score Gauge & Factors Breakdown */}
                <div className="lg:w-72 shrink-0 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-500">Priority Score</span>
                      <div className="text-2xl font-black text-brand-600 dark:text-brand-400 font-mono">
                        {issue.priorityScore}
                        <span className="text-xs font-normal text-slate-400">/100</span>
                      </div>
                    </div>

                    {/* Factors Breakdown Bars */}
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <div className="flex justify-between text-slate-500 mb-0.5">
                          <span>Volume ({issue.uniqueReviewsCount} distinct)</span>
                          <span className="font-mono">{issue.factors.volumeFactor}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${issue.factors.volumeFactor}%` }} className="bg-brand-500 h-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-500 mb-0.5">
                          <span>Severity Factor</span>
                          <span className="font-mono">{issue.factors.severityFactor}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${issue.factors.severityFactor}%` }} className="bg-amber-500 h-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-slate-500 mb-0.5">
                          <span>Negative Sentiment</span>
                          <span className="font-mono">{issue.factors.sentimentFactor}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div style={{ width: `${issue.factors.sentimentFactor}%` }} className="bg-rose-500 h-full" />
                        </div>
                      </div>

                      {issue.factors.fraudRiskMultiplier > 1.0 && (
                        <div className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[10px] font-bold text-center">
                          +25% Security Threat Multiplier Applied
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <select
                      value={issue.status}
                      onChange={(e) => updateIssueStatus(issue.id, e.target.value as PriorityIssue['status'])}
                      className="text-xs font-semibold px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Dismissed">Dismissed</option>
                    </select>

                    <button
                      onClick={() => handleInspectMatching(issue)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      <span>View Reviews</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Config Weights Modal */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={() => setIsConfigOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Configure Priority Scoring Formula
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Adjust mathematical weightings to align with your organization's SLA requirements
            </p>

            <form onSubmit={handleSaveWeights} className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Distinct Customer Volume Weight:</span>
                  <span className="font-mono">{Math.round(tempWeights.volumeWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={tempWeights.volumeWeight}
                  onChange={(e) => setTempWeights({ ...tempWeights, volumeWeight: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Negative Sentiment Weight:</span>
                  <span className="font-mono">{Math.round(tempWeights.negativeSentimentWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={tempWeights.negativeSentimentWeight}
                  onChange={(e) => setTempWeights({ ...tempWeights, negativeSentimentWeight: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Expressed Severity Weight:</span>
                  <span className="font-mono">{Math.round(tempWeights.severityWeight * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.5"
                  step="0.05"
                  value={tempWeights.severityWeight}
                  onChange={(e) => setTempWeights({ ...tempWeights, severityWeight: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <span>Enable Fraud &amp; Security Multiplier:</span>
                  <input
                    type="checkbox"
                    checked={tempWeights.fraudSecurityBoost}
                    onChange={(e) => setTempWeights({ ...tempWeights, fraudSecurityBoost: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>

                {tempWeights.fraudSecurityBoost && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Multiplier Value (Heuristic Assumption):</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{tempWeights.fraudMultiplierValue ?? 1.35}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.0"
                      step="0.05"
                      value={tempWeights.fraudMultiplierValue ?? 1.35}
                      onChange={(e) => setTempWeights({ ...tempWeights, fraudMultiplierValue: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Operational heuristic assumption: scales up complaints that threaten account integrity, payment safety, or legal fraud liability.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm"
                >
                  Save & Re-Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
