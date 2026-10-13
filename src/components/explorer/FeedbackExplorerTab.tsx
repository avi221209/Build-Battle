import React, { useState } from 'react';
import { FeedbackTable } from './FeedbackTable';
import { FeedbackDetailDrawer } from './FeedbackDetailDrawer';
import { ManualFeedbackModal } from './ManualFeedbackModal';
import { AnalyzedFeedbackRecord } from '../../types/feedback';
import { useApp } from '../../context/AppContext';

export const FeedbackExplorerTab: React.FC = () => {
  const { createTrackedIssue, showToast, datasetSha256 } = useApp();
  const [selectedRecord, setSelectedRecord] = useState<AnalyzedFeedbackRecord | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const handleCreateIssueFromRecord = (rec: AnalyzedFeedbackRecord) => {
    createTrackedIssue(
      `Customer Issue: ${rec.summary}`,
      `Originating Feedback:\n"${rec.review}"\n\nSource Category: ${rec.sourceCategory}\nInferred Topic: ${rec.topic}\nUrgency: ${rec.urgency}`,
      rec.urgency,
      'Unassigned',
      rec.sourceCategory === 'Fraud and Scam' ? 'Fraud & Risk' : 'Operations',
      [rec.id]
    );
    showToast('Created new tracked issue from customer feedback.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Feedback Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Search, filter, inspect evidence, and convert raw feedback into tracked operational tickets
          </p>
        </div>
        {datasetSha256 && (
          <div className="flex items-center gap-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Dataset SHA-256:</span>
            <span className="select-all">{datasetSha256}</span>
          </div>
        )}
      </div>

      <FeedbackTable
        onSelectRecord={setSelectedRecord}
        onOpenManualModal={() => setIsManualModalOpen(true)}
      />

      {/* Drawer */}
      <FeedbackDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onCreateIssue={handleCreateIssueFromRecord}
      />

      {/* Manual Add Modal */}
      <ManualFeedbackModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
