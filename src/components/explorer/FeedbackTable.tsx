import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Smile,
  Frown,
  Meh,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Layers,
  ShieldAlert,
  Eye,
  Plus
} from 'lucide-react';
import { AnalyzedFeedbackRecord } from '../../types/feedback';
import { useApp } from '../../context/AppContext';

interface FeedbackTableProps {
  onSelectRecord: (record: AnalyzedFeedbackRecord) => void;
  onOpenManualModal: () => void;
}

type SortField = 'review' | 'sourceCategory' | 'sentiment' | 'urgency' | 'duplicateCount' | 'confidence';

export const FeedbackTable: React.FC<FeedbackTableProps> = ({
  onSelectRecord,
  onOpenManualModal
}) => {
  const {
    activeRecords,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedSentiment,
    setSelectedSentiment,
    selectedTopic,
    setSelectedTopic,
    showDuplicatesOnly,
    setShowDuplicatesOnly,
    resetFilters,
    showToast
  } = useApp();

  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortField, setSortField] = useState<SortField>('duplicateCount');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Sorting
  const sortedRecords = useMemo(() => {
    return [...activeRecords].sort((a, b) => {
      let valA: string | number = (a[sortField] ?? '') as string | number;
      let valB: string | number = (b[sortField] ?? '') as string | number;

      if (sortField === 'urgency') {
        const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        valA = order[a.urgency as keyof typeof order] || 0;
        valB = order[b.urgency as keyof typeof order] || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [activeRecords, sortField, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending
    }
  };

  // Export filtered CSV
  const exportFilteredCsv = () => {
    if (activeRecords.length === 0) return;

    const headers = ['id', 'review', 'category', 'sentiment', 'topic', 'urgency', 'confidence', 'duplicate_count'];
    const rows = activeRecords.map(r => [
      `"${r.id}"`,
      `"${r.review.replace(/"/g, '""')}"`,
      `"${r.sourceCategory}"`,
      `"${r.sentiment}"`,
      `"${r.topic}"`,
      `"${r.urgency}"`,
      r.confidence,
      r.duplicateCount
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `insightflow_filtered_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${activeRecords.length.toLocaleString()} records to CSV.`);
  };

  const categories = ['All', 'Customer Service', 'Fraud and Scam', 'Operational Issues', 'Product Feedback'];
  const sentiments = ['All', 'positive', 'neutral', 'negative'];
  const topics = [
    'All',
    'Product quality and features',
    'Customer support',
    'Delivery and fulfillment',
    'Website and ordering',
    'Fraud and suspicious transactions',
    'Refunds and payments',
    'Other or unclassified'
  ];

  return (
    <div className="space-y-4">
      {/* Top Controls & Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter reviews by keyword or quote..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportFilteredCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV ({activeRecords.length.toLocaleString()})</span>
            </button>
            <button
              onClick={onOpenManualModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Feedback</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:divide-slate-800 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 px-2 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sentiment Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Sentiment:</span>
            <select
              value={selectedSentiment}
              onChange={(e) => {
                setSelectedSentiment(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 px-2 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 focus:outline-none capitalize"
            >
              {sentiments.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Topic Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentPage(1);
              }}
              className="py-1 px-2 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200 focus:outline-none max-w-[180px] truncate"
            >
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Duplicates Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer ml-auto text-slate-600 dark:text-slate-300 font-medium">
            <input
              type="checkbox"
              checked={showDuplicatesOnly}
              onChange={(e) => {
                setShowDuplicatesOnly(e.target.checked);
                setCurrentPage(1);
              }}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Show Repetitions Only</span>
          </label>

          {/* Reset Filters button */}
          {(searchQuery || selectedCategory !== 'All' || selectedSentiment !== 'All' || selectedTopic !== 'All' || showDuplicatesOnly) && (
            <button
              onClick={resetFilters}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline ml-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 min-w-[280px]">
                  <button onClick={() => handleSort('review')} className="flex items-center gap-1 hover:text-slate-900">
                    Review Text <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('sourceCategory')} className="flex items-center gap-1 hover:text-slate-900">
                    Category <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('sentiment')} className="flex items-center gap-1 hover:text-slate-900">
                    Sentiment <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">Inferred Topic</th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('urgency')} className="flex items-center gap-1 hover:text-slate-900">
                    Urgency <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('duplicateCount')} className="flex items-center gap-1 hover:text-slate-900">
                    Repeats <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-3">
                  <button onClick={() => handleSort('confidence')} className="flex items-center gap-1 hover:text-slate-900">
                    Confidence <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No customer feedback records match the active search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onSelectRecord(r)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    {/* Review Excerpt */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                        {r.review}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">
                        {r.summary}
                      </div>
                    </td>

                    {/* Source Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-medium text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {r.sourceCategory}
                      </span>
                    </td>

                    {/* Sentiment Badge */}
                    <td className="py-3 px-3">
                      {r.sentiment === 'positive' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          <Smile className="w-3 h-3" /> Positive
                        </span>
                      )}
                      {r.sentiment === 'neutral' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          <Meh className="w-3 h-3" /> Neutral
                        </span>
                      )}
                      {r.sentiment === 'negative' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                          <Frown className="w-3 h-3" /> Negative
                        </span>
                      )}
                    </td>

                    {/* Inferred Topic */}
                    <td className="py-3 px-3 text-xs text-purple-700 dark:text-purple-300 font-medium whitespace-nowrap">
                      {r.topic}
                    </td>

                    {/* Urgency */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {r.urgency === 'Critical' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-xs text-rose-600 dark:text-rose-400">
                          <ShieldAlert className="w-3 h-3" /> Critical
                        </span>
                      ) : r.urgency === 'High' ? (
                        <span className="font-semibold text-xs text-amber-600 dark:text-amber-400">High</span>
                      ) : (
                        <span className="text-xs text-slate-500">{r.urgency}</span>
                      )}
                    </td>

                    {/* Repeat Count */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {r.duplicateCount > 1 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono text-xs font-semibold">
                          <Layers className="w-3 h-3" /> {r.duplicateCount}x
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">1x</span>
                      )}
                    </td>

                    {/* Confidence */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-xs text-slate-700 dark:text-slate-300">
                      {Math.round(r.confidence * 100)}%
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(r);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Full Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>
              Showing {Math.min((currentPage - 1) * pageSize + 1, sortedRecords.length)} -{' '}
              {Math.min(currentPage * pageSize, sortedRecords.length)} of {sortedRecords.length.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
