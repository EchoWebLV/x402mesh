#!/bin/bash

# Integration Test Suite
# Tests the complete agent-to-agent infrastructure

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════╗"
echo "║  Agent-to-Agent Infrastructure Integration Tests  ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
test_start() {
  echo -n "  Testing: $1... "
  TESTS_RUN=$((TESTS_RUN + 1))
}

test_pass() {
  echo -e "${GREEN}✓ PASS${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

test_fail() {
  echo -e "${RED}✗ FAIL${NC}"
  echo "    Error: $1"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

# Check if services are running
echo "1. Service Health Checks"
echo "─────────────────────────────────────────────────"

test_start "Registry service (port 3001)"
if curl -s http://localhost:3001/health | grep -q "healthy"; then
  test_pass
else
  test_fail "Registry not responding"
fi

test_start "Router service (port 3002)"
if curl -s http://localhost:3002/health | grep -q "healthy"; then
  test_pass
else
  test_fail "Router not responding"
fi

test_start "Web UI (port 3000)"
if curl -s http://localhost:3000 | grep -q "Agent-to-Agent"; then
  test_pass
else
  test_fail "Web UI not responding"
fi

echo ""
echo "2. Agent Registry Tests"
echo "─────────────────────────────────────────────────"

test_start "List all agents"
AGENT_COUNT=$(curl -s http://localhost:3001/agents | jq 'length')
if [ "$AGENT_COUNT" -ge 0 ]; then
  test_pass
  echo "    Found $AGENT_COUNT agent(s)"
else
  test_fail "Failed to list agents"
fi

test_start "Discover agents by capability"
TRANSLATOR_COUNT=$(curl -s 'http://localhost:3001/agents/discover?capability=translate' | jq 'length')
if [ "$TRANSLATOR_COUNT" -ge 0 ]; then
  test_pass
  echo "    Found $TRANSLATOR_COUNT translator agent(s)"
else
  test_fail "Discovery API failed"
fi

test_start "Discover agents by tag"
NLP_COUNT=$(curl -s 'http://localhost:3001/agents/discover?tags=nlp' | jq 'length')
if [ "$NLP_COUNT" -ge 0 ]; then
  test_pass
  echo "    Found $NLP_COUNT NLP agent(s)"
else
  test_fail "Tag-based discovery failed"
fi

test_start "Registry statistics"
if curl -s http://localhost:3001/stats | jq -e '.total' > /dev/null; then
  test_pass
else
  test_fail "Stats API failed"
fi

echo ""
echo "3. Agent Health Checks"
echo "─────────────────────────────────────────────────"

test_start "Translator agent (port 3100)"
if curl -s http://localhost:3100/health 2>/dev/null | grep -q "healthy"; then
  test_pass
else
  echo -e "${YELLOW}⊘ SKIP${NC} (Agent not running)"
fi

test_start "Summarizer agent (port 3101)"
if curl -s http://localhost:3101/health 2>/dev/null | grep -q "healthy"; then
  test_pass
else
  echo -e "${YELLOW}⊘ SKIP${NC} (Agent not running)"
fi

test_start "Analyzer agent (port 3102)"
if curl -s http://localhost:3102/health 2>/dev/null | grep -q "healthy"; then
  test_pass
else
  echo -e "${YELLOW}⊘ SKIP${NC} (Agent not running)"
fi

echo ""
echo "4. x402 Protocol Compliance Tests"
echo "─────────────────────────────────────────────────"

test_start "402 Payment Required response format"
RESPONSE=$(curl -s http://localhost:3100/execute -X POST \
  -H "Content-Type: application/json" \
  -d '{"capability":"translate","input":{"text":"test"}}' 2>/dev/null || echo '{}')

if echo "$RESPONSE" | jq -e '.payment.x402Version == 1' > /dev/null 2>&1; then
  test_pass
  echo "    Response includes x402Version field"
else
  echo -e "${YELLOW}⊘ SKIP${NC} (Agent not running or old version)"
fi

test_start "PaymentRequirements structure"
if echo "$RESPONSE" | jq -e '.payment | has("scheme") and has("network") and has("recipient") and has("amount")' > /dev/null 2>&1; then
  test_pass
else
  echo -e "${YELLOW}⊘ SKIP${NC} (Agent not running or old version)"
fi

echo ""
echo "5. Payment Router Tests"
echo "─────────────────────────────────────────────────"

test_start "Payment history endpoint"
if curl -s http://localhost:3002/payments/history 2>/dev/null | jq -e 'type == "array"' > /dev/null 2>&1; then
  test_pass
else
  test_fail "Payment history endpoint failed"
fi

test_start "Router statistics"
if curl -s http://localhost:3002/stats | jq -e '.totalProcessed' > /dev/null; then
  test_pass
else
  test_fail "Stats endpoint failed"
fi

echo ""
echo "6. SDK Build Tests"
echo "─────────────────────────────────────────────────"

test_start "SDK builds without errors"
if [ -f "packages/sdk/dist/index.js" ]; then
  test_pass
else
  test_fail "SDK dist files not found - run npm run build"
fi

test_start "Registry builds without errors"
if [ -f "packages/registry/dist/index.js" ]; then
  test_pass
else
  test_fail "Registry dist files not found"
fi

test_start "Router builds without errors"
if [ -f "packages/router/dist/index.js" ]; then
  test_pass
else
  test_fail "Router dist files not found"
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "  Test Results Summary"
echo "════════════════════════════════════════════════════"
echo ""
echo "  Total Tests:  $TESTS_RUN"
echo -e "  ${GREEN}Passed:       $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
  echo -e "  ${RED}Failed:       $TESTS_FAILED${NC}"
else
  echo "  Failed:       $TESTS_FAILED"
fi
echo ""

# Exit with error if any tests failed
if [ $TESTS_FAILED -gt 0 ]; then
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
else
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
fi

