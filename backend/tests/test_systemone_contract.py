"""
Unit Test for Drex System One Question Contract & Payload Adherence.
"""

from backend.demo_data import get_dashcam_segments, get_dashcam_policy_clauses, build_systemone_questions


def test_systemone_question_matrix_contract():
    segments = get_dashcam_segments()
    clauses = get_dashcam_policy_clauses()
    query = "Find the exact moment the vehicle crosses the solid line."

    questions = build_systemone_questions(segments, clauses, query)

    # 1. Total questions count >= 140
    assert len(questions) >= 140

    # 2. Check noul contract
    s12_active = questions["s12_active"]
    assert s12_active["type"] == "noul"
    assert "instructions" in s12_active
    assert "criteria" in s12_active
    assert "true" in s12_active["criteria"]
    assert "false" in s12_active["criteria"]

    # 3. Check choice contract
    s12_boundary = questions["s12_boundary"]
    assert s12_boundary["type"] == "choice"
    assert "criteria" in s12_boundary
    assert isinstance(s12_boundary["criteria"], dict)
    assert "onset" in s12_boundary["criteria"]
    assert "continuation" in s12_boundary["criteria"]
    assert "offset" in s12_boundary["criteria"]
    assert "background" in s12_boundary["criteria"]

    # 4. Check score contract
    severity = questions["incident_severity"]
    assert severity["type"] == "score"
    assert "criteria" in severity
    assert isinstance(severity["criteria"], list)
    assert len(severity["criteria"]) >= 4

    # 5. Check final disposition contract
    disposition = questions["final_disposition"]
    assert disposition["type"] == "choice"
    assert "approve" in disposition["criteria"]
    assert "deny" in disposition["criteria"]
    assert "escalate" in disposition["criteria"]

