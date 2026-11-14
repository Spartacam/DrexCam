"""
Verification Script for Phase 2:
State & Question Matrix Evaluation for Texas Personal Auto Incident (00406.mp4 & texas_personal_auto_policy_2024.pdf).
Executes live Drex System 1 evaluation and reports the exact results.
"""

import asyncio
import json
from backend.demo_data import (
    get_texas_nexar_segments,
    get_texas_policy_clauses,
    build_texas_systemone_questions,
    SCENARIOS
)
from backend.nace_client import NaceClient

async def run_phase2_verification():
    scenario = SCENARIOS["texas_auto_nexar_incident"]
    segments = get_texas_nexar_segments()
    clauses = get_texas_policy_clauses()
    query = scenario["query"]
    questions = build_texas_systemone_questions(segments, clauses, query)

    state = {
        "scenario_id": "texas_auto_nexar_incident",
        "query": query,
        "video_metadata": scenario["video"],
        "policy_metadata": scenario["policy"],
        "video_segments": segments,
        "policy_clauses": clauses
    }

    print("=" * 70)
    print("PHASE 2: STATE & QUESTION MATRIX ASSEMBLY")
    print("=" * 70)
    print(f"Scenario: {scenario['title']}")
    print(f"Video File: backend/data/videos/00406.mp4 (18.0s, 6 segments of 3.0s)")
    print(f"Policy File: backend/data/policies/texas_personal_auto_policy_2024.pdf (51 pages, 8 clauses)")
    print(f"Total Segments: {len(segments)}")
    print(f"Total Clauses: {len(clauses)}")
    print(f"Total System 1 Questions: {len(questions)}")
    print("-" * 70)

    # Execute Live Drex System 1 Evaluation
    client = NaceClient()
    result = await client.evaluate_systemone(state=state, questions=questions, model="drex-latest")

    print("\n" + "=" * 70)
    print("PHASE 2: DREX SYSTEM ONE EVALUATION RESULTS")
    print("=" * 70)
    print(f"Execution Mode: {result.get('mode')}")
    print(f"Model: {result.get('model')}")
    print(f"Latency: {result.get('latency_ms')} ms")
    print(f"Total Questions Evaluated: {result.get('questions_count', len(questions))}")
    print("-" * 70)

    answers = result.get("results", {})

    print("\n--- 1. TEMPORAL LOCALIZATION WAVEFORM (Timeline Segments) ---")
    for seg in segments:
        s_id = seg["id"]
        prob = answers.get(f"{s_id}_active", {}).get("noul", 0.0)
        boundary = answers.get(f"{s_id}_boundary", {}).get("choice", "background")
        conf = answers.get(f"{s_id}_boundary", {}).get("confidence", 0.0)
        print(f"  [{s_id}] {seg['t_start']:4.1f}s - {seg['t_end']:4.1f}s | Prob: {prob*100:5.1f}% | Role: {boundary.upper():<12} | Conf: {conf*100:5.1f}% | {seg['transcript'][:40]}")

    print("\n--- 2. POLICY EXCLUSION CHECKS (Texas Personal Auto Policy) ---")
    for clause in clauses:
        c_id = clause["id"]
        viol_prob = answers.get(f"violates_clause_{c_id}", {}).get("noul", 0.0)
        status = "VIOLATION TRIGGERED" if viol_prob > 0.70 else "COMPLIANT / REFUTED"
        print(f"  [{c_id}] {clause['section']:<25} | Violation Prob: {viol_prob*100:5.2f}% | Status: {status}")

    print("\n--- 3. HAZARD & FINAL DISPOSITION ---")
    weather_hazard = answers.get("weather_surface_hazard", answers.get("weather_hazard_traction", {})).get("noul", 0.0)
    disposition = answers.get("final_disposition", {}).get("choice", "approve")
    disp_conf = answers.get("final_disposition", {}).get("confidence", 0.0)
    print(f"  Rain / Traction Hazard Probability: {weather_hazard*100:.1f}%")
    print(f"  Final Adjudication Disposition:     {disposition.upper()} ({disp_conf*100:.1f}% confidence)")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_phase2_verification())
