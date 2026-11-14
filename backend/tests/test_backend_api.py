"""
Automated Verification Suite for ChronoGround FastAPI Backend.
Tests all endpoints against hackathon specifications and Drex contract.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "credentials" in data
    assert "models" in data
    assert data["models"]["system1"] == "drex-latest"
    assert data["models"]["system2"] == "Qwen/Qwen3.8-27B"


def test_scenarios_endpoint():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    data = response.json()
    assert len(data["scenarios"]) >= 2
    scenario_ids = [s["id"] for s in data["scenarios"]]
    assert "dashcam_lane_violation" in scenario_ids


def test_ingest_endpoint():
    response = client.post("/api/ingest", json={"scenario_id": "dashcam_lane_violation"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ingested"
    assert data["total_segments"] == 60
    assert data["total_clauses"] == 15
    assert data["total_questions_prepared"] >= 140
    assert "state" in data
    assert len(data["state"]["video_segments"]) == 60


def test_evaluate_systemone():
    response = client.post("/api/evaluate", json={"scenario_id": "dashcam_lane_violation"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "evaluated"
    
    # Verify timeline waveform
    timeline = data["timeline_waveform"]
    assert len(timeline) == 60
    
    # Check peak segment localization
    peak_loc = data["peak_localization"]
    assert peak_loc["segment_id"] in {"s12", "s13", "s14"}
    assert peak_loc["probability"] > 0.85
    
    # Check clause evaluations
    clauses = data["clause_evaluations"]
    assert len(clauses) == 15
    top_clause = clauses[0]
    assert top_clause["id"] == "c4"
    assert top_clause["violation_probability"] > 0.90
    assert top_clause["status"] == "VIOLATED"
    
    # Check disposition
    disposition = data["final_disposition"]
    assert disposition["decision"] == "DENY"
    assert disposition["confidence"] > 0.85


def test_ground_clause():
    response = client.post("/api/ground", json={
        "clause_id": "c4",
        "document_name": "commercial_fleet_master_policy_2026.pdf"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    grounding = data["grounding"]
    assert grounding["clause_id"] == "c4"
    assert grounding["page"] == 7
    assert "bounding_box" in grounding
    assert grounding["verification_status"] == "GROUNDED_VERIFIED"


def test_race_benchmark():
    response = client.post("/api/race", json={"scenario_id": "dashcam_lane_violation"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "race_completed"
    
    benchmark = data["benchmark"]
    assert benchmark["winner"] == "Drex System One"
    assert "speedup_factor" in benchmark
    
    # Drex checks
    drex = benchmark["drex"]
    assert drex["latency_ms"] < 2000.0  # network latency gate
    assert drex["questions_evaluated"] >= 140
    assert drex["input_tokens"] == 0  # Zero token decider!
    
    # DeepInfra checks
    deepinfra = benchmark["deepinfra_system2"]
    assert deepinfra["total_tokens"] > 1000
    assert deepinfra["estimated_cost_usd"] > drex["estimated_cost_usd"]
    
    # Intern audit packet checks
    assert "intern_audit" in data
    assert "packet_markdown" in data["intern_audit"]
    assert len(data["intern_audit"]["supervisor_log"]) >= 3


def test_ask_custom_question():
    response = client.post("/api/ask", json={
        "question_text": "Did the vehicle brake hard before leaving the roadway?",
        "scenario_id": "dashcam_lane_violation"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "answered"
    assert data["latency_ms"] < 2000.0
    assert "answer" in data
    assert data["answer"]["type"] == "noul"
    assert 0.0 <= data["answer"]["noul"] <= 1.0


