import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 animate-bounce-short"
    >
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-float border border-slate-700 dark:border-slate-200 text-xs sm:text-sm font-medium">
        <CheckCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" aria-hidden="true" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
