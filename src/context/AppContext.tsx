import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AnalyzedFeedbackRecord,
  DatasetStats,
  RawFeedbackRecord,
  SentimentType,
  TopicType
} from '../types/feedback';
import { PriorityIssue, PriorityWeights } from '../types/priority';
import { Recommendation } from '../types/recommendation';
import { TrackedIssue, IssueStatus } from '../types/issue';
import {
  AdaptionColumnMapping,
  AdaptionRecipeSelection,
  AdaptionWorkflowState,
  ImportedComparisonMetrics
} from '../types/adaption';
import { performDeduplication, DeduplicationSummary } from '../services/deduplication';
import { batchAnalyzeFeedback, analyzeSingleRecord } from '../services/analysisEngine';
import { generatePriorityIssues, DEFAULT_PRIORITY_WEIGHTS } from '../services/priorityEngine';
import { generateRecommendations } from '../services/recommendationEngine';
import {
  DEFAULT_RECIPE_SELECTION,
  DEFAULT_COLUMN_MAPPING,
  computeImportedComparison,
  generateTestFixture
} from '../services/adaptionService';
import { parseAndValidateCsv } from '../services/csvIngestion';

export type NavigationTab =
  | 'overview'
  | 'explorer'
  | 'insights'
  | 'priority'
  | 'recommendations'
  | 'tracker'
  | 'reports'
  | 'adaption';

export type CountingPolicy = 'raw' | 'deduplicated';

interface AppContextType {
  // Navigation & Theme
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Dataset & Ingestion
  datasetName: string;
  datasetSha256: string | null;
  isLoading: boolean;
  loadingProgress: { processed: number; total: number; stage: string };
  rawRecords: RawFeedbackRecord[];
  allAnalyzedRecords: AnalyzedFeedbackRecord[];
  deduplicationSummary: DeduplicationSummary | null;
  countingPolicy: CountingPolicy;
  setCountingPolicy: (policy: CountingPolicy) => void;
  uploadCsvData: (csvContent: string, fileName?: string) => Promise<void>;
  columnMappingState: {
    isOpen: boolean;
    rawCsv: string;
    fileName: string;
    headers: string[];
    previewRows: Record<string, string>[];
  } | null;
  confirmColumnMapping: (reviewCol: string, categoryCol: string) => Promise<void>;
  cancelColumnMapping: () => void;
  addManualFeedback: (review: string, category: string) => void;
  loadDemoDataset: () => Promise<void>;

  // Filter States
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSentiment: string;
  setSelectedSentiment: (sent: string) => void;
  selectedTopic: string;
  setSelectedTopic: (topic: string) => void;
  showDuplicatesOnly: boolean;
  setShowDuplicatesOnly: (val: boolean) => void;
  resetFilters: () => void;

  // Active Filtered Views
  activeRecords: AnalyzedFeedbackRecord[]; // Respects counting policy and all filters
  datasetStats: DatasetStats;

  // Priority Engine
  priorityIssues: PriorityIssue[];
  priorityWeights: PriorityWeights;
  updatePriorityWeights: (weights: PriorityWeights) => void;
  updateIssueStatus: (issueId: string, status: 'Open' | 'In Progress' | 'Resolved' | 'Dismissed') => void;

  // Recommendations
  recommendations: Recommendation[];
  updateRecommendationStatus: (id: string, status: Recommendation['status']) => void;
  convertRecommendationToIssue: (recId: string) => void;

  // Issue Tracker
  trackedIssues: TrackedIssue[];
  createTrackedIssue: (
    title: string,
    description: string,
    priority: PriorityIssue['priorityLevel'],
    owner: string,
    team: string,
    linkedFeedbackIds?: string[]
  ) => void;
  updateTrackedIssueStatus: (id: string, status: IssueStatus) => void;
  addIssueNote: (issueId: string, noteText: string, author?: string) => void;

  // Adaption Integration
  adaptionColumnMapping: AdaptionColumnMapping;
  setAdaptionColumnMapping: (mapping: AdaptionColumnMapping) => void;
  adaptionRecipes: AdaptionRecipeSelection;
  setAdaptionRecipes: (recipes: AdaptionRecipeSelection) => void;
  workflowState: AdaptionWorkflowState;
  setWorkflowState: (state: AdaptionWorkflowState) => void;
  importedComparison: ImportedComparisonMetrics | null;
  importAdaptedData: (
    data: Array<{ review?: string; sentiment?: string; topic?: string; completion?: string }>,
    isFixture?: boolean,
    label?: string
  ) => void;
  loadTestFixtureComparison: () => void;
  clearComparison: () => void;

  // Quick Drilldown
  drilldownTopic: (topic: TopicType) => void;
  drilldownCategory: (cat: string) => void;
  drilldownSentiment: (sentiment: SentimentType) => void;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRACKED_ISSUES: 'insightflow_tracked_issues_v1',
  THEME: 'insightflow_theme_v1',
  COUNTING_POLICY: 'insightflow_policy_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Theme
  const [currentTab, setCurrentTab] = useState<NavigationTab>('overview');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) === 'dark';
  });

  // Dataset States
  const [datasetName, setDatasetName] = useState<string>('BuildBattle_2026_Customer_Feedback_Dataset.csv');
  const [datasetSha256, setDatasetSha256] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingProgress, setLoadingProgress] = useState({ processed: 0, total: 0, stage: 'Initializing' });
  const [rawRecords, setRawRecords] = useState<RawFeedbackRecord[]>([]);
  const [allAnalyzedRecords, setAllAnalyzedRecords] = useState<AnalyzedFeedbackRecord[]>([]);
  const [deduplicationSummary, setDeduplicationSummary] = useState<DeduplicationSummary | null>(null);
  const [countingPolicy, setCountingPolicy] = useState<CountingPolicy>(() => {
    return (localStorage.getItem(STORAGE_KEYS.COUNTING_POLICY) as CountingPolicy) || 'raw';
  });
  const [columnMappingState, setColumnMappingState] = useState<{
    isOpen: boolean;
    rawCsv: string;
    fileName: string;
    headers: string[];
    previewRows: Record<string, string>[];
  } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSentiment, setSelectedSentiment] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  // Priority Weights & Issues
  const [priorityWeights, setPriorityWeights] = useState<PriorityWeights>(DEFAULT_PRIORITY_WEIGHTS);
  const [priorityIssues, setPriorityIssues] = useState<PriorityIssue[]>([]);

  // Recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Tracked Issues (Persistent)
  const [trackedIssues, setTrackedIssues] = useState<TrackedIssue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRACKED_ISSUES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Adaption State (Prepared | Handed off | Imported)
  const [adaptionColumnMapping, setAdaptionColumnMapping] = useState<AdaptionColumnMapping>(DEFAULT_COLUMN_MAPPING);
  const [adaptionRecipes, setAdaptionRecipes] = useState<AdaptionRecipeSelection>(DEFAULT_RECIPE_SELECTION);
  const [workflowState, setWorkflowState] = useState<AdaptionWorkflowState>('prepared');
  const [importedComparison, setImportedComparison] = useState<ImportedComparisonMetrics | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sync theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Sync counting policy
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COUNTING_POLICY, countingPolicy);
  }, [countingPolicy]);

  // Sync tracked issues
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRACKED_ISSUES, JSON.stringify(trackedIssues));
  }, [trackedIssues]);

  // Process and ingest records helper
  const ingestDataset = async (records: RawFeedbackRecord[], name: string, sha256Hex?: string) => {
    setIsLoading(true);
    setLoadingProgress({ processed: 0, total: records.length, stage: 'Deduplicating & Normalizing' });
    setDatasetName(name);
    if (sha256Hex) setDatasetSha256(sha256Hex);

    // 1. Deduplication pass
    const dedupResult = performDeduplication(records);
    setDeduplicationSummary(dedupResult.summary);
    setRawRecords(records);

    // 2. Batch Analysis pass
    setLoadingProgress({ processed: 0, total: records.length, stage: 'Analyzing Sentiment & Topics' });
    const analyzed = await batchAnalyzeFeedback(
      dedupResult.recordsWithDuplicateMetadata,
      (processed, total) => {
        setLoadingProgress({ processed, total, stage: 'Analyzing Sentiment & Topics' });
      }
    );

    setAllAnalyzedRecords(analyzed);

    // 3. Priority clustering pass
    const baseCohort = countingPolicy === 'deduplicated'
      ? analyzed.filter(r => !r.isDuplicate || r.duplicateCount === 1 || r.id === r.normalizedKey)
      : analyzed;

    const issues = generatePriorityIssues(baseCohort, priorityWeights);
    setPriorityIssues(issues);

    // 4. Recommendation generation pass
    const recs = generateRecommendations(issues);
    setRecommendations(recs);

    setIsLoading(false);
    showToast(`Loaded ${records.length.toLocaleString()} feedback records (${dedupResult.summary.normalizedUniqueCount} unique)`);
  };

  // Helper to compute SHA-256 in browser
  const computeSha256 = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Load Initial Dataset from data/original/
  const loadDemoDataset = async () => {
    try {
      setIsLoading(true);
      setLoadingProgress({ processed: 0, total: 0, stage: 'Checking data/original dataset...' });
      let resp = await fetch('/data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv');
      if (!resp.ok) {
        resp = await fetch('/data/BuildBattle_2026_Customer_Feedback_Dataset.csv');
      }
      if (!resp.ok) {
        throw new Error(`File not found: ${resp.statusText}`);
      }
      const csvText = await resp.text();
      const sha256Hex = await computeSha256(csvText);
      const parsed = parseAndValidateCsv(csvText);
      await ingestDataset(parsed.records, 'BuildBattle_2026_Customer_Feedback_Dataset.csv', sha256Hex);
    } catch {
      setIsLoading(false);
      setDatasetSha256(null);
    }
  };

  // Initial mount load
  useEffect(() => {
    loadDemoDataset();
  }, []);

  // Upload user CSV
  const uploadCsvData = async (csvContent: string, fileName = 'custom_feedback.csv') => {
    const parsed = parseAndValidateCsv(csvContent);
    if (!parsed.isValid) {
      if (parsed.headers.length > 0 && !parsed.mappedReviewColumn) {
        setColumnMappingState({
          isOpen: true,
          rawCsv: csvContent,
          fileName,
          headers: parsed.headers,
          previewRows: parsed.previewRows
        });
        return;
      }
      showToast(parsed.errors[0] || 'Invalid CSV format.');
      return;
    }
    const sha256Hex = await computeSha256(csvContent);
    await ingestDataset(parsed.records, fileName, sha256Hex);
  };

  const confirmColumnMapping = async (reviewCol: string, categoryCol: string) => {
    if (!columnMappingState) return;
    const parsed = parseAndValidateCsv(columnMappingState.rawCsv, { reviewCol, categoryCol });
    if (parsed.isValid) {
      const sha256Hex = await computeSha256(columnMappingState.rawCsv);
      await ingestDataset(parsed.records, columnMappingState.fileName, sha256Hex);
      showToast(`Successfully mapped columns and ingested ${parsed.records.length} records.`);
    } else {
      showToast(parsed.errors[0] || 'Mapping failed to yield valid review rows.');
    }
    setColumnMappingState(null);
  };

  const cancelColumnMapping = () => {
    setColumnMappingState(null);
  };

  // Manual Feedback creation
  const addManualFeedback = (review: string, category: string) => {
    const newRaw: RawFeedbackRecord = {
      id: `manual-${Date.now()}`,
      review,
      category
    };

    const newAnalyzed = analyzeSingleRecord(newRaw, false, 1);
    setRawRecords(prev => [newRaw, ...prev]);
    setAllAnalyzedRecords(prev => [newAnalyzed, ...prev]);

    // Re-run priority and recommendation updates
    setPriorityIssues(() => generatePriorityIssues([newAnalyzed, ...allAnalyzedRecords], priorityWeights));
    showToast('Feedback added and analyzed successfully.');
  };

  // Update Priority Weights
  const updatePriorityWeights = (weights: PriorityWeights) => {
    setPriorityWeights(weights);
    const issues = generatePriorityIssues(allAnalyzedRecords, weights);
    setPriorityIssues(issues);
    showToast('Priority scoring weights updated.');
  };

  // Update Priority Issue Status
  const updateIssueStatus = (issueId: string, status: PriorityIssue['status']) => {
    setPriorityIssues(prev =>
      prev.map(iss => iss.id === issueId ? { ...iss, status, updatedAt: new Date().toISOString() } : iss)
    );
    showToast(`Issue status updated to ${status}.`);
  };

  // Recommendations management
  const updateRecommendationStatus = (id: string, status: Recommendation['status']) => {
    setRecommendations(prev =>
      prev.map(r => r.id === id ? { ...r, status } : r)
    );
    showToast(`Recommendation marked as ${status}.`);
  };

  const convertRecommendationToIssue = (recId: string) => {
    const rec = recommendations.find(r => r.id === recId);
    if (!rec) return;

    createTrackedIssue(
      rec.title,
      `${rec.problem}\n\nRecommended Action:\n${rec.recommendedAction}\n\nExpected Outcome:\n${rec.expectedOutcome}`,
      rec.priority,
      'Unassigned',
      rec.suggestedTeam,
      rec.relatedFeedbackIds
    );

    updateRecommendationStatus(recId, 'converted_to_issue');
    showToast('Converted recommendation into tracked issue.');
  };

  // Tracked Issues
  const createTrackedIssue = (
    title: string,
    description: string,
    priority: PriorityIssue['priorityLevel'],
    owner: string,
    team: string,
    linkedFeedbackIds: string[] = []
  ) => {
    const now = new Date().toISOString();
    const newIssue: TrackedIssue = {
      id: `iss-${Date.now().toString(36)}`,
      title,
      description,
      priority,
      status: 'Open',
      owner: owner || 'Unassigned',
      team: team || 'Product',
      linkedFeedbackCount: linkedFeedbackIds.length,
      linkedFeedbackIds,
      notes: [],
      activityLog: [
        {
          id: `act-${Date.now()}`,
          action: 'Created issue from insight triage',
          timestamp: now,
          author: 'Product Manager'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    setTrackedIssues(prev => [newIssue, ...prev]);
  };

  const updateTrackedIssueStatus = (id: string, status: IssueStatus) => {
    const now = new Date().toISOString();
    setTrackedIssues(prev =>
      prev.map(iss => {
        if (iss.id !== id) return iss;
        return {
          ...iss,
          status,
          updatedAt: now,
          activityLog: [
            ...iss.activityLog,
            {
              id: `act-${Date.now()}`,
              action: `Changed status to ${status}`,
              timestamp: now,
              author: 'Current User'
            }
          ]
        };
      })
    );
    showToast(`Tracked issue moved to ${status}.`);
  };

  const addIssueNote = (issueId: string, noteText: string, author = 'Team Member') => {
    const now = new Date().toISOString();
    setTrackedIssues(prev =>
      prev.map(iss => {
        if (iss.id !== issueId) return iss;
        return {
          ...iss,
          updatedAt: now,
          notes: [
            ...iss.notes,
            {
              id: `note-${Date.now()}`,
              author,
              text: noteText,
              createdAt: now
            }
          ]
        };
      })
    );
    showToast('Note added to issue.');
  };

  // Real Adaption Handlers: Prepared | Handed off | Imported
  const importAdaptedData = (
    data: Array<{ review?: string; sentiment?: string; topic?: string; completion?: string }>,
    isFixture: boolean = false,
    label?: string
  ) => {
    if (!data || data.length === 0) {
      showToast('No records found in imported file.');
      return;
    }
    const metrics = computeImportedComparison(allAnalyzedRecords, data, isFixture, label);
    setImportedComparison(metrics);
    setWorkflowState('imported');
    showToast(`Imported ${data.length} adapted records. Computed ${metrics.labelAgreementPercentage}% label agreement.`);
  };

  const loadTestFixtureComparison = () => {
    const fixture = generateTestFixture(allAnalyzedRecords);
    importAdaptedData(fixture.data, true, fixture.fixtureLabel);
  };

  const clearComparison = () => {
    setImportedComparison(null);
    setWorkflowState('prepared');
    showToast('Adaption comparison reset.');
  };

  // Filter Reset
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSentiment('All');
    setSelectedTopic('All');
    setShowDuplicatesOnly(false);
  };

  // Quick Drilldowns
  const drilldownTopic = (topic: TopicType) => {
    resetFilters();
    setSelectedTopic(topic);
    setCurrentTab('explorer');
  };

  const drilldownCategory = (cat: string) => {
    resetFilters();
    setSelectedCategory(cat);
    setCurrentTab('explorer');
  };

  const drilldownSentiment = (sentiment: SentimentType) => {
    resetFilters();
    setSelectedSentiment(sentiment);
    setCurrentTab('explorer');
  };

  // Active records calculation
  const activeRecords = useMemo(() => {
    let pool = allAnalyzedRecords;

    // Deduplication policy filter
    if (countingPolicy === 'deduplicated') {
      const seenKeys = new Set<string>();
      pool = pool.filter(r => {
        if (seenKeys.has(r.normalizedKey)) return false;
        seenKeys.add(r.normalizedKey);
        return true;
      });
    }

    if (showDuplicatesOnly) {
      pool = pool.filter(r => r.isDuplicate);
    }

    if (selectedCategory !== 'All') {
      pool = pool.filter(r => r.sourceCategory === selectedCategory);
    }

    if (selectedSentiment !== 'All') {
      pool = pool.filter(r => r.sentiment === selectedSentiment);
    }

    if (selectedTopic !== 'All') {
      pool = pool.filter(r => r.topic === selectedTopic);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      pool = pool.filter(
        r =>
          r.review.toLowerCase().includes(q) ||
          r.summary.toLowerCase().includes(q) ||
          r.sourceCategory.toLowerCase().includes(q) ||
          r.topic.toLowerCase().includes(q)
      );
    }

    return pool;
  }, [
    allAnalyzedRecords,
    countingPolicy,
    showDuplicatesOnly,
    selectedCategory,
    selectedSentiment,
    selectedTopic,
    searchQuery
  ]);

  // Dataset Stats derivation
  const datasetStats: DatasetStats = useMemo(() => {
    const total = activeRecords.length;
    const catCounts: Record<string, number> = {};
    const sentCounts: Record<SentimentType, number> = { positive: 0, neutral: 0, negative: 0 };
    const topCounts: Record<TopicType, number> = {
      'Product quality and features': 0,
      'Customer support': 0,
      'Delivery and fulfillment': 0,
      'Website and ordering': 0,
      'Fraud and suspicious transactions': 0,
      'Refunds and payments': 0,
      'Other or unclassified': 0
    };

    let confSum = 0;
    let highPrioCount = 0;
    const uniqueKeys = new Set<string>();

    activeRecords.forEach(r => {
      uniqueKeys.add(r.normalizedKey);
      catCounts[r.sourceCategory] = (catCounts[r.sourceCategory] || 0) + 1;
      sentCounts[r.sentiment] = (sentCounts[r.sentiment] || 0) + 1;
      topCounts[r.topic] = (topCounts[r.topic] || 0) + 1;
      confSum += r.confidence;
      if (r.urgency === 'Critical' || r.urgency === 'High') {
        highPrioCount++;
      }
    });

    const uniqueCount = uniqueKeys.size;
    const dupsRemoved = total - uniqueCount;

    return {
      totalRecords: total,
      uniqueRecords: uniqueCount,
      duplicatesRemoved: dupsRemoved,
      duplicatePercentage: total > 0 ? Math.round((dupsRemoved / total) * 100) : 0,
      categoriesCount: catCounts,
      sentimentCounts: sentCounts,
      topicCounts: topCounts,
      averageConfidence: total > 0 ? Math.round((confSum / total) * 100) / 100 : 0,
      highPriorityCount: highPrioCount,
      missingValuesDetected: 0
    };
  }, [activeRecords]);

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        isDarkMode,
        toggleDarkMode,
        datasetName,
        datasetSha256,
        isLoading,
        loadingProgress,
        rawRecords,
        allAnalyzedRecords,
        deduplicationSummary,
        countingPolicy,
        setCountingPolicy,
        uploadCsvData,
        columnMappingState,
        confirmColumnMapping,
        cancelColumnMapping,
        addManualFeedback,
        loadDemoDataset,
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
        activeRecords,
        datasetStats,
        priorityIssues,
        priorityWeights,
        updatePriorityWeights,
        updateIssueStatus,
        recommendations,
        updateRecommendationStatus,
        convertRecommendationToIssue,
        trackedIssues,
        createTrackedIssue,
        updateTrackedIssueStatus,
        addIssueNote,
        adaptionColumnMapping,
        setAdaptionColumnMapping,
        adaptionRecipes,
        setAdaptionRecipes,
        workflowState,
        setWorkflowState,
        importedComparison,
        importAdaptedData,
        loadTestFixtureComparison,
        clearComparison,
        drilldownTopic,
        drilldownCategory,
        drilldownSentiment,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
