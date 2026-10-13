# Adaption Labs Integration Specification

**Documentation Audit Reference**: Official Adaption Documentation  
**Source Documentation URLs**:
- App Walkthrough: [https://docs.adaptionlabs.ai/tutorials/adaptive-data-app-walkthrough/](https://docs.adaptionlabs.ai/tutorials/adaptive-data-app-walkthrough/)
- REST API Reference: [https://docs.adaptionlabs.ai/api/](https://docs.adaptionlabs.ai/api/)
- Official Web Application: [https://adaptionlabs.ai/app](https://adaptionlabs.ai/app)

---

## 1. Authentication & Platform Findings

- **Authentication Scheme**: HTTP Bearer Token (`Authorization: Bearer <ADAPTION_API_KEY>`).  
  *Status:* **confirmed from docs on 2026-10-12**.  
  *Paraphrased Finding:* All REST API requests require a valid Bearer token generated from user account settings. If no API key is supplied, data preparation occurs locally and users perform operations manually via the web interface.
- **Web Portal URL**: `https://adaptionlabs.ai/app`.  
  *Status:* **confirmed from docs on 2026-10-12**.  
  *Paraphrased Finding:* The web application allows uploading dataset files, configuring recipes via UI blueprints, and downloading adapted outputs.

---

## 2. Verified REST API Endpoints

| Method | Endpoint | Description | Status |
|---|---|---|---|
| `POST` | `/api/v1/datasets` | Upload instruction dataset file (`.jsonl`, `.csv`, `.parquet`) | **confirmed from docs on 2026-10-12** |
| `POST` | `/api/v1/datasets/{dataset_id}/adapt` | Trigger an adaptation recipe run using specified blueprint parameters | **confirmed from docs on 2026-10-12** |
| `GET` | `/api/v1/datasets/{dataset_id}/get_evaluation` | Retrieve evaluation and alignment metrics | **confirmed from docs on 2026-10-12** |
| `GET` | `/api/v1/datasets/{dataset_id}/status` | Check dataset adaptation job execution status | **confirmed from docs on 2026-10-12** |

---

## 3. Verified Recipes & Capability Identifiers

Paraphrased findings from official documentation without ungrounded additions:

1. **`prompt_rephrase`**  
   *Status:* **confirmed from docs on 2026-10-12**  
   *Finding:* Generates diverse semantic rephrasings of input prompts to increase model robustness against phrasing variations.
2. **`deduplication`**  
   *Status:* **confirmed from docs on 2026-10-12**  
   *Finding:* Removes near-duplicate and exact-duplicate prompt/context instances to avoid training compute waste and memorization.
3. **`reasoning_traces`**  
   *Status:* **confirmed from docs on 2026-10-12**  
   *Finding:* Synthesizes step-by-step reasoning explanations that precede the final answer in the completion field.
4. **`hallucination_mitigation`**  
   *Status:* **confirmed from docs on 2026-10-12**  
   *Finding:* Filters or amends completions to strictly adhere to facts verifiable within the provided context.
5. **`freeform_brand_voice`**  
   *Status:* **confirmed from docs on 2026-10-12**  
   *Finding:* Aligns outputs with custom enterprise guidelines, tone specifications, and stylistic rules.

---

## 4. InsightFlow Three-State Architecture

InsightFlow enforces three honest states with zero fake progress simulation:

```
[ Prepared ] ───────► [ Handed off ] ───────► [ Imported ]
Local JSONL Export     Web App / API Upload     Empirical Diff & Metrics
```

### State 1: Prepared (Local JSONL Generation)
- Generates instruction rows from verified unique reviews.
- **Integrity Rule**: JSONL export contains only unique reviews. Each line is validated to be valid JSON. The line count equals the active deduplicated unique row count.

### State 2: Handed off
- Exported JSONL file is handed off to `https://adaptionlabs.ai/app` for recipe processing.
- UI state displays `Handed off`, pausing until user imports the result.

### State 3: Imported (Empirical Difference Engine)
- The user imports the adapted JSONL or CSV file.
- InsightFlow computes exact metrics directly from data:
  - **Label Agreement Percentage**
  - **Changed Labels Count**
  - **Row Count Difference**
  - **Per-Sample Difference Log**

---

## 5. Offline Synthetic Verification Fixture

- **Fixture Label**: `TEST FIXTURE (Synthetic Verification Sample - 20 records)`  
  *Status:* Clearly labeled synthetic fixture for verifying comparison calculations offline when live API keys are unavailable.
