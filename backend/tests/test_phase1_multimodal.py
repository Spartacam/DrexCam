"""
Phase 1 Automated Verification Suite: Multimodal Ingestion & Perception Layer.
Tests live Nace Drex connection, video streaming, PDF serving, and ingestion state.
"""

import os
from pathlib import Path
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)
DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def test_multimodal_files_exist():
    video_path = DATA_DIR / "videos" / "dashcam_incident.mp4"
    policy_path = DATA_DIR / "policies" / "commercial_fleet_master_policy_2026.pdf"

    assert video_path.exists(), "dashcam_incident.mp4 must exist in data/videos"
    assert video_path.stat().st_size > 10000, "dashcam_incident.mp4 must not be empty"

    assert policy_path.exists(), "commercial_fleet_master_policy_2026.pdf must exist in data/policies"
    assert policy_path.stat().st_size > 1000, "policy PDF must not be empty"

    # Verify PDF magic bytes
    with open(policy_path, "rb") as f:
        header = f.read(5)
        assert header.startswith(b"%PDF-"), "Policy file must be a valid PDF"


def test_media_streaming_endpoints():
    # Test video stream
    v_resp = client.get("/api/media/video")
    assert v_resp.status_code == 200
    assert "video/mp4" in v_resp.headers.get("content-type", "")
    assert len(v_resp.content) > 10000

    # Test policy stream
    p_resp = client.get("/api/media/policy")
    assert p_resp.status_code == 200
    assert "application/pdf" in p_resp.headers.get("content-type", "")
    assert len(p_resp.content) > 1000


def test_upload_endpoints():
    # Test video upload
    sample_v_bytes = b"fake_mp4_bytes_for_unit_test"
    v_upload = client.post(
        "/api/upload/video",
        files={"file": ("test_upload.mp4", sample_v_bytes, "video/mp4")}
    )
    assert v_upload.status_code == 200
    assert v_upload.json()["status"] == "uploaded"

    # Test policy upload
    sample_p_bytes = b"%PDF-1.4\n%test_pdf_content"
    p_upload = client.post(
        "/api/upload/policy",
        files={"file": ("test_upload.pdf", sample_p_bytes, "application/pdf")}
    )
    assert p_upload.status_code == 200
    assert p_upload.json()["status"] == "uploaded"


def test_multimodal_ingest_state_assembly():
    resp = client.post("/api/ingest", json={"scenario_id": "dashcam_lane_violation"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ingested"
    assert data["total_segments"] == 60
    assert data["total_clauses"] == 15
    assert data["total_questions_prepared"] >= 140

    # Check segment continuity
    segments = data["state"]["video_segments"]
    assert len(segments) == 60
    assert segments[0]["t_start"] == 0.0
    assert segments[-1]["t_end"] == 180.0

    # Check policy clauses
    clauses = data["state"]["policy_clauses"]
    assert len(clauses) == 15
    clause_ids = [c["id"] for c in clauses]
    assert "c4" in clause_ids
    assert "c3" in clause_ids


def test_live_drex_connection():
    """Verifies live connection to Drex System One using user credentials."""
    resp = client.post("/api/evaluate", json={"scenario_id": "dashcam_lane_violation"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "evaluated"
    assert data["drex_metadata"]["total_questions"] >= 140
    assert data["peak_localization"]["segment_id"] in {"s12", "s13", "s14"}
    assert data["top_violation"]["clause_id"] == "c4"
    assert data["final_disposition"]["decision"] == "DENY"
