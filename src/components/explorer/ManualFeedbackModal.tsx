import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { analyzeSingleRecord } from '../../services/analysisEngine';
import { RawFeedbackRecord } from '../../types/feedback';

interface ManualFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualFeedbackModal: React.FC<ManualFeedbackModalProps> = ({ isOpen, onClose }) => {
  const { addManualFeedback } = useApp();
  const [review, setReview] = useState('');
  const [category, setCategory] = useState('Customer Service');

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Real-time classification preview as user types
  const previewRecord: RawFeedbackRecord = {
    id: 'preview',
    review: review || 'Previewing feedback analysis...',
    category
  };
  const analyzedPreview = analyzeSingleRecord(previewRecord, false, 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) return;

    addManualFeedback(review.trim(), category);
    setReview('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-feedback-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Plus className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h3 id="manual-feedback-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Add Customer Feedback
              </h3>
              <p className="text-xs text-slate-500">Injects directly into active dataset and analysis queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="manual-feedback-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Source Category
            </label>
            <select
              id="manual-feedback-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Customer Service">Customer Service</option>
              <option value="Fraud and Scam">Fraud and Scam</option>
              <option value="Operational Issues">Operational Issues</option>
              <option value="Product Feedback">Product Feedback</option>
              <option value="General">General / Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="manual-feedback-review" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Customer Review Text
            </label>
            <textarea
              id="manual-feedback-review"
              rows={4}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="E.g., The delivery arrived three days late and customer support refused to provide a tracking update..."
              className="w-full px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              required
            />
          </div>

          {/* Real-Time Analysis Preview */}
          {review.trim().length > 5 && (
            <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-indigo-950 dark:text-indigo-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                  Live Classification Preview
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                  {Math.round(analyzedPreview.confidence * 100)}% Confidence
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-indigo-100/80 dark:border-indigo-900/40">
                <div>
                  <span className="text-[10px] text-slate-400 block">Sentiment</span>
                  <span className="font-bold text-slate-900 dark:text-white capitalize">
                    {analyzedPreview.sentiment}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Topic</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-300 truncate block">
                    {analyzedPreview.topic}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Urgency</span>
                  <span className={`font-bold ${analyzedPreview.urgency === 'Critical' ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                    {analyzedPreview.urgency}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!review.trim()}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              Submit & Ingest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
