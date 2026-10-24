#!/usr/bin/env bash
# SkillVerse API Test Script (curl)
# Tests: Health check, Registration, Login, Protected Me, Save Retrieval, and Save Upsert

BASE_URL="http://localhost:5000/api"
TEST_USER="child_$(date +%s)"
TEST_EMAIL="${TEST_USER}@school.edu"
TEST_PASS="learn123!"

echo "=========================================="
echo "SkillVerse Backend API Test Suite"
echo "Base URL: $BASE_URL"
echo "=========================================="

echo -e "\n1. Checking Server Health..."
curl -s -X GET "${BASE_URL}/health" | jq . || curl -s -X GET "${BASE_URL}/health"

echo -e "\n\n2. Registering New Student ($TEST_USER)..."
REGISTER_RES=$(curl -s -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$TEST_USER\", \"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASS\"}")
echo "$REGISTER_RES"

TOKEN=$(echo "$REGISTER_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "\n\n2b. Registration token missing, attempting login..."
  LOGIN_RES=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"$TEST_PASS\"}")
  echo "$LOGIN_RES"
  TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo -e "\nCaptured JWT Token: ${TOKEN:0:20}..."

echo -e "\n\n3. Testing Protected /api/auth/me..."
curl -s -X GET "${BASE_URL}/auth/me" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n4. Getting Initial Save (Expect empty/null)..."
curl -s -X GET "${BASE_URL}/save" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n5. Saving Day 1 Progress (PUT /api/save)..."
curl -s -X PUT "${BASE_URL}/save" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "schemaVersion": 1,
    "day": 1,
    "state": {
      "coins": 175,
      "xp": 40,
      "day": 1,
      "sustainability": 85,
      "skills": { "life": 10, "human": 5, "digital": 15, "vocational": 5, "entrepreneurial": 0 },
      "flags": { "home_leak_repaired": true, "farmWaterEfficiencyPct": 90 }
    },
    "worldProgress": {
      "home": { "leakRepaired": true },
      "farm": { "completed": true, "waterEfficiencyPct": 90 }
    }
  }'

echo -e "\n\n6. Retrieving Stored Save (GET /api/save)..."
curl -s -X GET "${BASE_URL}/save" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=========================================="
echo "API Test Suite Finished!"
echo "=========================================="
