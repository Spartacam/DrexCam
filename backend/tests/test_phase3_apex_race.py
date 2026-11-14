"""
Phase 3 Verification Tests:
Apex Predator Benchmark Race (Drex System 1 vs DeepInfra System 2 Qwen 3.8-27B)
and Intern Dual-Brain Adjuster Audit Packet.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_phase3_ingest_and_evaluate_texas():
    # 1. Ingest Texas Nexar scenario
    ingest_res = client.post("/api/ingest", json={"scenario_id": "texas_auto_nexar_incident"})
    assert ingest_res.status_code == 200
    data = ingest_res.json()
    assert data["status"] == "ingested"
    assert data["total_segments"] == 6
    assert data["total_clauses"] == 8

    # 2. Evaluate System 1 probabilistic matrix
    eval_res = client.post("/api/evaluate", json={"scenario_id": "texas_auto_nexar_incident"})
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["status"] == "evaluated"
    assert len(eval_data["timeline_waveform"]) == 6
    assert eval_data["peak_localization"]["segment_id"] == "s03"
    assert eval_data["peak_localization"]["exact_timestamp_seconds"] == 7.5
    assert eval_data["final_disposition"]["decision"] == "APPROVE"
    assert eval_data["final_disposition"]["confidence"] > 0.90
    print(f"\n[Test Phase 3] Evaluated Texas Scenario successfully: Peak {eval_data['peak_localization']['segment_id']} at {eval_data['peak_localization']['exact_timestamp_seconds']}s, Disposition: {eval_data['final_disposition']['decision']}")

def test_phase3_apex_race_texas():
    # Run live Apex Predator race
    race_res = client.post("/api/race", json={"scenario_id": "texas_auto_nexar_incident"})
    assert race_res.status_code == 200
    data = race_res.json()
    assert data["status"] == "race_completed"
    
    bench = data["benchmark"]
    assert bench["winner"] == "Drex System One"
    assert bench["drex"]["input_tokens"] == 0
    assert bench["drex"]["output_tokens"] == 0
    assert bench["drex"]["latency_ms"] < 2500.0  # Drex matrix operation
    
    # DeepInfra System 2 metrics
    assert bench["deepinfra_system2"]["total_tokens"] > 0
    assert bench["deepinfra_system2"]["latency_ms"] > bench["drex"]["latency_ms"]
    
    # Intern audit packet
    audit = data["intern_audit"]
    assert audit["status"] == "success"
    assert "packet_markdown" in audit or "summary" in audit
    print(f"\n[Test Phase 3] Apex Predator Race: Drex {bench['drex']['latency_ms']}ms vs DeepInfra {bench['deepinfra_system2']['latency_ms']}ms ({bench['speedup_factor']})")
    print(f"[Test Phase 3] Intern Audit Packet generated mode: {audit['mode']}")

def test_phase3_custom_ask_texas():
    ask_res = client.post(
        "/api/ask",
        json={
            "scenario_id": "texas_auto_nexar_incident",
            "question_text": "Did the driver accelerate beyond 40 MPH through the intersection?",
            "question_type": "noul"
        }
    )
    assert ask_res.status_code == 200
    ask_data = ask_res.json()
    assert ask_data["status"] == "answered"
    print(f"\n[Test Phase 3] Custom Ask answered in {ask_data['latency_ms']}ms: {ask_data['answer']}")
