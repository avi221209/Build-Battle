# InsightFlow — Forensic Audit Report

**Auditor Role**: Principal Engineer  
**Date**: October 11, 2026  
**Repository**: InsightFlow (Build Battle 2026)  
**Standard**: Non-Negotiable Anti-Hallucination Protocol  

---

## 1. Executive Summary

A forensic audit of the InsightFlow codebase was conducted to eliminate all forms of fabricated metrics, simulated artificial intelligence, unverified external claims, and improper data provenance.

Every technical assertion in this report is backed by empirical command output or verbatim code references. No claims have been made without reproducible evidence.

---

## 2. Findings Log

| # | Finding | Severity | Correction / Fix Applied | Empirical Evidence |
|---|---|---|---|---|
| **F-01** | **Synthetic Data Generation Script Masquerading as Real Data**<br>The dataset in the workspace root and `public/` directory was produced by a synthetic script `generate_dataset.py` containing hardcoded templates instead of authentic customer feedback. | **Critical** | Deleted `generate_dataset.py` and all script-generated copies (`BuildBattle_2026_Customer_Feedback_Dataset.csv` in root and `public/`). Created `data/original/` directory. App enforces genuine file loading. | Script deleted from git. Provenance test `src/__tests__/provenance.test.ts` asserts that synthetic generation is prohibited. |
| **F-02** | **Original Dataset Physically Missing from Disk**<br>The expected authentic dataset file `data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv` is absent on disk. | **High** | Marked as **UNVERIFIED / PENDING USER DATASET**. Per Protocol 0.c, the dataset was NOT regenerated. Created provenance unit test reporting absence honestly and waiting for user to supply authentic file. | Test execution: `[PROVENANCE AUDIT]: Original file data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv is absent. Per Anti-Hallucination Protocol 0.c, we do NOT regenerate it. Awaiting authentic file from user.` (`src/__tests__/provenance.test.ts:15`) |
| **F-03** | **Fabricated Adaption Quality Scores & Grades**<br>The Adaption Fine-Tuning UI displayed fabricated numbers: baseline score `6.8`, adapted score `9.6`, `94th percentile`, `42nd percentile`, `48.2%`, `98.4%`, Grade `C+`, and Grade `A+`. | **High** | Deleted all hardcoded scores, percentiles, and grades from `src/types/adaption.ts` and `src/components/adaption/AdaptionTab.tsx`. Replaced with real empirical metric computations (`computeImportedComparison`) calculating exact label agreement %, changed labels count, and row count difference. | Grep search for `6.8`, `9.6`, `94th`, `42nd`, `48.2`, `98.4`, `"A+"`, `"C+"` returns 0 hits in codebase. |
| **F-04** | **Simulated Progress Loop (Fake "AI Training")**<br>`adaptionService.ts` contained a `setTimeout`-based progress interval simulating cloud fine-tuning progress without communicating with any external API. | **High** | Completely deleted the fake simulation function and timer loops. Replaced with honest workflow states: `Prepared` (JSONL created), `Handed off` (exported for user), and `Imported` (real adapted data imported and compared). | `src/services/adaptionService.ts:1-197`: zero `setTimeout` simulations. Tested in `src/__tests__/adaptionService.test.ts`. |
| **F-05** | **Hardcoded Volume and Unique Row Strings in UI**<br>Deduplication banner and sidebar displayed hardcoded strings `"6,680"` and `"320"` instead of computing counts from the active dataset. | **Medium** | Replaced with dynamic runtime computations: `{deduplicationSummary.normalizedDuplicatesRemoved.toLocaleString()}` in `DeduplicationBanner.tsx` and `{datasetStats.uniqueRecords.toLocaleString()}` in `Sidebar.tsx`. | Grep search for `"6,680"` and `"320"` returns 0 hardcoded strings. Tested dynamically with mutation test in `src/__tests__/provenance.test.ts`. |
| **F-06** | **Unvalidated Priority Formula & Multipliers**<br>Priority formula claimed to be an objective mathematical standard without disclosing underlying heuristics or the 1.35x fraud multiplier assumption. | **Medium** | Clearly labeled the priority formula as `"heuristic, configurable, not validated"` across the UI (`PriorityTab.tsx`, `WalkthroughModal.tsx`). Added interactive weight sliders, toggles, and documented the 1.35x security multiplier as an unvalidated domain assumption. | Inspected `src/services/priorityEngine.ts:41-58` and `src/components/priority/PriorityTab.tsx:64-72`. Verified in `src/__tests__/priorityEngine.test.ts:40-75`. |
| **F-07** | **Sentiment Lexicon Substring Collision Bug**<br>`analysisEngine.ts` evaluated sentiment using `lowerText.includes(word)`. As a result, negative word `"unresponsive"` triggered a false positive match on `"responsive"`, skewing sentiment scores to neutral. | **Medium** | Refactored lexicon matching to use word boundary regular expressions (`new RegExp('\\b' + word + '\\b', 'i')`). | Golden test in `src/__tests__/analysisEngine.test.ts:48-58` now passes with `"Customer service was unresponsive..."` correctly classified as `negative` (sentimentScore -0.6) and topic `Customer support`. |
| **F-08** | **Unused Dependencies in package.json**<br>`package.json` included unused packages: `canvas-confetti`, `@types/canvas-confetti`, `jspdf`, `clsx`, and `tailwind-merge`. | **Low** | Uninstalled all 5 unused packages using `npm uninstall`. | Verified with `npx depcheck`: zero dead application imports remain. |
| **F-09** | **TypeScript Compiler Laxity and `any` Casts**<br>`tsconfig.app.json` had strict mode omitted, and components contained `any` type annotations in sort routines and event handlers. | **Low** | Added `"strict": true` to `tsconfig.app.json`. Replaced all `any` usages with strict types (`PriorityFactorBreakdown`, `TrackedIssue['priority']`, `PriorityIssue['status']`, `unknown`). | `npx tsc --noEmit` exits with code 0. Grep for `: any` and `as any` returns zero results across `src/`. |
| **F-10** | **Build-Time Transitive Vulnerabilities in Tailwind CSS v3**<br>`npm audit` reported 7 vulnerabilities (2 moderate, 5 high) in `braces` and `postcss-selector-parser` under `tailwindcss@3.4.19`. | **Low** | Evaluated remediation: fixing requires upgrading to `tailwindcss@4.3.3` which is a breaking major rewrite that alters CSS styling (prohibited by prompt: "Do NOT rebuild or restyle"). Verified that Tailwind is solely an offline development build tool that compiles static CSS to `dist/`. No vulnerable code is shipped to client browsers. | `npm audit` raw report captured. Production bundle verified in `dist/assets/index-CgrZu5ch.css`. |

---

## 3. Code Quality Gates Verification

### Gate 1: TypeScript Strict Mode
- Command: `npx tsc --noEmit`
- Exit Code: `0`
- Result: **PASS** (Zero errors, zero `any` types)

### Gate 2: Linter & Dead Code Check
- Command: `npx oxlint`
- Output: `Found 0 errors`
- Dead code / unused dependencies: `canvas-confetti`, `jspdf`, `clsx`, `tailwind-merge` uninstalled. Zero unused application imports.

### Gate 3: Vitest Unit Test Suite & Coverage
- Command: `npm run test:coverage`
- Output:
```
 ✓ src/__tests__/priorityEngine.test.ts (5 tests) 15ms
 ✓ src/__tests__/provenance.test.ts (2 tests) 13ms
 ✓ src/__tests__/recommendationEngine.test.ts (2 tests) 14ms
 ✓ src/__tests__/deduplication.test.ts (6 tests) 12ms
 ✓ src/__tests__/adaptionService.test.ts (3 tests) 11ms
 ✓ src/__tests__/analysisEngine.test.ts (4 tests) 16ms

 Test Files  6 passed (6)
      Tests  22 passed (22)
   Duration  1.10s

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   69.25 |    56.31 |   91.66 |   69.65 |                   
 ...tionService.ts |    91.3 |    61.53 |     100 |   91.11 | 111-114           
 analysisEngine.ts |   62.29 |    49.45 |    62.5 |   65.21 | ...76,184,217-251 
 deduplication.ts  |   91.89 |    71.42 |     100 |   93.93 | 78-79             
 priorityEngine.ts |   77.77 |    66.66 |     100 |   76.92 | ...69-171,176-183 
 ...ationEngine.ts |   35.84 |    35.71 |     100 |   34.61 | 27-61             
-------------------|---------|----------|---------|---------|-------------------
```
- Result: **PASS** (22/22 unit tests passing, covering deduplication, golden analysis cases, priority calculations, recommendations, adaption export, and mutation testing)

### Gate 4: Production Build & Bundle Size
- Command: `npm run build`
- Output:
```
vite v8.3.4 building client environment for production...
transforming...
✓ 2508 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.11 kB │ gzip:   0.61 kB
dist/assets/index-CgrZu5ch.css   43.95 kB │ gzip:   7.73 kB
dist/assets/index-DBmE_Syi.js   806.03 kB │ gzip: 226.34 kB
✓ built in 2.45s
```
- Result: **PASS** (Build succeeds in 2.45s with optimized production assets)

### Gate 5: Runtime HTTP Verification
- Command: `Invoke-WebRequest -Uri "http://127.0.0.1:5173/" -UseBasicParsing`
- Output:
```
StatusCode        : 200
StatusDescription : OK
ContentLength     : 1289
```
- Result: **PASS**

---

## 4. Final Status Summary

### Verified
- Deduplication logic (exact vs normalized matching, repetition distribution, singleton isolation).
- Mutation test proving KPIs are dynamically computed and respond immediately to duplicate injections.
- All 4 golden test cases for the rule-based analysis engine.
- Adaption documentation, official endpoints, recipes, and honest workflow states (`Prepared` | `Handed off` | `Imported`).
- Configurable priority weights and explicit labeling of formulas as heuristics with assumptions.
- Zero `any` casts and full TypeScript strict mode compliance.
- Removal of unused dependencies (`canvas-confetti`, `jspdf`, `clsx`, `tailwind-merge`).
- Production build compilation and bundle generation.

### Fixed
- Deleted fake progress simulation and timer loops in `adaptionService.ts`.
- Deleted all fabricated benchmark scores (`6.8`, `9.6`, `Grade A+`, `Grade C+`, `94th`, `42nd`).
- Fixed substring collision bug in `analysisEngine.ts` using whole-word regexes.
- Replaced hardcoded strings `"6,680"` and `"320"` with live runtime computations.
- Removed dead dependencies from `package.json`.

### Still Unverified
- **Original Dataset (`data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv`)**: Currently absent from disk. Per Protocol 0.c, we did not fabricate or regenerate it. Awaiting authentic file from the user to verify exact row counts, category distributions, and SHA256 hash.

### Known Limitations
- **Browser Subagent Playwright Download**: Headless browser automation via Playwright was halted due to external network CDN download restrictions on the environment. Functional verification was performed via unit testing, static analysis, production build checks, and HTTP GET verification (`StatusCode: 200 OK`).
- **Tailwind CSS v3 Transitive Dependencies**: `chokidar` -> `braces` has a high-severity advisory (GHSA-vfj7-8cjw-p6xm) in devDependencies. Resolving this requires migrating to Tailwind v4, which would alter styling rules. It has zero client-side runtime impact.
