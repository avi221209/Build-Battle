import React from 'react';
import {
  LayoutDashboard,
  Search,
  Layers,
  AlertTriangle,
  Lightbulb,
  CheckSquare,
  FileText,
  Sparkles,
  Database,
  Moon,
  Sun,
  Info
} from 'lucide-react';
import { useApp, NavigationTab } from '../../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentTab,
    setCurrentTab,
    isDarkMode,
    toggleDarkMode,
    countingPolicy,
    setCountingPolicy,
    datasetStats,
    priorityIssues,
    recommendations,
    trackedIssues
  } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'explorer', label: 'Feedback Explorer', icon: <Search className="w-5 h-5" />, badge: datasetStats.totalRecords.toLocaleString() },
    { id: 'insights', label: 'Insights & Topics', icon: <Layers className="w-5 h-5" /> },
    {
      id: 'priority',
      label: 'Priority Issues',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
      badge: priorityIssues.filter(i => i.priorityLevel === 'Critical' || i.priorityLevel === 'High').length
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: <Lightbulb className="w-5 h-5 text-indigo-500" />,
      badge: recommendations.filter(r => r.status === 'pending').length
    },
    {
      id: 'tracker',
      label: 'Issue Tracker',
      icon: <CheckSquare className="w-5 h-5 text-emerald-500" />,
      badge: trackedIssues.filter(t => t.status === 'Open' || t.status === 'In Progress').length
    },
    { id: 'reports', label: 'Reports & Export', icon: <FileText className="w-5 h-5" /> },
    {
      id: 'adaption',
      label: 'Data & Adaption',
      icon: <Sparkles className="w-5 h-5 text-purple-500" />,
      badge: 'Fine-Tune'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                InsightFlow
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  v2.6
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Customer Voice & Decisions</p>
            </div>
          </div>
        </div>

        {/* Workspace Identity */}
        <div className="px-3 pt-3 pb-2">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Workspace</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">Build Battle 2026 Core</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        {/* Deduplication Counting Policy Control */}
        <div className="px-3 py-2">
          <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-indigo-950 dark:text-indigo-200 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                Counting Policy
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-200/60 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300">
                {countingPolicy === 'raw' ? 'All Mentions' : 'Unique Only'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setCountingPolicy('raw')}
                className={`py-1 px-1.5 rounded font-medium text-center transition-colors ${
                  countingPolicy === 'raw'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                Raw ({datasetStats.totalRecords.toLocaleString()})
              </button>
              <button
                type="button"
                onClick={() => setCountingPolicy('deduplicated')}
                className={`py-1 px-1.5 rounded font-medium text-center transition-colors ${
                  countingPolicy === 'deduplicated'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                Unique ({datasetStats.uniqueRecords.toLocaleString()})
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav aria-label="Main Navigation" className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/80 dark:text-brand-300 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-brand-200/80 dark:bg-brand-800 text-brand-800 dark:text-brand-200'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer controls */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* Dark Mode & Quick status */}
          <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Analysis: Deterministic
            </span>
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="truncate">
              <div className="text-[10px] text-slate-400 font-medium">Dataset Ingested</div>
              <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate">
                BuildBattle_2026.csv
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
              Verified
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
