# InsightFlow — Forensic Claims Ledger

This claims ledger documents all technical, architectural, operational, and numerical claims across the InsightFlow codebase, matching the strict **Anti-Hallucination Protocol**:
- **Evidence before claims**: Every verified claim includes exact file line references or pasted terminal command output.
- **Status classifications**: `Verified` | `Unverified` | `Removed`.

| # | Claim | Source (file:line or command output) | Status | Notes & Verification Evidence |
|---|---|---|---|---|
| 1 | Original dataset is at `data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv` | `src/__tests__/provenance.test.ts:10-25` | **Unverified** | File is absent on local disk (`Test-Path` returned `False`). Script-generated duplicates were deleted. Awaiting user placement. |
| 2 | Previous synthetic dataset generation script (`generate_dataset.py`) deleted | Git status & directory listing (`generate_dataset.py` removed) | **Verified** | Deleted to prevent synthetic data masquerading as genuine feedback. |
| 3 | Exact & normalized deduplication distinguishes punctuation and case differences | `src/services/deduplication.ts:32-117`, `src/__tests__/deduplication.test.ts:25-50` | **Verified** | Tested in vitest: `normalizeReviewText` trims, lowercases, and strips punctuation. Singletons, low, medium, and high repetition distributions are computed. |
| 4 | Deduplication KPIs respond dynamically to mutation (not hardcoded) | `src/__tests__/provenance.test.ts:29-65` | **Verified** | Mutation test duplicating 50 rows empirically verified that `rawCount` changed from 100 to 150, `duplicatesRemoved` from 0 to 50, and percentage to 33.3%. |
| 5 | Hardcoded fake score "6.8" removed | `src/types/adaption.ts`, `src/components/adaption/AdaptionTab.tsx` | **Removed** | All references to hardcoded "6.8" baseline score removed from types and UI. |
| 6 | Hardcoded fake score "9.6" removed | `src/types/adaption.ts`, `src/components/adaption/AdaptionTab.tsx` | **Removed** | All references to hardcoded "9.6" adapted score removed from types and UI. |
| 7 | Hardcoded percentile "94th" removed | `src/types/adaption.ts`, `src/components/adaption/AdaptionTab.tsx` | **Removed** | Removed fabricated benchmark percentile claim. |
| 8 | Hardcoded percentile "42nd" removed | `src/types/adaption.ts`, `src/components/adaption/AdaptionTab.tsx` | **Removed** | Removed fabricated benchmark percentile claim. |
| 9 | Hardcoded rate "48.2%" removed | `src/types/adaption.ts`, `src/components/adaption/AdaptionTab.tsx` | **Removed** | Removed fabricated metric claim. |
| 10 | Hardcoded rate "98.4%" removed | `src/types/adaption.ts`, `src/components/adaption/AdaptionTab.tsx` | **Removed** | Removed fabricated metric claim. |
| 11 | Hardcoded grade "A+" removed | `src/types/adaption.ts`, `src/components/adaption/AdaptionTab.tsx` | **Removed** | Fabricated qualitative grade badge removed. |
| 12 | Hardcoded grade "C+" removed | `src/types/adaption.ts`, `src/components/adaption/AdaptionTab.tsx` | **Removed** | Fabricated qualitative grade badge removed. |
| 13 | Hardcoded string "6,680" removed | `src/components/overview/DeduplicationBanner.tsx:28` | **Removed** | Replaced with dynamic computed metric `{deduplicationSummary.normalizedDuplicatesRemoved.toLocaleString()}`. |
| 14 | Hardcoded string "320" removed | `src/components/layout/Sidebar.tsx:128` | **Removed** | Replaced with dynamic computed metric `{datasetStats.uniqueRecords.toLocaleString()}`. |
| 15 | Hardcoded score "95.4" removed | `src/services/adaptionService.ts` | **Removed** | All static quality score simulations removed. |
| 16 | `setTimeout`-based live simulation of Adaption training removed | `src/services/adaptionService.ts:1-197` | **Removed** | Deleted artificial training progress bar and mock simulation loops. |
| 17 | Adaption official web portal URL is `https://adaptionlabs.ai/app` | `https://docs.adaptionlabs.ai/tutorials/adaptive-data-app-walkthrough/index.md` | **Verified** | Verified directly via live HTTP documentation fetch. |
| 18 | Adaption official REST API endpoints verified | `https://docs.adaptionlabs.ai/api/index.md` | **Verified** | Endpoints verified: `POST /api/v1/datasets`, `POST /api/v1/datasets/{dataset_id}/adapt`, `GET /api/v1/datasets/{dataset_id}/get_evaluation`. |
| 19 | Adaption recipes verified | `https://docs.adaptionlabs.ai/tutorials/adaptive-data-app-walkthrough/index.md` | **Verified** | Real verified recipes: `prompt_rephrase`, `deduplication`, `reasoning_traces`, `hallucination_mitigation`, `freeform_brand_voice`. |
| 20 | Adaption workflow states in UI are Prepared \| Handed off \| Imported | `src/types/adaption.ts:3-10`, `src/components/adaption/AdaptionTab.tsx:32-60` | **Verified** | "Completed" is only entered after importing a genuine adapted file and computing differences. |
| 21 | Before/after comparison computes real metrics from imported data | `src/services/adaptionService.ts:85-161`, `src/__tests__/adaptionService.test.ts:45-86` | **Verified** | Computes exact `labelAgreementPercentage`, `changedLabelsCount`, and `rowDiff`. Tested in vitest. |
| 22 | Comparison test fixture clearly labelled TEST FIXTURE | `src/services/adaptionService.ts:167-196`, `src/__tests__/adaptionService.test.ts:89-112` | **Verified** | Explicit label: `TEST FIXTURE (Synthetic Verification Sample - 20 records)`. |
| 23 | Priority formula labeled as "heuristic, configurable, not validated" | `src/components/priority/PriorityTab.tsx:64-72`, `src/components/walkthrough/WalkthroughModal.tsx:142` | **Verified** | Explicit disclaimer visible on UI with configurable weights and toggles. |
| 24 | Priority 1.35x multiplier documented as an assumption | `src/services/priorityEngine.ts:10, 42-58`, `src/components/priority/PriorityTab.tsx:135` | **Verified** | Documented in code and UI as a domain-heuristic assumption for security/fraud risk. |
| 25 | Analysis engine sentiment classification uses whole-word boundaries | `src/services/analysisEngine.ts:50-67`, `src/__tests__/analysisEngine.test.ts:1-60` | **Verified** | Prevents substring collision (e.g., `unresponsive` no longer collides with `responsive`). |
| 26 | Analysis engine golden test cases pass | `src/__tests__/analysisEngine.test.ts:6-59` | **Verified** | Verified 4/4 passing tests covering positive website, mixed with positive resolution, fraud with critical urgency, and unresponsive customer service. |
| 27 | Analysis method clearly labeled "rule-based" in UI | `src/services/analysisEngine.ts:202`, `src/components/explorer/FeedbackDetailDrawer.tsx:125` | **Verified** | Labeled as `deterministic_lexicon` / "Rule-based Lexicon" in drawer and reports. No false LLM claims. |
| 28 | Unused dependency `canvas-confetti` removed | Terminal: `npm uninstall canvas-confetti @types/canvas-confetti` | **Verified** | Confirmed zero imports in `src/` and uninstalled. |
| 29 | Unused dependency `jspdf` removed | Terminal: `npm uninstall jspdf` | **Verified** | Confirmed zero imports in `src/` and uninstalled. |
| 30 | Unused dependency `clsx` removed | Terminal: `npm uninstall clsx` | **Verified** | Confirmed zero imports in `src/` and uninstalled. |
| 31 | Unused dependency `tailwind-merge` removed | Terminal: `npm uninstall tailwind-merge` | **Verified** | Confirmed zero imports in `src/` and uninstalled. |
| 32 | TypeScript compilation in strict mode with zero errors | Terminal: `npx tsc --noEmit` -> exit code 0 | **Verified** | Strict mode enabled in `tsconfig.app.json`. Zero errors. |
| 33 | Zero `any` casts in application source | Terminal: grep for `: any` and `as any` returned 0 hits | **Verified** | Replaced with strict types and type guards across components and contexts. |
| 34 | Vitest unit test suite passes with code coverage | Terminal: `npm run test:coverage` -> 29 passed (6 test files) | **Verified** | Overall Suite: 91.33% Lines, 80.28% Branch, 100% Funcs. `analysisEngine.ts`: 96.52% Lines, `recommendationEngine.ts`: 100% Lines. |
| 35 | Production build succeeds | Terminal: `npm run build` -> exit code 0 in 1.70s | **Verified** | Dist bundle: `index.html` (1.11 kB), `index.css` (44.48 kB), `index.js` (810.79 kB). |
| 36 | Local HTTP server serves application with status 200 OK | `Invoke-WebRequest -Uri "http://127.0.0.1:5173/"` -> `StatusCode: 200 OK` | **Verified** | Verified runtime HTTP response on localhost port 5173. |
| 37 | Adaption JSONL & Reports CSV exports contain only verified unique reviews | `src/components/adaption/AdaptionTab.tsx:43-85`, `src/components/reports/ReportsTab.tsx:45-68`, `src/__tests__/adaptionService.test.ts:48-75` | **Verified** | Validates JSON parse on every line and enforces exported row count equals unique record count. |
| 38 | Purged hardcoded counts "7,000", "6,680", and "320" from walkthrough and reports | `src/components/modals/WalkthroughModal.tsx:30-85`, `src/components/reports/ReportsTab.tsx:180-186` | **Verified** | Replaced with reactive state expressions (`datasetStats.totalRecords`, `uniqueRecords`, `normalizedDuplicatesRemoved`). Grep for `7,000`, `6,680`, `320`, `7000` returns 0 hits in `src/`. |
| 39 | Dataset SHA-256 displayed on Data page (Feedback Explorer) | `src/components/explorer/FeedbackExplorerTab.tsx:36-41` | **Verified** | Dataset SHA-256 displayed in explorer header badge alongside DeduplicationBanner, AdaptionTab, and ReportsTab. |
| 40 | Headless browser testing re-executed and failed with driver 404 error | `browser_subagent` terminal output | **Verified (Failed)** | Playwright driver binary returned 404 from Azure CDN. Automated testing replaced with 20-step `MANUAL_TEST_CHECKLIST.md`. UI claims marked `NOT CLICK-TESTED`. |

---

## Forensic Audit Summary

### 1. Verified (with exact commands)
- **Unit Testing & Coverage**: `npm run test:coverage` passes 29/29 tests across 6 suites in 571ms with **91.33% Lines** and **100% Funcs** (`analysisEngine.ts`: **96.52% Lines**, `recommendationEngine.ts`: **100% Lines**).
- **TypeScript Strict Mode**: `npx tsc --noEmit` exited with code 0 (zero errors, zero `any` types).
- **Production Build**: `npm run build` completed with code 0 in 2.32s (`dist/assets/index-SlNKXQI6.js` 811.82 kB).
- **Static Code Analysis**: `npm run lint` (oxlint) exited with code 0 (0 errors).
- **Purge of Stale Figures**: Grep for `7,000`, `6,680`, `320`, `7000`, `6.8`, `9.6`, `94th`, `42nd`, `48.2%`, `98.4%`, `Grade A+`, `Grade C+` returns 0 hits across `src/`.
- **Adaption Documentation & Schema**: Verified live from official docs (`POST /api/v1/datasets`, `POST /api/v1/datasets/{dataset_id}/adapt`, `GET /api/v1/datasets/{dataset_id}/get_evaluation`, `GET /api/v1/datasets/{dataset_id}/status`, Bearer auth, recipes).
- **Unique JSONL/CSV Exports**: Programmatically verified that exports filter out duplicates, validate each line as valid JSON, and match unique counts.

### 2. NOT RUN (with reasons)
- **Engine on Real Dataset (`scripts/evaluate_sample.ts`)**: **NOT RUN**. Reason: Physical file `data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv` is absent on disk (`Test-Path` returned `False`). Per Anti-Hallucination Protocol 0.c, synthetic creation is strictly forbidden.
- **Provenance Assertion Against Ground Truth JSON**: **NOT RUN**. Reason: Ground-truth JSON was provided as placeholder `<PASTE JSON HERE>` in the prompt.
- **Headless Browser Automated Testing**: **NOT RUN**. Reason: Playwright driver download failed with `404 Not Found` from Microsoft CDN (`playwright-1.57.0-win32_x64.zip`). Replaced with manual click checklist in `MANUAL_TEST_CHECKLIST.md`. All UI claims remain `NOT CLICK-TESTED`.

### 3. Unverified
- **Original Dataset SHA-256 and Distribution Metrics**: `UNVERIFIED` until the authentic CSV file is provided by the user.

### 4. Limitations
- Priority Matrix is a heuristic formula with configurable weights and a documented 1.35x domain multiplier assumption, not an externally validated model.
- Analysis Engine utilizes a deterministic rule-based lexicon with whole-word boundary matching rather than an online LLM or cloud API.
- All UI interactive capabilities are marked `NOT CLICK-TESTED` pending user manual verification.
