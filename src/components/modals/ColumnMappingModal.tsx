import React, { useState, useEffect } from 'react';
import { Columns3, AlertCircle, ArrowRight, X } from 'lucide-react';

interface ColumnMappingModalProps {
  isOpen: boolean;
  fileName: string;
  headers: string[];
  previewRows: Record<string, string>[];
  onConfirm: (reviewCol: string, categoryCol: string) => void;
  onCancel: () => void;
}

export const ColumnMappingModal: React.FC<ColumnMappingModalProps> = ({
  isOpen,
  fileName,
  headers,
  previewRows,
  onConfirm,
  onCancel,
}) => {
  const [selectedReviewCol, setSelectedReviewCol] = useState<string>(() => {
    return headers.find(h => /text|comment|note|desc|body|msg|detail/i.test(h)) || headers[0] || '';
  });
  const [selectedCategoryCol, setSelectedCategoryCol] = useState<string>(() => {
    return headers.find(h => /cat|type|label|tag|dept|group/i.test(h)) || '';
  });

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-columns-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
              <Columns3 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="map-columns-title" className="text-lg font-bold text-slate-900 dark:text-white">
                Map CSV Columns
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                File: <span className="font-mono text-slate-700 dark:text-slate-300">{fileName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
          <p>
            No column automatically matched standard review keywords (<code>review</code>, <code>text</code>, or <code>feedback</code>).
            Please choose which column contains the verbatim customer feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="select-review-col" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Feedback / Review Text Column <span className="text-rose-500">*</span>
            </label>
            <select
              id="select-review-col"
              value={selectedReviewCol}
              onChange={(e) => setSelectedReviewCol(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- Select Review Column --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="select-category-col" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Source Category Column (Optional)
            </label>
            <select
              id="select-category-col"
              value={selectedCategoryCol}
              onChange={(e) => setSelectedCategoryCol(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">-- None (Default to General) --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Sample Preview */}
        {previewRows.length > 0 && selectedReviewCol && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Preview Sample Values for &quot;{selectedReviewCol}&quot;:
            </label>
            <div className="max-h-28 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs font-mono space-y-1 text-slate-600 dark:text-slate-300">
              {previewRows.slice(0, 3).map((row, i) => (
                <div key={i} className="truncate">
                  <span className="text-slate-400 mr-2">#{i + 1}</span>
                  {row[selectedReviewCol] || '<empty>'}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Cancel
          </button>
          <button
            disabled={!selectedReviewCol}
            onClick={() => onConfirm(selectedReviewCol, selectedCategoryCol)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <span>Confirm & Ingest</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
