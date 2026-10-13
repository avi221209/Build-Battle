export interface AdaptionColumnMapping {
  promptColumn: string;
  contextColumns: string[];
  completionColumn: string;
  chatHistoryColumn?: string;
  universalPromptText: string;
  generateMissingCompletion: boolean;
}

export type AdaptionWorkflowState = 'prepared' | 'handed_off' | 'imported';

export interface AdaptionRecipeSelection {
  promptDeduplication: boolean;     // Removes duplicate prompt records
  promptRephrasing: boolean;        // Rewrites prompts for task alignment
  reasoningTraces: boolean;         // Adds step-by-step reasoning traces
  hallucinationMitigation: boolean; // Verification against context
  brandVoice: boolean;              // Steers tone toward enterprise standards
  blueprintEnabled: boolean;
  blueprintSystemPrompt: string;
  blueprintLength: 'Concise' | 'Minimal' | 'Detailed' | 'Extensive';
  blueprintSafetyCategories: string[];
}

export interface InstructionRow {
  id: string;
  instruction: string;
  context: string;
  originalReview: string;
  sourceCategory: string;
  originalCompletion: string;
  adaptedCompletion?: string;
  reasoningTrace?: string;
}

export interface ImportedComparisonMetrics {
  originalRowsCount: number;
  importedRowsCount: number;
  rowDiff: number;
  labelAgreementPercentage: number;
  changedLabelsCount: number;
  unchangedLabelsCount: number;
  isFixture: boolean;
  fixtureLabel?: string;
  diffSamples: {
    review: string;
    originalSentiment: string;
    adaptedSentiment: string;
    originalTopic: string;
    adaptedTopic: string;
    changed: boolean;
  }[];
}

export interface AdaptionRunRecord {
  id: string;
  runName: string;
  timestamp: string;
  sourceRowsCount: number;
  adaptedRowsCount: number;
  workflowState: AdaptionWorkflowState;
  recipeConfig: AdaptionRecipeSelection;
  comparisonMetrics?: ImportedComparisonMetrics;
  instructionRowsSample: InstructionRow[];
}
