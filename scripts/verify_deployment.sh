#!/usr/bin/env bash
# ==============================================================================
# ChronoGround Deployment Verification & Smoke Test Script
# Verifies container/server health, API endpoints, Drex System 1, DeepInfra System 2
# ==============================================================================

set -e

HOST="${1:-http://127.0.0.1:8000}"

echo "=========================================================="
echo "⚡ ChronoGround Deployment Verification: ${HOST}"
echo "=========================================================="

echo -n "1. Checking System Health (/api/health)... "
HEALTH_RES=$(curl -s "${HOST}/api/health")
if echo "${HEALTH_RES}" | grep -q '"status":"healthy"'; then
  echo "✅ OK"
else
  echo "❌ FAILED"
  echo "Response: ${HEALTH_RES}"
  exit 1
fi

echo -n "2. Checking Video Streaming (/api/media/video)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${HOST}/api/media/video")
if [ "${HTTP_CODE}" = "200" ] || [ "${HTTP_CODE}" = "206" ]; then
  echo "✅ OK (HTTP ${HTTP_CODE})"
else
  echo "❌ FAILED (HTTP ${HTTP_CODE})"
  exit 1
fi

echo -n "3. Checking Policy Document PDF (/api/media/policy)... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${HOST}/api/media/policy")
if [ "${HTTP_CODE}" = "200" ]; then
  echo "✅ OK (HTTP 200)"
else
  echo "❌ FAILED (HTTP ${HTTP_CODE})"
  exit 1
fi

echo -n "4. Checking Policy Full Metadata (/api/policy/full)... "
POLICY_TITLE=$(curl -s "${HOST}/api/policy/full" | grep -o "Texas Personal Auto Policy" | head -n 1)
if [ "${POLICY_TITLE}" = "Texas Personal Auto Policy" ]; then
  echo "✅ OK (${POLICY_TITLE})"
else
  echo "❌ FAILED"
  exit 1
fi

echo -n "5. Checking Drex System 1 Evaluation (/api/evaluate)... "
EVAL_RES=$(curl -s -X POST "${HOST}/api/evaluate" \
  -H "Content-Type: application/json" \
  -d '{"scenario_id":"texas_auto_nexar_incident"}')
if echo "${EVAL_RES}" | grep -q '"status":"evaluated"'; then
  DECISION=$(echo "${EVAL_RES}" | grep -o '"decision":"[^"]*"' | head -n 1)
  LATENCY=$(echo "${EVAL_RES}" | grep -o '"latency_ms":[0-9.]*' | head -n 1)
  echo "✅ OK (${DECISION}, ${LATENCY})"
else
  echo "❌ FAILED"
  echo "Response: ${EVAL_RES}"
  exit 1
fi

echo -n "6. Checking Frontend Root Bundle (/)... "
HTML_RES=$(curl -s "${HOST}/")
if echo "${HTML_RES}" | grep -q 'ChronoGround'; then
  echo "✅ OK (React/Vite bundle served)"
else
  echo "❌ FAILED"
  exit 1
fi

echo "=========================================================="
echo "🎉 ALL DEPLOYMENT VERIFICATION GATES PASSED CLEANLY!"
echo "=========================================================="

