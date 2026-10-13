import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Toast } from './components/layout/Toast';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Compass, Loader2 } from 'lucide-react';

// Code-split tabs via React.lazy and dynamic import
const OverviewTab = lazy(() => import('./components/overview/OverviewTab').then(m => ({ default: m.OverviewTab })));
const FeedbackExplorerTab = lazy(() => import('./components/explorer/FeedbackExplorerTab').then(m => ({ default: m.FeedbackExplorerTab })));
const InsightsTab = lazy(() => import('./components/insights/InsightsTab').then(m => ({ default: m.InsightsTab })));
const PriorityTab = lazy(() => import('./components/priority/PriorityTab').then(m => ({ default: m.PriorityTab })));
const RecommendationsTab = lazy(() => import('./components/recommendations/RecommendationsTab').then(m => ({ default: m.RecommendationsTab })));
const IssueTrackerTab = lazy(() => import('./components/tracker/IssueTrackerTab').then(m => ({ default: m.IssueTrackerTab })));
const ReportsTab = lazy(() => import('./components/reports/ReportsTab').then(m => ({ default: m.ReportsTab })));
const AdaptionTab = lazy(() => import('./components/adaption/AdaptionTab').then(m => ({ default: m.AdaptionTab })));

// Code-split heavy modals
const WalkthroughModal = lazy(() => import('./components/modals/WalkthroughModal').then(m => ({ default: m.WalkthroughModal })));
const ColumnMappingModal = lazy(() => import('./components/modals/ColumnMappingModal').then(m => ({ default: m.ColumnMappingModal })));
const ManualFeedbackModal = lazy(() => import('./components/explorer/ManualFeedbackModal').then(m => ({ default: m.ManualFeedbackModal })));

const TabLoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    className="w-full py-16 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400"
  >
    <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400" />
    <span className="text-xs font-semibold uppercase tracking-wider">Loading tab view...</span>
  </div>
);

const MainAppLayout: React.FC = () => {
  const {
    currentTab,
    isLoading,
    loadingProgress,
    columnMappingState,
    confirmColumnMapping,
    cancelColumnMapping
  } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  // Show walkthrough on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('insightflow_tour_completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsWalkthroughOpen(true);
        localStorage.setItem('insightflow_tour_completed', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200 overflow-x-hidden">
      {/* Skip to Main Content Landmark for Screen Readers and Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:font-semibold focus:rounded-md focus:shadow-xl focus:ring-2 focus:ring-white focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Toast Notification */}
      <Toast />

      {/* Guided Walkthrough Modal */}
      {isWalkthroughOpen && (
        <Suspense fallback={null}>
          <WalkthroughModal
            isOpen={isWalkthroughOpen}
            onClose={() => setIsWalkthroughOpen(false)}
          />
        </Suspense>
      )}

      {/* Manual Feedback Add Modal */}
      {isManualModalOpen && (
        <Suspense fallback={null}>
          <ManualFeedbackModal
            isOpen={isManualModalOpen}
            onClose={() => setIsManualModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Interactive Column Mapping Modal when CSV lacks review columns */}
      {columnMappingState && columnMappingState.isOpen && (
        <Suspense fallback={null}>
          <ColumnMappingModal
            isOpen={columnMappingState.isOpen}
            fileName={columnMappingState.fileName}
            headers={columnMappingState.headers}
            previewRows={columnMappingState.previewRows}
            onConfirm={confirmColumnMapping}
            onCancel={cancelColumnMapping}
          />
        </Suspense>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 overflow-x-hidden">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenManualModal={() => setIsManualModalOpen(true)}
        />

        {/* Global Loading Progress Banner if dataset is parsing */}
        {isLoading && (
          <div
            role="status"
            aria-live="polite"
            className="bg-brand-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between animate-fadeIn z-20"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-100">
                  {loadingProgress.stage || 'Ingesting Dataset...'}
                </p>
                <p className="text-xs text-brand-200">
                  Processing record {loadingProgress.processed.toLocaleString()} of {loadingProgress.total.toLocaleString()}
                </p>
              </div>
            </div>
            <div
              className="w-48 bg-brand-900/60 rounded-full h-2 overflow-hidden hidden sm:block"
              aria-hidden="true"
            >
              <div
                className="bg-white h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    loadingProgress.total > 0
                      ? Math.min(100, Math.round((loadingProgress.processed / loadingProgress.total) * 100))
                      : 10
                  }%`
                }}
              />
            </div>
          </div>
        )}

        {/* Tab View Container */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto focus:outline-none"
        >
          <Suspense fallback={<TabLoadingFallback />}>
            {currentTab === 'overview' && <OverviewTab />}
            {currentTab === 'explorer' && <FeedbackExplorerTab />}
            {currentTab === 'insights' && <InsightsTab />}
            {currentTab === 'priority' && <PriorityTab />}
            {currentTab === 'recommendations' && <RecommendationsTab />}
            {currentTab === 'tracker' && <IssueTrackerTab />}
            {currentTab === 'reports' && <ReportsTab />}
            {currentTab === 'adaption' && <AdaptionTab />}
          </Suspense>
        </main>

        {/* Persistent Floating Tour Trigger */}
        <div className="fixed bottom-6 right-6 z-30">
          <button
            onClick={() => setIsWalkthroughOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-xs font-semibold border border-brand-400/30 group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
            title="Launch 5-Question Product Tour"
            aria-label="Launch 5-Question Product Tour"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" aria-hidden="true" />
            <span className="hidden sm:inline">Product Tour</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainAppLayout />
      </AppProvider>
    </ErrorBoundary>
  );
}
