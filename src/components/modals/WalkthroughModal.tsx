import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Compass, 
  MessageSquare, 
  Smile, 
  Repeat, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface WalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkthroughModal: React.FC<WalkthroughModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentTab, setCountingPolicy, countingPolicy, datasetStats, deduplicationSummary } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  // Handle Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalRecs = datasetStats?.totalRecords ?? 0;
  const uniqueRecs = datasetStats?.uniqueRecords ?? 0;
  const dupsRemoved = deduplicationSummary?.normalizedDuplicatesRemoved ?? 0;

  const steps = [
    {
      question: 'Question 1: What are customers saying?',
      title: 'Voice of the Customer Discovery',
      badge: 'Feedback Explorer & Topics',
      icon: MessageSquare,
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400',
      description:
        'InsightFlow ingests raw feedback records, parses text patterns, and maps unstructured voices into structured topics without losing the original voice.',
      highlights: [
        totalRecs > 0
          ? `Full ingestion of ${totalRecs.toLocaleString()} customer feedback records across primary categories.`
          : 'Full ingestion of customer feedback records across primary categories.',
        'Deterministic topic classification identifies specific themes: Fulfillment, Fraud, Quality, Checkout, and Support.',
        'Full-text search, multi-factor filtering, and JSON schema inspection drawer for every individual record.'
      ],
      actionLabel: 'Explore Feedback Records',
      onAction: () => {
        setCurrentTab('explorer');
        onClose();
      }
    },
    {
      question: 'Question 2: What is making them happy or unhappy?',
      title: 'Granular Sentiment & Driver Analysis',
      badge: 'Insights & Alignment',
      icon: Smile,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400',
      description:
        'Rather than painting whole categories with one brush, InsightFlow infers sentiment per record with confidence scoring and verbatim evidence extraction.',
      highlights: [
        'Sentiment breakdown distinguishes positive resolutions from recurring pain points.',
        'Cross-tabulation matrix displays how each source category maps to AI-inferred topics and sentiment.',
        'Interactive charts allow 1-click drilldowns to filter underlying records directly.'
      ],
      actionLabel: 'View Insights & Alignment',
      onAction: () => {
        setCurrentTab('insights');
        onClose();
      }
    },
    {
      question: 'Question 3: Which problems are recurring?',
      title: 'Empirical Deduplication & Frequency Analytics',
      badge: 'Data Quality & Counting Policy',
      icon: Repeat,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400',
      description:
        totalRecs > 0 && dupsRemoved > 0
          ? `A critical differentiator: The dataset contains ${dupsRemoved.toLocaleString()} duplicate reviews out of ${totalRecs.toLocaleString()} total rows. InsightFlow does not silently swallow this—it provides dual-policy transparency.`
          : 'A critical differentiator: InsightFlow detects identical feedback repetitions and provides dual-policy counting transparency.',
      highlights: [
        totalRecs > 0
          ? `Raw Mentions Mode (${totalRecs.toLocaleString()}): Evaluates sheer noise and reporting volume.`
          : 'Raw Mentions Mode: Evaluates sheer noise and reporting volume.',
        uniqueRecs > 0
          ? `Deduplicated Mode (${uniqueRecs.toLocaleString()} Unique): Evaluates distinct root causes without repeated complaints distorting rankings.`
          : 'Deduplicated Mode: Evaluates distinct root causes without repeated complaints distorting rankings.',
        'Transparent banner showing singleton vs repetition distribution across all categories.'
      ],
      actionLabel: countingPolicy === 'raw' ? 'Switch to Deduplicated Policy' : 'Keep Current Policy',
      onAction: () => {
        if (countingPolicy === 'raw') {
          setCountingPolicy('deduplicated');
        }
        setCurrentTab('overview');
        onClose();
      }
    },
    {
      question: 'Question 4: What should we fix first, and why?',
      title: 'Explainable Multi-Factor Prioritization',
      badge: 'Priority Engine & Actions',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400',
      description:
        'No black-box guesses. InsightFlow calculates a transparent, heuristic Priority Score (0-100) based on distinct volume, negative ratio, severity, confidence, and fraud relevance. Note: Heuristic and configurable; not externally validated.',
      highlights: [
        'Heuristic formula: Volume (25%) + Negative % (30%) + Severity (25%) + Confidence (20%) with an assumed 1.35x Fraud/Scam risk multiplier.',
        'Every priority issue reveals its factor breakdown, exact calculation steps, and verbatim customer proof.',
        'Interactive weight sliders allow adjusting organizational priorities on the fly.'
      ],
      actionLabel: 'Inspect Priority Issues',
      onAction: () => {
        setCurrentTab('priority');
        onClose();
      }
    },
    {
      question: 'Question 5: Did our actions improve customer experience?',
      title: 'Issue Tracker & Adaptive Data Optimization',
      badge: 'Closed-Loop Workflow',
      icon: CheckCircle2,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400',
      description:
        'Closing the loop between customer complaints and operational resolutions. Convert insights into tracked Kanban tickets and prepare instruction datasets for Adaption Labs.',
      highlights: [
        'Interactive Kanban Issue Tracker (Open, In Progress, Resolved, Dismissed) with team assignment and notes.',
        'Adaption Labs Integration: Prepares instruction datasets with column roles (Prompt, Context, Completion).',
        'Transparent 3-stage pipeline: Prepared → Handed off to Adaption App → Genuine Imported Comparison with computed label agreement metrics.'
      ],
      actionLabel: 'Open Adaption Workspace',
      onAction: () => {
        setCurrentTab('adaption');
        onClose();
      }
    }
  ];

  const current = steps[currentStep];
  const IconComponent = current.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkthrough-title"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h2 id="walkthrough-title" className="text-base font-semibold text-slate-900 dark:text-white">
                InsightFlow Product Walkthrough
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Solving the 5 Essential Customer Intelligence Questions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Close walkthrough"
            aria-label="Close walkthrough"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {current.badge}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'bg-indigo-600'
                    : idx < currentStep
                    ? 'bg-indigo-300 dark:bg-indigo-800'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-xl shrink-0 ${current.color}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
                {current.question}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {current.title}
              </h3>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.description}
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Key Empirical Capabilities
            </div>
            <ul className="space-y-1.5">
              {current.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 leading-normal">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={current.onAction}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-800/50 transition-colors"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                Complete Tour <CheckCircle2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
