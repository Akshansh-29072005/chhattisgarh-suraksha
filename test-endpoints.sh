#!/bin/bash

# Production Endpoint Test Script
# Tests all major API endpoints

BASE_URL="http://localhost"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🧪 Testing Chhattisgarh Suraksha API Endpoints"
echo "=============================================="
echo ""

test_endpoint() {
    endpoint=$1
    name=$2

    response=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${endpoint}")

    if [ "$response" = "200" ] || [ "$response" = "201" ]; then
        echo -e "${GREEN}✓${NC} $name: $response"
        return 0
    else
        echo -e "${RED}✗${NC} $name: $response"
        return 1
    fi
}

# Test public endpoints
echo "📡 Public Endpoints:"
test_endpoint "/api/status" "Health Check"
test_endpoint "/api/ml/hotspots" "ML Hotspots"
test_endpoint "/api/ml/forecast" "ML Forecast"
test_endpoint "/api/ml/risk-assessment" "ML Risk Assessment"
test_endpoint "/api/ml/patterns" "ML Patterns"
test_endpoint "/api/forum/topics" "Forum Topics"
test_endpoint "/api/analytics/data" "Analytics Data"
test_endpoint "/api/analytics/statistics" "Statistics"
test_endpoint "/api/users/leaderboard" "Leaderboard"

echo ""
echo "🎯 Testing Response Format:"
response=$(curl -s "${BASE_URL}/api/ml/hotspots")
if echo "$response" | jq -e '.success' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} JSON response valid"
else
    echo -e "${RED}✗${NC} JSON response invalid"
fi

echo ""
echo "📊 Quick Stats:"
echo "- ML Hotspots: $(curl -s ${BASE_URL}/api/ml/hotspots | jq -r '.data | length') locations"
echo "- Forum Topics: $(curl -s ${BASE_URL}/api/forum/topics | jq -r '.data.total // 0') topics"
echo ""
echo "✅ Test complete!"
echo "Access frontend at: ${BASE_URL}"
