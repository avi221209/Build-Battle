# InsightFlow — Manual UI Verification Checklist

**Verification Mode**: Manual Browser Click-Through  
**Reason**: Automated browser testing via Playwright driver failed (`404 Not Found` downloading `playwright-1.57.0-win32_x64.zip` from Microsoft CDN).  
**Local Test URL**: `http://127.0.0.1:5173/`  

Please execute each step in your browser and mark the Pass/Fail column.

| Step # | User Action | Expected Result | Pass / Fail | Notes / Observations |
|:---:|---|---|:---:|---|
| **1** | Open `http://127.0.0.1:5173/` in Google Chrome or Microsoft Edge. | The application loads with clean dark/slate styling, showing the top navigation bar, dataset indicator, and sidebar. Zero JavaScript console errors. | [ ] | |
| **2** | Click the **Theme Toggle** button (Sun / Moon icon in the top header). | Application switches smoothly between Dark Mode and Light Mode. The preference persists across page reloads in `localStorage`. | [ ] | |
| **3** | Click the **Data Ingestion / Upload CSV** button in the header or overview. | A native file picker dialog opens to select a `.csv` file. | [ ] | |
| **4** | Upload an invalid or malformed CSV file (e.g. empty file or missing `review`/`category` columns). | An alert or toast notification appears displaying validation errors. Application does not crash. | [ ] | |
| **5** | Upload valid dataset (`data/original/BuildBattle_2026_Customer_Feedback_Dataset.csv`). | Papa Parse streams records. A toast confirms record count. Deduplication runs, and the Deduplication Banner appears showing total, exact unique, and normalized unique counts. | [ ] | |
| **6** | Locate the **Counting Policy** toggle in the header. Switch between `Raw Mentions` and `Deduplicated`. | All KPI cards (Total Feedback, Unique Issues, High Priority Count) and charts dynamically update their numerical values. | [ ] | |
| **7** | Click on the **Feedback Explorer** tab in the sidebar. | The feedback data table displays with columns: Review text, Source Category, Sentiment, Topic, Urgency, Repetition Count, Actions. | [ ] | |
| **8** | Type a search term (e.g., `delivery` or `scam`) into the table search input. | Table rows filter in real time matching the search term across review text and category. | [ ] | |
| **9** | Select a Category filter (e.g., `Fraud and Scam`) and Sentiment filter (`Negative`). | Table displays only records matching both filter conditions. Row count indicator updates accordingly. | [ ] | |
| **10** | Click on any row in the Feedback Table. | The **Feedback Detail Drawer** slides in from the right showing verbatim text, sentiment confidence, inferred topic, supporting evidence quotes, and JSON schema block. | [ ] | |
| **11** | In the drawer, click **Create Tracked Issue**. | A success toast confirms issue creation. Drawer closes. | [ ] | |
| **12** | Click on the **Issue Tracker** tab in the sidebar. | The created issue appears in the issue list. You can change status (`Open`, `In Progress`, `Resolved`, `Dismissed`) and type an internal note. | [ ] | |
| **13** | Click on the **Priority Matrix** tab in the sidebar. | Displays priority triage clusters sorted descending by score. Explicit disclaimer states formula is *"heuristic, configurable, not validated"*. | [ ] | |
| **14** | Click **Configure Weights** in the Priority Matrix. Adjust the Volume slider from 35% to 50%, or toggle the Fraud Multiplier. | Priority scores recalculate immediately and cluster rankings update. | [ ] | |
| **15** | Click on the **Recommendations** tab in the sidebar. | Strategic action cards display with assigned teams, problems, business impacts, and verification metrics. | [ ] | |
| **16** | Click on the **Adaption Fine-Tuning** tab in the sidebar. | Shows the 3 honest states: `Prepared` \| `Handed off` \| `Imported`. Zero fake scores (`6.8`, `9.6`, `Grade A+`) appear. | [ ] | |
| **17** | In Adaption tab, click **Export Adaption JSONL**. | Browser downloads a `.jsonl` file. Inspecting the file confirms each line is valid JSON with `prompt`, `context`, `completion`. | [ ] | |
| **18** | In Adaption tab, click **Load Synthetic Verification Fixture**. | Loads the yellow-labeled `TEST FIXTURE (Synthetic Verification Sample - 20 records)`. Calculates label agreement %, changed labels count, and row diff. | [ ] | |
| **19** | Click on the **Executive Reports** tab in the sidebar. Click **Print Executive Dossier**. | Browser native print dialog opens with print-optimized styles. | [ ] | |
| **20** | In Executive Reports, click **Export CSV**. | Browser downloads a `.csv` file containing the active analyzed feedback records. | [ ] | |
