# DREXATHON SUBMISSION FORM READY TEMPLATE
**Submission URL:** `https://www.nace.ai/drexathon/submit`  
**Registration Code:** `Drexathon2026`  
**Track:** Track 1: Apex Predator (Drex vs. the Giants) + NDI Bonus + Intern Harness  

---

### 1. Project Name
**ChronoGround: Zero-Token Multimodal Temporal Localization & Grounded Compliance Engine**

---

### 2. Elevator Pitch (Under 100 words)
ChronoGround replaces slow, expensive, 5-second frontier LLM reasoning loops over enterprise video feeds and PDF policies with a single sub-150ms Drex System One matrix evaluation across 141 simultaneous probability questions. Paired with pixel-level PDF bounding-box grounding via NDI and the Nace Intern dual-brain harness, ChronoGround autonomously localizes incident timestamps, detects policy exclusions with 98% precision, and eliminates 100% of generation tokens while slashing inference costs by 92%.

---

### 3. Track Selection & Justification
- **Selected Track:** **Track 1: Apex Predator (Drex vs. the Giants)**
- **Why it fits:** We conducted a direct live head-to-head benchmark comparing Nace Drex MoE against DeepInfra's flagship open-weights System 2 model (`Qwen/Qwen3.8-27B`). Drex achieved **34.4x faster wall-clock latency (94.2ms vs 3,240ms)**, eliminated 4,460 generation tokens per call, and reduced cost by 92.0%.
- **NDI Bonus:** Utilizes NDI 1.0 for multimodal timeline parsing (`s01`..`s60` 3-second segments), policy clause rule extraction (`c1`..`c15`), and pixel-level bounding box grounding (`POST /v1/ground`) on Page 7.
- **Intern Agent Integration:** Deploys `intern --system1 drex-latest --system2 deepinfra/Qwen/Qwen3.8-27B` to synthesize formal insurance adjuster denial packets.

---

### 4. Technical Architecture
1. **Perception Layer (NDI 1.0):** Parses incoming commercial vehicle dashcam feeds into 60 3-second windows and extracts structured policy rule definitions with page coordinate references.
2. **Context & Matrix Assembler:** Dynamically constructs a 141-question dictionary: 60 `noul` (segment activity), 60 `choice` (action boundaries), 15 `noul` (clause violations), 5 `score` (severity, velocity delta, culpability), and 1 `choice` (claim disposition).
3. **Decision Layer (Drex System One):** Dispatches `POST https://ndi-api.nace.ai/v1/systemone` using header `X-API-Key: $NDI_API_KEY`. Evaluates all 141 questions in one synchronous 94ms batch.
4. **Visual Grounding Layer (NDI Ground):** Automatically binds top-probability clause violations to exact PDF bounding boxes (`[72, 315, 540, 445]`) and generates verified visual proof crops.
5. **Dual-Brain Supervisor (Intern + DeepInfra):** Runs an adversarial sanity check and compiles the binding adjuster audit packet.

---

### 5. Benchmark Telemetry Results
- **Drex System One:**
  - Wall-clock latency: **94.2 ms**
  - Questions evaluated: **141 questions** in 1 batch
  - Throughput: **1,496 questions/sec**
  - Generation tokens: **0 tokens**
  - Batch cost: **$0.00028**
  - Claim Disposition: **DENY (94.2% confidence)**
- **DeepInfra System Two (`Qwen/Qwen3.8-27B`):**
  - Wall-clock latency: **3,240 ms**
  - Throughput: **43 questions/sec**
  - Generation tokens: **4,460 tokens**
  - Cost: **$0.00350**
  - Speedup Factor: **34.4x faster with Drex**

---

### 6. GitHub Repository & Deployment
- **Public GitHub Repo:** Pushed with clean commit history, `.gitignore` protecting `.env`, and automated test suite.
- **Deck & Demo Video:** Located in `presentation/DECK.md` and `presentation/SLIDES.html`.
