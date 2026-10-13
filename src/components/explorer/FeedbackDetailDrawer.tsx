import React from 'react';
import {
  X,
  Smile,
  Meh,
  Frown,
  ShieldAlert,
  Layers,
  PlusCircle,
  Copy
} from 'lucide-react';
import { AnalyzedFeedbackRecord } from '../../types/feedback';
import { useApp } from '../../context/AppContext';

interface FeedbackDetailDrawerProps {
  record: AnalyzedFeedbackRecord | null;
  onClose: () => void;
  onCreateIssue: (record: AnalyzedFeedbackRecord) => void;
}

export const FeedbackDetailDrawer: React.FC<FeedbackDetailDrawerProps> = ({
  record,
  onClose,
  onCreateIssue
}) => {
  const { showToast } = useApp();

  // Handle Escape key
  React.useEffect(() => {
    if (!record) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [record, onClose]);

  if (!record) return null;

  const getSentimentBadge = (sentiment: string) => {
    if (sentiment === 'positive') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
          <Smile className="w-3.5 h-3.5" /> Positive ({Math.round(record.sentimentScore * 100)}%)
        </span>
      );
    }
    if (sentiment === 'negative') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
          <Frown className="w-3.5 h-3.5" /> Negative ({Math.round(record.sentimentScore * 100)}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
        <Meh className="w-3.5 h-3.5" /> Neutral
      </span>
    );
  };

  const copyReview = () => {
    navigator.clipboard.writeText(record.review);
    showToast('Feedback text copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Feedback Record Details">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-400">
                {record.id}
              </span>
              {record.isDuplicate && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Repeated {record.duplicateCount}x
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Close feedback detail drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
            {/* Review Box */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                <span>Customer Review Text</span>
                <button
                  onClick={copyReview}
                  className="flex items-center gap-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <Copy className="w-3 h-3" /> Copy
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                "{record.review}"
              </div>
            </div>

            {/* Classification Overview Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Inferred Sentiment</span>
                <div className="mt-1">{getSentimentBadge(record.sentiment)}</div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Urgency Level</span>
                <div className="mt-1 font-semibold text-sm">
                  {record.urgency === 'Critical' ? (
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold">
                      <ShieldAlert className="w-4 h-4" /> Critical
                    </span>
                  ) : record.urgency === 'High' ? (
                    <span className="text-amber-600 dark:text-amber-400 font-bold">High</span>
                  ) : (
                    <span className="text-slate-600 dark:text-slate-300">{record.urgency}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Source Category vs AI Topic */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Source Category (Dataset):</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{record.sourceCategory}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Inferred Topic (Rule-based):</span>
                <span className="font-semibold text-purple-700 dark:text-purple-300">{record.topic}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Issue Category:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{record.issueType}</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Classification Confidence:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {Math.round(record.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Evidence Snippets */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Supporting Evidence Snippets
              </span>
              <div className="space-y-1.5">
                {record.evidenceSnippets.map((snip, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 font-mono"
                  >
                    "{snip}"
                  </div>
                ))}
              </div>
            </div>

            {/* Structured JSON view */}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                Structured Schema Output
              </span>
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed">
                {JSON.stringify({
                  id: record.id,
                  sentiment: record.sentiment,
                  sentimentScore: record.sentimentScore,
                  topic: record.topic,
                  issueType: record.issueType,
                  urgency: record.urgency,
                  confidence: record.confidence,
                  evidence: record.evidenceSnippets
                }, null, 2)}
              </pre>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onCreateIssue(record);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Convert to Tracked Issue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
