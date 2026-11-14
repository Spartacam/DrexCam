"""
Pre-cached, high-fidelity demo scenarios for ChronoGround.
Ensures 100% stage reliability even if conference Wi-Fi drops or upload times out.
"""

from typing import Any

SCENARIOS: dict[str, dict[str, Any]] = {
    "dashcam_lane_violation": {
        "id": "dashcam_lane_violation",
        "title": "Commercial Fleet Dashcam: Double-Yellow Lane Cross & Near-Miss",
        "category": "Commercial Auto Insurance & Fleet Safety",
        "query": "Find the exact moment the commercial vehicle crosses the double yellow line into opposing traffic, and determine whether coverage is Approved, Denied, or Escalated under Policy Section 4.",
        "video": {
            "title": "Dashcam Cam-04 Forward Telematics Feed",
            "duration_seconds": 180,
            "segment_duration_seconds": 3,
            "total_segments": 60,
            "active_incident_segments": ["s12", "s13", "s14"],
            "onset_segment": "s12",
            "peak_segment": "s13",
            "offset_segment": "s14",
            "incident_start_time": 34.2,
            "incident_end_time": 41.5,
        },
        "policy": {
            "document_name": "commercial_fleet_master_policy_2026.pdf",
            "total_pages": 15,
            "primary_violated_clause_id": "c4",
        }
    },
    "workplace_safety_interlock": {
        "id": "workplace_safety_interlock",
        "title": "Industrial Stamping Plant: Light Curtain Safety Interlock Bypass",
        "category": "Workers Comp & OSHA SOP Compliance",
        "query": "Detect the timestamp when the press operator reaches past the optical safety curtain while the ram is cycling, and determine liability under SOP Section 8.",
        "video": {
            "title": "Bay 3 Hydraulic Stamping Cell CCTV",
            "duration_seconds": 180,
            "segment_duration_seconds": 3,
            "total_segments": 60,
            "active_incident_segments": ["s24", "s25", "s26"],
            "onset_segment": "s24",
            "peak_segment": "s25",
            "offset_segment": "s26",
            "incident_start_time": 71.0,
            "incident_end_time": 78.5,
        },
        "policy": {
            "document_name": "industrial_machinery_sop_osha_compliant.pdf",
            "total_pages": 12,
            "primary_violated_clause_id": "c6",
        }
    }
}


def get_dashcam_segments() -> list[dict[str, Any]]:
    segments = []
    for i in range(1, 61):
        seg_id = f"s{i:02d}"
        t_start = round((i - 1) * 3.0, 1)
        t_end = round(i * 3.0, 1)
        
        if i < 11:
            desc = "Routine commercial transit along suburban secondary arterial. Lane alignment centered, speed 34 mph, dry pavement."
            visual_tags = ["traffic:normal", "lane_departure:none", "brake_lights:inactive", "speed:34mph"]
        elif i == 11:
            desc = "Approaching blind leftward curve. Speed telemetry indicates acceleration to 44 mph. Vehicle begins mild drift towards center divider."
            visual_tags = ["curve:left", "speed_increase:44mph", "lane_drift:minor"]
        elif i == 12:
            desc = "INCIDENT ONSET: Front left tire breaches solid double yellow dividing lines. Oncoming headlights emerge from curve. Telematics alarms sound."
            visual_tags = ["line_breach:double_yellow", "oncoming_traffic:visible", "lane_deviation:active", "speed:48mph"]
        elif i == 13:
            desc = "INCIDENT CRITICAL PEAK: Vehicle crosses 80% into oncoming opposing traffic lane at 52 mph. Opposing box truck sounds air horn; severe near-miss evasive maneuver."
            visual_tags = ["oncoming_head_on_risk:extreme", "full_lane_trespass:yes", "speed:52mph_in_35mph", "hazard_airhorn:active"]
        elif i == 14:
            desc = "INCIDENT OFFSET: Operator yanks steering wheel right; chassis skids across rumble strip onto right shoulder gravel. Collision avoided by 1.8 feet."
            visual_tags = ["recovery_skid:shoulder", "dust_plume:active", "emergency_braking:maximum", "speed_drop:12mph"]
        elif i == 15:
            desc = "Vehicle halts on unimproved right shoulder. Hazard flashers engaged. Telematics accelerometer logs 0.82G lateral jerk."
            visual_tags = ["vehicle_stopped:shoulder", "hazards:on", "telematics_flag:g_force_alert"]
        else:
            desc = f"Post-incident stationary idling on shoulder. Hazard blinkers active. Operator cabin telemetry idle at t={t_start}s."
            visual_tags = ["stationary:shoulder", "hazards:on", "engine:idling"]

        segments.append({
            "id": seg_id,
            "t_start": t_start,
            "t_end": t_end,
            "transcript": desc,
            "visual_tags": visual_tags,
        })
    return segments


def get_dashcam_policy_clauses() -> list[dict[str, Any]]:
    return [
        {
            "id": "c1",
            "section": "Section 1.1",
            "title": "Eligible Operators & Commercial Authorization",
            "page": 2,
            "text": "Coverage applies exclusively to certified commercial drivers with valid Class-B endorsements who maintain an active duty log on the automated telematics system.",
            "bounding_box": {"page": 2, "x0": 0.12, "y0": 0.22, "x1": 0.88, "y1": 0.32},
            "is_exclusion": False,
        },
        {
            "id": "c2",
            "section": "Section 2.4",
            "title": "Telematics Continuous Monitoring Mandate",
            "page": 4,
            "text": "Every insured vehicle must keep forward and cabin-facing optical telematics enabled during all commercial transit operating hours. Unexplained camera outages void indemnity.",
            "bounding_box": {"page": 4, "x0": 0.14, "y0": 0.55, "x1": 0.86, "y1": 0.65},
            "is_exclusion": False,
        },
        {
            "id": "c3",
            "section": "Section 3.2",
            "title": "Excessive Velocity Thresholds & Speed Governance",
            "page": 6,
            "text": "Vehicular operation exceeding the posted regulatory speed limit by greater than fifteen (15) miles per hour shall incur mandatory underwriting surcharge and conditional defense review.",
            "bounding_box": {"page": 6, "x0": 0.10, "y0": 0.34, "x1": 0.90, "y1": 0.46},
            "is_exclusion": False,
        },
        {
            "id": "c4",
            "section": "Section 4.2",
            "title": "Reckless Lane Departure & Crossing of Solid Traffic Dividers Exclusion",
            "page": 7,
            "text": "DIRECT EXCLUSION OF LIABILITY: No indemnity or defense shall be afforded under this policy for any loss, third-party claim, near-miss investigation, or collision resulting directly from willful, unprovoked, or reckless vehicular trespass across painted solid double yellow dividing lines or physical barriers into oncoming lanes of traffic, absent documented proof of immediate sudden mechanical failure or emergency obstacle avoidance.",
            "bounding_box": {"page": 7, "x0": 0.11, "y0": 0.44, "x1": 0.89, "y1": 0.62},
            "is_exclusion": True,
        },
        {
            "id": "c5",
            "section": "Section 4.8",
            "title": "Aftermarket Optical Equipment Warranty",
            "page": 8,
            "text": "Telematics recording devices must meet SAE J3016 optical clarity standards and not be tampered with or modified without insurer written authorization.",
            "bounding_box": {"page": 8, "x0": 0.15, "y0": 0.18, "x1": 0.85, "y1": 0.28},
            "is_exclusion": False,
        },
        {
            "id": "c6",
            "section": "Section 5.1",
            "title": "Operator Distraction & Mobile Device Prohibition",
            "page": 9,
            "text": "Hands-free mobile communication is permitted solely via integrated Bluetooth. Handheld mobile device operation during transit constitutes gross operational negligence.",
            "bounding_box": {"page": 9, "x0": 0.12, "y0": 0.60, "x1": 0.88, "y1": 0.72},
            "is_exclusion": True,
        },
        {
            "id": "c7",
            "section": "Section 6.3",
            "title": "Immediate Incident Notification Requirement",
            "page": 10,
            "text": "Insured must transmit optical telemetry and collision sensor logs to the claims intake desk within twenty-four (24) hours of any reportable event or severe telematics anomaly.",
            "bounding_box": {"page": 10, "x0": 0.13, "y0": 0.28, "x1": 0.87, "y1": 0.38},
            "is_exclusion": False,
        },
        {
            "id": "c8",
            "section": "Section 7.1",
            "title": "Gross Vehicle Weight & Axle Distribution Rating",
            "page": 11,
            "text": "Payload capacity must remain strictly within manufacturer GVWR gross vehicle weight limits as verified by roadside weight station manifests.",
            "bounding_box": {"page": 11, "x0": 0.14, "y0": 0.48, "x1": 0.86, "y1": 0.58},
            "is_exclusion": False,
        },
        {
            "id": "c9",
            "section": "Section 8.2",
            "title": "Adverse Weather & Reduced Visibility Safe Harbor",
            "page": 12,
            "text": "In conditions of rain, snow, or fog reducing sight distance below 300 feet, safe operating velocity must decrease by at least 25% below posted dry limits.",
            "bounding_box": {"page": 12, "x0": 0.12, "y0": 0.15, "x1": 0.88, "y1": 0.26},
            "is_exclusion": False,
        },
        {
            "id": "c10",
            "section": "Section 9.4",
            "title": "Subrogation Rights Against Third-Party Infringing Operators",
            "page": 13,
            "text": "In the event of an excluded claim caused jointly by third-party negligence, the insurer reserves full subrogation recovery rights against external motor carriers.",
            "bounding_box": {"page": 13, "x0": 0.13, "y0": 0.65, "x1": 0.87, "y1": 0.76},
            "is_exclusion": False,
        },
        {
            "id": "c11",
            "section": "Section 10.1",
            "title": "Bodily Injury & Property Damage Comprehensive Schedule",
            "page": 14,
            "text": "Maximum combined single limit liability coverage is $2,000,000 per commercial incident occurrence, subject to applicable deductibles and policy exclusions.",
            "bounding_box": {"page": 14, "x0": 0.10, "y0": 0.20, "x1": 0.90, "y1": 0.32},
            "is_exclusion": False,
        },
        {
            "id": "c12",
            "section": "Section 11.2",
            "title": "Defensive Driving Telematics Safety Discount",
            "page": 14,
            "text": "Drivers maintaining a zero-departure record for 180 consecutive operating days earn a 15% deductible credit on qualifying first-party collision claims.",
            "bounding_box": {"page": 14, "x0": 0.14, "y0": 0.70, "x1": 0.86, "y1": 0.80},
            "is_exclusion": False,
        },
        {
            "id": "c13",
            "section": "Section 12.5",
            "title": "Mandatory Arbitration & Dispute Forum",
            "page": 15,
            "text": "Any contested denial of indemnity under Section 4 exclusions shall proceed to binding AAA commercial arbitration in the governing jurisdiction.",
            "bounding_box": {"page": 15, "x0": 0.12, "y0": 0.18, "x1": 0.88, "y1": 0.28},
            "is_exclusion": False,
        },
        {
            "id": "c14",
            "section": "Section 14.1",
            "title": "Telematics Tampering & Material Misrepresentation",
            "page": 15,
            "text": "Intentional deletion, distortion, or withholding of dashcam telematics files triggers immediate policy rescission ab initio and criminal referral.",
            "bounding_box": {"page": 15, "x0": 0.11, "y0": 0.40, "x1": 0.89, "y1": 0.52},
            "is_exclusion": True,
        },
        {
            "id": "c15",
            "section": "Section 15.0",
            "title": "Summary Claim Routing & Auto-Triage Rules",
            "page": 15,
            "text": "Autonomous triage rules: Claims with clear liability and zero exclusions are auto-approved; claims with verified Section 4 Reckless Lane Departure breaches (>0.85 confidence) are auto-denied; borderline incidents are flagged for tier-3 senior adjuster manual review.",
            "bounding_box": {"page": 15, "x0": 0.10, "y0": 0.68, "x1": 0.90, "y1": 0.85},
            "is_exclusion": False,
        },
    ]


def build_systemone_questions(segments: list[dict[str, Any]], clauses: list[dict[str, Any]], query: str) -> dict[str, Any]:
    """
    Constructs a massive 140+ question dictionary conforming precisely to NDI /v1/systemone specification.
    Includes:
    - 60 noul questions for segment activity
    - 60 choice questions for temporal boundary classification
    - 15 noul questions for policy clause violation checking
    - 5 score questions for severity, speed delta, exposure, safety
    - 1 choice question for final disposition triage
    Total: 141 questions in one parallel batch!
    """
    questions: dict[str, Any] = {}

    # 1. 60 noul questions: Is incident active in segment sXX?
    for seg in segments:
        seg_id = seg["id"]
        questions[f"{seg_id}_active"] = {
            "type": "noul",
            "instructions": f"The queried incident ({query}) is actively occurring in segment {seg_id} (timestamp {seg['t_start']}s to {seg['t_end']}s).",
            "criteria": {
                "true": f"Vehicle crossing line or emergency evasive action occurs in {seg_id}",
                "false": f"Normal transit or stationary shoulder idling in {seg_id}"
            }
        }

    # 2. 60 choice questions: Action boundary classification for each segment
    for seg in segments:
        seg_id = seg["id"]
        questions[f"{seg_id}_boundary"] = {
            "type": "choice",
            "instructions": f"Classify the temporal action boundary phase of segment {seg_id}.",
            "criteria": {
                "onset": "The exact commencement and boundary crossing of the incident",
                "continuation": "The active middle duration / critical apex of the incident",
                "offset": "The recovery, stabilization, or conclusion of the incident",
                "background": "Routine background driving or post-incident stationary idling"
            }
        }

    # 3. 15 noul questions: Does the incident trigger policy clause cXX?
    for clause in clauses:
        c_id = clause["id"]
        questions[f"violates_clause_{c_id}"] = {
            "type": "noul",
            "instructions": f"Does the incident evidence in active video segments trigger policy exclusion or rule {c_id} ({clause['title']})?",
            "criteria": {
                "true": f"Evidence substantiates breach of {clause['section']}",
                "false": f"No violation of {clause['section']} detected"
            }
        }

    # 4. 5 score questions: Severity, velocity, exposure, operator fault, evidence certainty
    questions["incident_severity"] = {
        "type": "score",
        "instructions": "Rate the overall physical and situational hazard severity of the incident.",
        "criteria": ["negligible", "minor", "moderate", "severe", "near_catastrophic"]
    }
    questions["speed_excess_tier"] = {
        "type": "score",
        "instructions": "Rate the degree of speed limit exceedance during the incident.",
        "criteria": ["within_limit", "1_to_5mph_over", "6_to_15mph_over", "16_to_25mph_over", "extreme_overspeed"]
    }
    questions["operator_culpability"] = {
        "type": "score",
        "instructions": "Assess operator culpability vs external unavoidable hazards.",
        "criteria": ["zero_culpability", "contributory_minor", "substantial_fault", "gross_recklessness"]
    }
    questions["liability_exposure_score"] = {
        "type": "score",
        "instructions": "Score the enterprise financial liability exposure on a 1-5 enterprise risk scale.",
        "criteria": ["low_risk", "guarded", "elevated", "high_exposure", "maximum_statutory_cap"]
    }
    questions["evidence_confidence_score"] = {
        "type": "score",
        "instructions": "Score optical clarity and telematics evidentiary certainty.",
        "criteria": ["ambiguous", "moderate", "high", "conclusive_telematics"]
    }

    # 5. Final claim routing decision (choice)
    questions["final_disposition"] = {
        "type": "choice",
        "instructions": "Determine the binding autonomous claim adjudication disposition based on Policy Section 4 exclusions and optical evidence.",
        "criteria": {
            "approve": "Clear commercial coverage, zero policy exclusions triggered, legitimate claim indemnity.",
            "deny": "Direct Policy Section 4.2 Reckless Lane Departure exclusion verified (>0.85 confidence). Indemnity denied.",
            "escalate": "Inconclusive optical evidence or complex liability requiring Tier-3 human adjuster review."
        }
    }

    return questions
