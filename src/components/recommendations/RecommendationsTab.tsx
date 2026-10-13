import React from 'react';
import {
  Lightbulb,
  CheckCircle2,
  PlusCircle,
  Building,
  Target
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecommendationsTab: React.FC = () => {
  const {
    recommendations,
    updateRecommendationStatus,
    convertRecommendationToIssue,
    setCurrentTab
  } = useApp();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Evidence-Backed Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Turn customer intelligence into prioritized engineering and operational action plans
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
            No recommendations generated. Ingest feedback records to generate action plans.
          </div>
        ) : (
          recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`p-5 rounded-xl border bg-white dark:bg-slate-900 shadow-subtle transition-all ${
                rec.status === 'converted_to_issue'
                  ? 'border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/20'
                  : rec.status === 'dismissed'
                  ? 'opacity-60 border-slate-200 dark:border-slate-800'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        rec.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                      <Building className="w-3 h-3" /> Team: {rec.suggestedTeam}
                    </span>
                    {rec.status === 'converted_to_issue' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Converted to Tracked Issue
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {rec.title}
                  </h3>

                  {/* Problem & Business Impact */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Observed Problem
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {rec.problem}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Business Impact & Why It Matters
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                        {rec.businessImpact}
                      </p>
                    </div>
                  </div>

                  {/* Recommended Action Plan */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 block mb-1.5 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      Recommended Action Plan:
                    </span>
                    <pre className="font-sans text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {rec.recommendedAction}
                    </pre>
                  </div>

                  {/* Expected Outcome & Verification Metric */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block">Expected Outcome:</span>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5">{rec.expectedOutcome}</p>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 text-emerald-500" /> Verification Metric:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">{rec.verificationMetric}</p>
                    </div>
                  </div>

                  {/* Evidence Quotes */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Direct Customer Evidence Quotes:
                    </span>
                    {rec.evidenceQuotes.map((q, idx) => (
                      <p
                        key={idx}
                        className="text-xs text-slate-700 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded border border-amber-100 dark:border-amber-900/30"
                      >
                        "{q}"
                      </p>
                    ))}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="lg:w-48 shrink-0 flex flex-col justify-between gap-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-3 lg:pt-0 lg:pl-4">
                  <div className="space-y-2">
                    {rec.status !== 'converted_to_issue' ? (
                      <button
                        onClick={() => convertRecommendationToIssue(rec.id)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Track as Issue</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentTab('tracker')}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>View in Tracker</span>
                      </button>
                    )}

                    {rec.status === 'pending' && (
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => updateRecommendationStatus(rec.id, 'accepted')}
                          className="py-1.5 px-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-slate-700 dark:text-slate-300 hover:text-emerald-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateRecommendationStatus(rec.id, 'dismissed')}
                          className="py-1.5 px-2 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-700 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Status: <strong className="capitalize text-slate-700 dark:text-slate-300">{rec.status.replace(/_/g, ' ')}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
