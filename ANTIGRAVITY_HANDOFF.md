# ANTIGRAVITY MASTER HANDOFF: DREXATHON (NACE.AI HACKATHON)

## 1. MISSION & DEADLINE CONTEXT
We are competing live today (Saturday, Nov 14, 2026) at **Drexathon: Nace AI's Decision Model Hackathon** in San Francisco.
- **HARD SUBMISSION DEADLINE:** Today at **3:00 PM Pacific** (No edits allowed after the countdown hits zero).
- **Primary Prize:** 1st Place Mac Mini M6.
- **How Finalists Are Selected (CRITICAL RULE):** Finalists are picked directly by measured usage of **Drex**, **Intern** (the Nace dual-brain harness), **NDI (Nace Document Intelligence)**, and **partner tools (DeepInfra, Adobe, Keenable)**.
- **Deliverables Required Before 3:00 PM:**
  1. Working full-stack application pushed to a **public GitHub repository** (remember to `.gitignore` `.env` so API keys are not exposed).
  2. Presentation deck + project explanation.
  3. Submitted and **Finalized** at `https://www.nace.ai/drexathon/submit` (Registration code: `Drexathon2026`).

---

## 2. CREDENTIALS, KEYS & ENVIRONMENT
- **Wi-Fi:** `FrontierTower` / Password: `frontiertower995`
- **Nace Console & Billing:** `https://console.nace.ai` -> Redeem code `DREXATHON` for $35 Nace Credits -> Generate `NACE_API_KEY` (also used as `NDI_API_KEY`).
- **NDI / Drex Base URL:** `https://ndi-api.nace.ai`
- **DeepInfra API Key (System 2 Partner Key provided by organizers):**
  `DEEPINFRA_API_KEY="sk-di-V0FaFPRzK13Ld9jYabyBxqK95jxpOGrN"`
- **Nace Intern Harness Installation & CLI:**
  ```bash
  uv tool install --python 3.12 "intern-agent @ git+https://github.com/nace-ai/intern"
  export NACE_API_KEY="<your-nace-key>"
  export NDI_API_KEY="$NACE_API_KEY"
  export DEEPINFRA_API_KEY="sk-di-V0FaFPRzK13Ld9jYabyBxqK95jxpOGrN"
  intern --system1 drex-latest --system2 deepinfra/Qwen/Qwen3.8-27B
  ```

* **Nace MCP Server (Optional for agent tool access):** `https://console.nace.ai/mcp`
* **Python & TypeScript SDKs:** `pip install ndi-sdk` (Python `from ndi_sdk import NdiClient`) / `npm i ndi-sdk` (TypeScript `import { NdiClient } from "ndi-sdk"`).

---

## 3. THE PROJECT: "CHRONOGROUND"

* **Selected Track:** **Track 1: Apex Predator (Drex vs. the Giants)** + **NDI Bonus** + **Intern & DeepInfra Partner Integration**.
* **One-Line Pitch:** A Zero-Token Multimodal Temporal Localization & Compliance Verification Engine that replaces a 5-second, $0.08 frontier LLM video-and-document reasoning loop with a **single sub-150ms Drex `evaluate_systemone` call** across up to 512 simultaneous probability questions, paired with pixel-level PDF bounding-box grounding via NDI.
* **Real-World Demo Scenario (Dashcam / Workplace Safety Claim Triage):**
An insurance adjuster or safety engineer uploads:
1. An incident video (`dashcam_incident.mp4` or workplace safety clip).
2. A 15-page Policy / SOP Manual (`fleet_insurance_policy.pdf`).

* **User Query:** *"Find the exact moment the vehicle crosses the solid line / operator bypasses the safety guard, and determine whether the claim is Approved, Denied, or Escalated under Policy Section 4."*

---

## 4. COMPLETE NACE.AI PRODUCT & API ARCHITECTURE

### Layer 1: Nace Perception Layer (NDI 1.0 - "The Eyes")

1. **File Staging:** `POST /v1/create_upload` (`client.documents.create_upload`) or Workspace API (`POST /v1/workspaces`, `POST /v1/upload_file`).
2. **Multimodal Parsing:** `POST /v1/parse` (`?wait_seconds=60`)
* **Video Output:** `GET /v1/jobs/{id}/parse_transcript_content` -> Returns timestamped video/audio segments (`s01`..`s60`, 3-second windows).
* **PDF/Spreadsheet Output:** Structured layout trees, markdown, and `GET /v1/jobs/{id}/spreadsheet_cell_map_content`.
3. **Structured Rule Extraction:** `POST /v1/validate_extract_schema` + `POST /v1/extract` -> Extracts structured policy clauses (`c1`..`c15`), liability thresholds, and exclusions from the PDF with page metadata.
4. **Drex for Search (Workspace Narrowing):** `POST /v1/locate` & `POST /v1/automatic_search` -> Pre-filters multi-document workspaces before matrix evaluation.

### Layer 2: Context & Matrix Assembler (FastAPI Backend)

Merges the parsed video segments and extracted PDF clauses into a single JSON `state` object and dynamically constructs a **150-to-512 question dictionary** for Drex.

### Layer 3: Nace Decision Layer (Drex System One - "The Brain")

* **Endpoint:** `POST https://ndi-api.nace.ai/v1/systemone` (SDK: `client.systemone.evaluate`)
* **Auth Header:** `X-API-Key: $NDI_API_KEY` (Note: `/v1/systemone` strictly requires `X-API-Key`, NOT `Authorization: Bearer`).
* **Models Used:**
* `drex-v2.0` (`drex-latest`, 35B MoE / 3B active, ~50-120ms): Evaluates the full text/timeline matrix (up to 512 questions in one synchronous call).
* `drex-max` (27B dense multimodal, up to 8 images/frames): Evaluates candidate video keyframes directly.

* **Exact `/v1/systemone` Request & Response Contract:**
* Supports 1 to 512 questions per call.
* Question types:
1. `noul`: Yes/No statement -> returns `{"type": "noul", "noul": 0.94}` (probability statement is true).
2. `choice`: Pick among named options in `criteria` (dict of `option_name: description`) -> returns `{"type": "choice", "choice": "onset", "confidence": 0.88, "probabilities": {...}}`.
3. `score`: Position on an ordered scale in `criteria` (list of strings, lowest first) -> returns `{"type": "score", "score": 2.4, "legend": [...], "probabilities": {"0": ..., "1": ...}, "confidence": 0.79}`.

* **Example Payload:**
```json
{
  "state": {
    "query": "Vehicle crosses double yellow line prior to impact",
    "video_segments": [
      {"id": "s12", "t_start": 36.0, "t_end": 39.0, "transcript": "...", "visual_tags": "..."}
    ],
    "policy_clauses": [
      {"id": "c4", "text": "Coverage excluded if reckless lane departure...", "page": 7}
    ]
  },
  "questions": {
    "s12_active": {
      "type": "noul",
      "instructions": "The queried incident is actively occurring in segment s12.",
      "criteria": {"true": "Incident occurs in s12", "false": "Routine activity"}
    },
    "s12_boundary": {
      "type": "choice",
      "instructions": "Classify segment s12's role in the action boundary.",
      "criteria": {
        "onset": "The exact start of the incident",
        "continuation": "Middle of the incident",
        "offset": "The exact end of the incident",
        "background": "Unrelated background footage"
      }
    },
    "violates_clause_c4": {
      "type": "noul",
      "instructions": "Does the incident in the active segments trigger exclusion clause c4?"
    },
    "severity": {
      "type": "score",
      "instructions": "Rate the severity and liability exposure of the incident.",
      "criteria": ["minimal", "moderate", "severe", "critical"]
    },
    "final_disposition": {
      "type": "choice",
      "instructions": "Select the final claim routing action.",
      "criteria": {
        "approve": "No exclusions triggered, clear liability",
        "deny": "Direct policy exclusion triggered with >0.85 confidence",
        "escalate": "Ambiguous evidence requiring human review"
      }
    }
  }
}
```

### Layer 4: Nace Visual Grounding Layer (NDI Ground)

* Triggered automatically on the highest-probability violated clause (`violates_clause_c4 > 0.80`) and winning video segment (`s12_active`).
* Calls `POST /v1/ground` to locate exact `[page, x0, y0, x1, y1]` coordinates.
* Retrieves `GET /v1/jobs/{id}/ground_crop_content` (cropped image of the exact PDF clause) and `GET /v1/jobs/{id}/ground_transcript_content` (exact timestamp span).

### Layer 5: Intern & DeepInfra System 2 Integration

* **Live "Apex Predator" Benchmark Race:** The backend runs the exact same query against **DeepInfra (`Qwen/Qwen3.8-27B`)** via `https://api.deepinfra.com/v1/openai` using `DEEPINFRA_API_KEY` and compares wall-clock latency (`evaluation_time_ms`), token usage, and cost against **Drex (`POST /v1/systemone`)**.
* **Intern Agent Integration:** Uses `intern` (headless / JSON-RPC mode or subprocess wrapper) with `--system1 drex-latest --system2 deepinfra/Qwen/Qwen3.8-27B` to generate the final human-readable adjuster audit packet while Drex System 1 supervises every tool call.

---

## 5. FRONTEND UI REQUIREMENTS (NEXT.JS / REACT + TAILWIND + LUCIDE)

Build a sleek, dark-mode 3-panel dashboard designed for a 5-minute stage demo:

1. **Left Panel (Video Player + Drex Probability Timeline Waveform):**
* HTML5 video player with a synchronized horizontal probability bar chart underneath representing segments `s01`..`s60` from Drex's `noul` and `choice` (`onset`/`offset`) outputs.
* Clicking the probability spike auto-seeks the video to the exact localized timestamp (`t_start`).

2. **Center Panel (NDI Grounded Policy Proof Viewer):**
* Displays the extracted PDF policy clauses, each badged with Drex's `violates_clause_k` probability (`0.00` to `1.00`), plus the rendered NDI Ground bounding-box highlight crop (`ground_crop_content`).

3. **Right Panel ("Apex Predator" Live Race Scoreboard + Intern Audit Log):**
* A **"Run Side-by-Side Race"** button that fires the query simultaneously to **Drex System 1** (evaluating 100+ questions in 1 batch) vs. **DeepInfra System 2 LLM** (`Qwen/Qwen3.8-27B`), charting real-time latency (`ms`), questions/sec throughput, and cost savings (`GET /v1/usage`).

---

## 6. YOUR IMMEDIATE INSTRUCTIONS IN ANTIGRAVITY

1. Inspect the workspace directory and verify `.env` and `.gitignore` are configured safely.
2. Scaffold the **FastAPI backend** (`backend/main.py`) with:
* `/api/ingest`: Calls NDI `create_upload`, `parse`, and `extract` (with pre-cached fallback demo data so the live stage demo never blocks on slow Wi-Fi uploads).
* `/api/evaluate`: Builds the 100+ question matrix (`noul`, `choice`, `score`), calls `POST https://ndi-api.nace.ai/v1/systemone` with `X-API-Key`, and triggers NDI `/v1/ground`.
* `/api/race`: Runs the parallel benchmark comparing Drex `/v1/systemone` vs. DeepInfra `Qwen/Qwen3.8-27B` (`https://api.deepinfra.com/v1/openai`) and invokes `intern` for the final adjuster report.
3. Scaffold the **Next.js / Vite React frontend** (`frontend/`) featuring the 3-panel ChronoGround dashboard and pre-loaded sample incident + policy data for instant testing.
