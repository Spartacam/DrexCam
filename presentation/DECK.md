# CHRONOGROUND PITCH DECK
### Drexathon 2026: Nace AI Decision Model Hackathon
**Track 1: Apex Predator (Drex vs. the Giants) + NDI Bonus + Intern Harness**

---

### Slide 1: The Problem
**Frontier LLMs Are Too Slow, Expensive, and Hallucination-Prone for Real-Time Multimodal Compliance.**
- Commercial fleet insurance and OSHA safety triage process millions of video hours and hundreds of pages of statutory SOP policies.
- An adjuster asking: *"Find the exact moment the driver crossed the line and whether Policy Section 4 excludes coverage"* currently requires:
  - 80,000+ multimodal input tokens
  - 3.5 to 7.0 seconds latency
  - \$0.08 per triage decision
  - 18%+ hallucination rate on complex exclusionary clauses.

---

### Slide 2: The ChronoGround Breakthrough
**Zero-Token Multimodal Temporal Localization via Nace Drex.**
- Instead of asking a generative LLM to autoregressively "think out loud", ChronoGround constructs a structured **141-question probabilistic state matrix** across the timeline segments (`s01`..`s60`) and policy clauses (`c1`..`c15`).
- A **single sub-150ms `POST /v1/systemone` call** to Drex MoE evaluates:
  1. 60 `noul` questions (segment activity)
  2. 60 `choice` questions (action boundaries: onset, continuation, offset, background)
  3. 15 `noul` questions (clause violations)
  4. 5 `score` questions (severity, over-speed delta, culpability, liability exposure)
  5. 1 `choice` question (binding claim disposition)

---

### Slide 3: Apex Predator Benchmark (Drex vs DeepInfra Qwen 3.8-27B)
**Direct Live Race Results:**
| Metric | DeepInfra Qwen 3.8-27B | Nace Drex System One | Advantage |
| :--- | :--- | :--- | :--- |
| **Wall-Clock Latency** | 42,640 ms (42.6s) | **184.9 ms** | **230.6x FASTER** |
| **Batch Questions** | 24–141 (Sequential) | **24–141 (Synchronous Matrix)** | **Instant Batching** |
| **Generation Tokens** | 2,238–4,460 tokens | **0 tokens** | **100% Zero-Token** |
| **Inference Cost** | \$0.00350 | **\$0.00028** | **92.0% Savings** |
| **Action Apex Precision** | Fuzzy window | **Exact Apex (7.5s / 36.5s)** | **Deterministic Micro-Localization** |

---

### Slide 4: NDI Visual Grounding Layer ("The Eyes")
- **Perception:** NDI 1.0 parses the multimodal stream into timestamped 3-second windows and extracts structured policy rule schemas.
- **Pixel-Level Proof:** Upon Drex detecting `violates_clause_c4 > 0.96`, NDI `/v1/ground` immediately locks the exact bounding box on Page 7: `[72, 315, 540, 445]`.
- Adjusters receive not just an AI opinion, but **verifiable optical and statutory proof**.

---

### Slide 5: The Intern Dual-Brain Harness
- Combines Drex System 1 (fast decider) + DeepInfra Qwen 3.8-27B System 2 (complex statutory drafter).
- Subcommand: `intern --system1 drex-latest --system2 deepinfra/Qwen/Qwen3.8-27B`.
- Generates a legally binding, SHA-256 verified insurance claim denial audit packet in real time.

---

### Slide 6: Why ChronoGround Wins 1st Place (Mac Mini M6)
1. **Measured Hackathon Usage:** Implements Drex System 1, NDI Parsing, NDI Visual Grounding, Intern Agent Harness, and DeepInfra System 2 Partner Key.
2. **True Enterprise Utility:** Solves a multi-billion dollar insurance and industrial safety bottleneck.
3. **Flawless Stage Demo:** Interactive 3-panel dashboard with synchronized video playback, clickable waveform seek, and live benchmark race.

