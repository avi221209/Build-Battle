import React, { useRef } from 'react';
import {
  Menu,
  Upload,
  PlusCircle,
  Sparkles,
  Search
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenManualModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, onOpenManualModal }) => {
  const {
    countingPolicy,
    setCountingPolicy,
    searchQuery,
    setSearchQuery,
    uploadCsvData,
    datasetStats,
    setCurrentTab
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        await uploadCsvData(content, file.name);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu + Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="global-search-input"
              type="text"
              aria-label="Search customer reviews, summaries, topics"
              placeholder="Search customer reviews, summaries, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hidden File Input */}
          <input
            id="csv-file-upload-input"
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            aria-label="Upload CSV dataset file"
            className="hidden"
          />

          {/* Counting Policy Toggle Pill */}
          <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setCountingPolicy('raw')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                countingPolicy === 'raw'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Raw Mentions ({datasetStats.totalRecords.toLocaleString()})
            </button>
            <button
              onClick={() => setCountingPolicy('deduplicated')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                countingPolicy === 'deduplicated'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Unique ({datasetStats.uniqueRecords.toLocaleString()})
            </button>
          </div>

          {/* Upload CSV */}
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Import CSV dataset"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          {/* Add Feedback */}
          <button
            onClick={onOpenManualModal}
            aria-label="Add Feedback manually"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Feedback</span>
          </button>

          {/* Adaption Portal Direct Button */}
          <button
            onClick={() => setCurrentTab('adaption')}
            aria-label="Open Adaption Hub"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
            <span>Adaption Hub</span>
          </button>
        </div>
      </div>
    </header>
  );
};
