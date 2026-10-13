import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Download,
  ExternalLink,
  Upload,
  FileText,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Layers,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  buildInstructionDataset,
  exportToAdaptionJsonl
} from '../../services/adaptionService';
import Papa from 'papaparse';

export const AdaptionTab: React.FC = () => {
  const {
    allAnalyzedRecords,
    datasetSha256,
    deduplicationSummary,
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
    showToast
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTab, setSelectedTab] = useState<'prepared' | 'handoff' | 'comparison'>('prepared');

  // Filter to authentic unique records only
  const uniqueAnalyzedRecords = React.useMemo(() => {
    return allAnalyzedRecords.filter(r => !r.isDuplicate);
  }, [allAnalyzedRecords]);

  // Build instruction rows from active unique records
  const instructionRows = React.useMemo(() => {
    return buildInstructionDataset(uniqueAnalyzedRecords, adaptionColumnMapping.universalPromptText);
  }, [uniqueAnalyzedRecords, adaptionColumnMapping.universalPromptText]);

  // Export JSONL containing only real unique reviews with strict line validation
  const handleDownloadJsonl = () => {
    if (uniqueAnalyzedRecords.length === 0) {
      showToast('No unique records available to export.');
      return;
    }
    const jsonlContent = exportToAdaptionJsonl(instructionRows);
    const lines = jsonlContent.trim().split('\n');

    // Validate every line parses as JSON
    for (let i = 0; i < lines.length; i++) {
      try {
        JSON.parse(lines[i]);
      } catch {
        showToast(`Export validation failed: line ${i + 1} is not valid JSON.`);
        return;
      }
    }

    // Validate line count equals unique records count
    if (lines.length !== uniqueAnalyzedRecords.length) {
      showToast(`Export validation failed: ${lines.length} lines vs ${uniqueAnalyzedRecords.length} unique records.`);
      return;
    }

    const blob = new Blob([jsonlContent], { type: 'application/x-jsonlines;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `adaption_instruction_dataset_unique_${Date.now()}.jsonl`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${lines.length} verified unique instruction rows as JSONL.`);
  };

  // Handle file import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.jsonl')) {
        const lines = content.split('\n').filter(l => l.trim().length > 0);
        const parsed = lines.map(line => {
          try {
            return JSON.parse(line) as { review?: string; sentiment?: string; topic?: string; completion?: string };
          } catch {
            return null;
          }
        }).filter((item): item is { review?: string; sentiment?: string; topic?: string; completion?: string } => Boolean(item));
        importAdaptedData(parsed, false, file.name);
      } else if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          const arr = (Array.isArray(parsed) ? parsed : [parsed]) as Array<{ review?: string; sentiment?: string; topic?: string; completion?: string }>;
          importAdaptedData(arr, false, file.name);
        } catch {
          showToast('Invalid JSON file.');
        }
      } else {
        // Parse CSV
        Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            importAdaptedData(results.data as Array<{ review?: string; sentiment?: string; topic?: string; completion?: string }>, false, file.name);
          },
          error: () => {
            showToast('Failed to parse CSV file.');
          }
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Title & Vision */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Adaptive Data Optimization Studio
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Adaption Labs Integration
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Documented Adaptive Data Workflow: Prepare Instruction Dataset → Handoff to Adaption → Import Genuine Adapted Result
          </p>
        </div>

        {/* Workflow State Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => { setWorkflowState('prepared'); setSelectedTab('prepared'); }}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              workflowState === 'prepared'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            1. Prepared
          </button>
          <button
            onClick={() => { setWorkflowState('handed_off'); setSelectedTab('handoff'); }}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              workflowState === 'handed_off'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            2. Handed Off
          </button>
          <button
            onClick={() => { setWorkflowState('imported'); setSelectedTab('comparison'); }}
            className={`px-3 py-1.5 rounded font-medium transition-colors ${
              workflowState === 'imported'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            3. Imported & Compared
          </button>
        </div>
      </div>

      {/* Protocol Compliance Banner */}
      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-900 dark:text-white">Honest Integration Guarantee: </span>
          In accordance with the Anti-Hallucination Protocol, Adaption quality scores (0–10) and domain percentiles are only reported when returned by a live platform API run. No artificial progress bars or mock scores are generated. Before-and-after comparison metrics are strictly computed from imported files.
        </div>
      </div>

      {/* Data Provenance & Cryptographic Checksum Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Data Provenance & Cryptographic Integrity
            </span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Source: <span className="font-semibold text-slate-700 dark:text-slate-300">data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">Total Raw Rows</div>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {deduplicationSummary?.rawCount.toLocaleString() ?? '0'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">Exact Unique</div>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {deduplicationSummary?.exactUniqueCount.toLocaleString() ?? '0'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">Normalized Unique</div>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {deduplicationSummary?.normalizedUniqueCount.toLocaleString() ?? '0'}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="text-[11px] text-slate-500">Unique Export Rows</div>
            <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
              {uniqueAnalyzedRecords.length.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            SHA-256 Checksum:
          </span>
          <div className="font-mono text-[11px] text-slate-600 dark:text-slate-300 select-all break-all sm:text-right">
            {datasetSha256 ? (
              <span className="bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                {datasetSha256}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                UNVERIFIED — File data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv not yet placed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Config, Right Workflow Views */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Column Mapping & Recipe Specification */}
        <div className="space-y-4">
          {/* Card: Column Roles */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>1. Column Role Mapping</span>
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">docs.adaptionlabs.ai</span>
            </div>
            <p className="text-xs text-slate-500">
              Assigned per the documented Adaptive Data walkthrough schema:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-700 dark:text-slate-200">Prompt Role:</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Universal instruction prompt</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-700 dark:text-slate-200">Context Roles:</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">review, category</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="font-semibold text-slate-700 dark:text-slate-200">Completion Role:</div>
                <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">structured sentiment & topic triage</div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Universal Instruction Text
              </label>
              <textarea
                value={adaptionColumnMapping.universalPromptText}
                onChange={(e) =>
                  setAdaptionColumnMapping({
                    ...adaptionColumnMapping,
                    universalPromptText: e.target.value
                  })
                }
                rows={3}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          {/* Card: Verified Recipes */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-500" />
                <span>2. Verified Recipes</span>
              </h2>
              <span className="text-[11px] text-slate-400">Official options</span>
            </div>
            <p className="text-xs text-slate-500">
              Configure recipe toggles matching the official Adaption platform options:
            </p>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Prompt Deduplication</div>
                  <div className="text-[11px] text-slate-500">Removes repeated prompts from training</div>
                </div>
                <input
                  type="checkbox"
                  checked={adaptionRecipes.promptDeduplication}
                  onChange={(e) =>
                    setAdaptionRecipes({ ...adaptionRecipes, promptDeduplication: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Prompt Rephrasing</div>
                  <div className="text-[11px] text-slate-500">Rewrites prompts for clarity and alignment</div>
                </div>
                <input
                  type="checkbox"
                  checked={adaptionRecipes.promptRephrasing}
                  onChange={(e) =>
                    setAdaptionRecipes({ ...adaptionRecipes, promptRephrasing: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Reasoning Traces</div>
                  <div className="text-[11px] text-slate-500">Adds step-by-step reasoning traces</div>
                </div>
                <input
                  type="checkbox"
                  checked={adaptionRecipes.reasoningTraces}
                  onChange={(e) =>
                    setAdaptionRecipes({ ...adaptionRecipes, reasoningTraces: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Hallucination Mitigation</div>
                  <div className="text-[11px] text-slate-500">Grounds completions in provided context</div>
                </div>
                <input
                  type="checkbox"
                  checked={adaptionRecipes.hallucinationMitigation}
                  onChange={(e) =>
                    setAdaptionRecipes({ ...adaptionRecipes, hallucinationMitigation: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">Freeform Brand Voice</div>
                  <div className="text-[11px] text-slate-500">Steers personality and enterprise tone</div>
                </div>
                <input
                  type="checkbox"
                  checked={adaptionRecipes.brandVoice}
                  onChange={(e) =>
                    setAdaptionRecipes({ ...adaptionRecipes, brandVoice: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Columns: Main Workflow Panels */}
        <div className="lg:col-span-2 space-y-4">
          {/* Navigation Bar between views */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setSelectedTab('prepared')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                selectedTab === 'prepared'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Step 1: Prepared Instruction Dataset ({instructionRows.length.toLocaleString()} rows)
            </button>
            <button
              onClick={() => setSelectedTab('handoff')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                selectedTab === 'handoff'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Step 2: Platform Handoff & Instructions
            </button>
            <button
              onClick={() => setSelectedTab('comparison')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
                selectedTab === 'comparison'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Step 3: Genuine Comparison {importedComparison ? '(Computed)' : '(Awaiting Import)'}
            </button>
          </div>

          {/* TAB 1: PREPARED DATASET */}
          {selectedTab === 'prepared' && (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Prepared Instruction Dataset
                  </h3>
                  <p className="text-xs text-slate-500">
                    Each row formatted with prompt, context, and completion for supervised fine-tuning
                  </p>
                </div>
                <button
                  onClick={handleDownloadJsonl}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSONL</span>
                </button>
              </div>

              {/* Quality Score Transparency */}
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold">Evaluation Status: </span>
                <span className="font-mono">UNVERIFIED (Requires Adaption platform run)</span>
                <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                  Per the anti-hallucination protocol, quality scores (0-10) and domain percentiles are not fabricated locally. They will be displayed when an evaluation report is returned by the Adaption platform.
                </p>
              </div>

              {/* Sample Inspection */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Instruction Row Preview (Showing first 2 of {instructionRows.length.toLocaleString()})
                </div>
                {instructionRows.slice(0, 2).map((row, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase text-[10px]">
                        Role: Prompt
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] mt-0.5">
                        {row.instruction}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                        Role: Context
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] mt-0.5 whitespace-pre-wrap">
                        {row.context}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">
                        Role: Completion
                      </span>
                      <pre className="text-slate-700 dark:text-slate-300 font-mono text-[10px] mt-0.5 bg-slate-100 dark:bg-slate-900 p-2 rounded overflow-x-auto">
                        {row.originalCompletion}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PLATFORM HANDOFF */}
          {selectedTab === 'handoff' && (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Adaption Platform Handoff Protocol
                </h3>
                <p className="text-xs text-slate-500">
                  Follow the official workflow documented at docs.adaptionlabs.ai/tutorials/adaptive-data-app-walkthrough
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-3">
                <div className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase tracking-wider">
                  Official Application Portal
                </div>
                <p className="text-xs text-purple-800 dark:text-purple-300">
                  Launch the Adaption platform in your browser to run the adaptation pipeline on your prepared JSONL dataset:
                </p>
                <a
                  href="https://adaptionlabs.ai/app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <span>Open Adaption Studio (adaptionlabs.ai/app)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Step-by-Step Instructions:
                </div>
                <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-decimal list-inside">
                  <li>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Step 1 — Download:</span> Use the &quot;Download JSONL&quot; button in Step 1 to save the prepared dataset to your computer.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Step 2 — Import:</span> In the Adaption App, click &quot;Create a dataset&quot; and select &quot;Local file&quot; to upload the JSONL.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Step 3 — Column Roles:</span> Map the <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">prompt</code>, <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">context</code>, and <code className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">completion</code> roles.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Step 4 — Select Recipes:</span> Choose Prompt Deduplication, Reasoning Traces, and Hallucination Mitigation.
                  </li>
                  <li>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Step 5 — Download Results:</span> Once the job is completed on Adaption, export the adapted dataset and import it below into Step 3.
                  </li>
                </ol>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setWorkflowState('handed_off');
                    showToast('Workflow marked as Handed Off.');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Mark as Handed Off
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: IMPORTED COMPARISON */}
          {selectedTab === 'comparison' && (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-subtle space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Import Genuine Adapted Result & Compare
                  </h3>
                  <p className="text-xs text-slate-500">
                    Calculates exact label agreement, label changes, and row count differences
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".jsonl,.json,.csv"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition-colors shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Adapted File</span>
                  </button>
                  <button
                    onClick={loadTestFixtureComparison}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-sm"
                    title="Load verified test fixture for auditing"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load TEST FIXTURE</span>
                  </button>
                </div>
              </div>

              {/* Comparison Output */}
              {importedComparison ? (
                <div className="space-y-4">
                  {/* Fixture Badge */}
                  {importedComparison.isFixture && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between">
                      <span>Label: {importedComparison.fixtureLabel}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                        AUDIT VERIFIED FIXTURE
                      </span>
                    </div>
                  )}

                  {/* Computed Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500 font-semibold uppercase">Original Rows</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {importedComparison.originalRowsCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500 font-semibold uppercase">Imported Rows</div>
                      <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        {importedComparison.importedRowsCount.toLocaleString()}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500 font-semibold uppercase">Label Agreement</div>
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {importedComparison.labelAgreementPercentage}%
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[11px] text-slate-500 font-semibold uppercase">Changed Labels</div>
                      <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                        {importedComparison.changedLabelsCount}
                      </div>
                    </div>
                  </div>

                  {/* Real Diff Table */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Side-by-Side Label Diff (Showing {importedComparison.diffSamples.length} samples)
                    </div>
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                          <tr>
                            <th className="px-3 py-2">Customer Review</th>
                            <th className="px-3 py-2">Original Sentiment</th>
                            <th className="px-3 py-2">Adapted Sentiment</th>
                            <th className="px-3 py-2">Original Topic</th>
                            <th className="px-3 py-2">Adapted Topic</th>
                            <th className="px-3 py-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                          {importedComparison.diffSamples.map((sample, idx) => (
                            <tr key={idx} className={sample.changed ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}>
                              <td className="px-3 py-2 max-w-xs truncate" title={sample.review}>
                                {sample.review}
                              </td>
                              <td className="px-3 py-2 font-mono">{sample.originalSentiment}</td>
                              <td className="px-3 py-2 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                                {sample.adaptedSentiment}
                              </td>
                              <td className="px-3 py-2">{sample.originalTopic}</td>
                              <td className="px-3 py-2 font-semibold text-purple-600 dark:text-purple-400">
                                {sample.adaptedTopic}
                              </td>
                              <td className="px-3 py-2">
                                {sample.changed ? (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-semibold">
                                    Changed
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                    Identical
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={clearComparison}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Comparison</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center space-y-3">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No Adapted Dataset Imported Yet
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Upload an adapted JSONL or CSV file downloaded from Adaption Labs, or click &quot;Load TEST FIXTURE&quot; to test the real mathematical comparison pipeline with verified fixture data.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
