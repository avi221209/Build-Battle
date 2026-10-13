# InsightFlow — Demonstration Script & Walkthrough

**Document Standard**: Matches Real Verified Behavior Only  
**Integrity Protocol**: Zero Fabricated AI Claims, Zero Mock Simulations  
**UI Verification Status**: **NOT CLICK-TESTED** (Headless browser automated driver download failed with network 404; pending user confirmation via `MANUAL_TEST_CHECKLIST.md`).

---

## Stage 1: Workspace Initialization & Theme
1. Open the application at `http://127.0.0.1:5173/` in your browser.
2. Note the initial header featuring the dataset status indicator, counting policy toggle, and dark/light theme toggle.
3. Click the **Theme Toggle** (Sun/Moon icon) in the top-right corner.
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Application switches between dark slate and clean light themes, persisting the preference to `localStorage`.

---

## Stage 2: Ingesting Data & Provenance Transparency
1. The application prompts for customer feedback data via the **Upload CSV** button or manual record entry.
2. Click **Upload CSV** and select your feedback dataset (`.csv` format with `review` and `category` headers).
3. If an authentic CSV is provided, Papa Parse streams and parses the rows.
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Deduplication runs immediately. The summary banner displays the exact raw count, exact unique count, normalized unique count, and duplicate percentage computed at runtime from the uploaded file.
4. If testing without an uploaded file, click **Add Feedback** in the Explorer tab to create verified feedback records manually.

---

## Stage 3: Dual Counting Policy Demonstration
1. Locate the **Counting Policy** selector in the top bar (options: `Raw Mentions` vs. `Deduplicated Root Causes`).
2. Toggle between `Raw Mentions` and `Deduplicated`:
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:*
     - In **Raw Mentions** mode, KPIs and chart totals reflect every individual mention.
     - In **Deduplicated** mode, duplicate rows are collapsed, displaying only unique customer voices.
     - Every KPI card, category bar chart, sentiment donut, and topic frequency updates dynamically in real time.

---

## Stage 4: Feedback Explorer & Verbatim Evidence Drilldown
1. Click the **Feedback Explorer** tab in the sidebar.
2. In the search bar, type a keyword such as `"checkout"` or `"unresponsive"`.
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Table filters in real-time. Duplicates are grouped with badge indicators showing repetition counts.
3. Click on any record in the table.
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* A detailed drawer slides out from the right showing:
     - Review text verbatim.
     - Rule-based sentiment analysis with confidence score.
     - Inferred operational topic.
     - Verbatim supporting evidence snippets extracted by word-boundary matching.
     - Structured JSON schema view.
4. Click **Create Tracked Issue** from the drawer to escalate the complaint.

---

## Stage 5: Explainable Priority Matrix (Heuristic Triage)
1. Click the **Priority Matrix** tab in the sidebar.
2. Review the top triage issues sorted descending by priority score ($0–100$).
3. Observe the explicit disclaimer:
   > *"Priority Formula: Heuristic, configurable, not validated. Weights and multipliers represent domain assumptions."*
4. Click **Configure Weights**:
   - Adjust the **Volume Weight** ($35\%$), **Negative Sentiment Weight** ($25\%$), **Severity Weight** ($25\%$), and **Model Confidence Weight** ($15\%$).
   - Toggle the **Fraud & Security Multiplier** ($1.35\times$ boost assumption).
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Priority scores recalculate instantly according to the updated mathematical weights.

---

## Stage 6: Strategic Recommendations & Issue Tracking
1. Click the **Recommendations** tab.
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Actionable recommendations generated from top priority clusters appear with suggested team owners, problems, recommended actions, and quantifiable verification metrics.
2. Click **Convert to Tracked Issue** on a recommendation.
3. Navigate to the **Issue Tracker** tab.
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Tracked issue appears in the Kanban/list view. You can update status (`Open` → `In Progress` → `Resolved` → `Dismissed`) and append internal investigation notes. State persists in browser `localStorage`.

---

## Stage 7: Adaption Labs Fine-Tuning Workflow
1. Click the **Adaption Fine-Tuning** tab in the sidebar.
2. Verify the three honest states: `Prepared` | `Handed off` | `Imported`.
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* No fake progress bars, no fake quality scores, and no fake `Grade A+` badges appear.
3. Review the verified column mappings:
   - `Prompt`: Instruction definition.
   - `Context`: Verbatim review text and category.
   - `Completion`: Structured classification output.
4. Review the verified recipe options: `prompt_rephrase`, `deduplication`, `reasoning_traces`, `hallucination_mitigation`, `freeform_brand_voice`.
5. Click **Export Adaption JSONL**:
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Downloads a `.jsonl` file where each line is a valid JSON object matching the Adaption training format.
6. Click **Load Synthetic Verification Fixture**:
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Loads a clearly labeled test fixture (`TEST FIXTURE (Synthetic Verification Sample - 20 records)`).
   - InsightFlow executes `computeImportedComparison` and displays:
     - Exact **Label Agreement Percentage**.
     - Count of **Changed Labels** vs **Unchanged Labels**.
     - **Row Difference** count.
     - Side-by-side inspection table showing original vs adapted sentiment and topics.

---

## Stage 8: Executive Reports & Export
1. Click the **Executive Reports** tab in the sidebar.
2. Click **Print Executive Dossier**:
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Triggers browser print dialog formatted as an executive briefing document with high-contrast print styles.
3. Click **Export CSV**:
   - *Status:* **[NOT CLICK-TESTED]**
   - *Expected Behavior:* Downloads the current analyzed dataset as a CSV file.
