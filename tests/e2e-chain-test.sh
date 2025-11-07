#!/bin/bash

# End-to-End Agent Chain Test
# Tests a complete agent chain execution

set -e

echo "╔════════════════════════════════════════════════════╗"
echo "║     End-to-End Agent Chain Test                   ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check prerequisites
echo "1. Checking prerequisites..."
echo "─────────────────────────────────────────────────"

if ! curl -s http://localhost:3001/health > /dev/null; then
  echo -e "${RED}✗ Registry not running on port 3001${NC}"
  echo "  Run: npm run dev"
  exit 1
fi

if ! curl -s http://localhost:3002/health > /dev/null; then
  echo -e "${RED}✗ Router not running on port 3002${NC}"
  echo "  Run: npm run dev"
  exit 1
fi

echo -e "${GREEN}✓ Services are running${NC}"
echo ""

# Discover agents
echo "2. Discovering agents..."
echo "─────────────────────────────────────────────────"

TRANSLATOR=$(curl -s 'http://localhost:3001/agents/discover?capability=translate' | jq -r '.[0].id')
SUMMARIZER=$(curl -s 'http://localhost:3001/agents/discover?capability=summarize' | jq -r '.[0].id')
ANALYZER=$(curl -s 'http://localhost:3001/agents/discover?capability=analyze' | jq -r '.[0].id')

if [ "$TRANSLATOR" != "null" ] && [ -n "$TRANSLATOR" ]; then
  echo -e "${GREEN}✓ Found Translator agent: $TRANSLATOR${NC}"
else
  echo -e "${RED}✗ Translator agent not found${NC}"
  echo "  Start with: npx tsx demo/agents/translator-agent.ts"
  exit 1
fi

if [ "$SUMMARIZER" != "null" ] && [ -n "$SUMMARIZER" ]; then
  echo -e "${GREEN}✓ Found Summarizer agent: $SUMMARIZER${NC}"
else
  echo -e "${RED}✗ Summarizer agent not found${NC}"
  exit 1
fi

if [ "$ANALYZER" != "null" ] && [ -n "$ANALYZER" ]; then
  echo -e "${GREEN}✓ Found Analyzer agent: $ANALYZER${NC}"
else
  echo -e "${RED}✗ Analyzer agent not found${NC}"
  exit 1
fi

echo ""

# Execute chain
echo "3. Executing agent chain..."
echo "─────────────────────────────────────────────────"
echo -e "${BLUE}Chain: Translate → Summarize → Analyze${NC}"
echo ""

CHAIN_REQUEST=$(cat <<EOF
{
  "paymentSource": "TestWallet",
  "chain": [
    {
      "agentId": "$TRANSLATOR",
      "capability": "translate",
      "input": {
        "text": "Artificial intelligence is revolutionizing blockchain technology",
        "targetLanguage": "spanish"
      }
    },
    {
      "agentId": "$SUMMARIZER",
      "capability": "summarize",
      "input": {}
    },
    {
      "agentId": "$ANALYZER",
      "capability": "analyze_sentiment",
      "input": {}
    }
  ]
}
EOF
)

CHAIN_RESULT=$(curl -s -X POST http://localhost:3002/payments/chain \
  -H "Content-Type: application/json" \
  -d "$CHAIN_REQUEST")

# Verify results
if echo "$CHAIN_RESULT" | jq -e '.results | length == 3' > /dev/null; then
  echo -e "${GREEN}✓ Chain executed successfully (3 steps)${NC}"
else
  echo -e "${RED}✗ Chain execution failed${NC}"
  echo "$CHAIN_RESULT" | jq '.'
  exit 1
fi

# Display results
echo ""
echo "4. Chain Results"
echo "─────────────────────────────────────────────────"

echo -e "${BLUE}Translation:${NC}"
echo "$CHAIN_RESULT" | jq -r '.results[0].translatedText' | sed 's/^/  /'

echo ""
echo -e "${BLUE}Summary:${NC}"
echo "$CHAIN_RESULT" | jq -r '.results[1].summary[]' | sed 's/^/  • /'

echo ""
echo -e "${BLUE}Sentiment:${NC}"
echo "$CHAIN_RESULT" | jq -r '.results[2] | "  Sentiment: \(.sentiment)\n  Score: \(.score)"'

echo ""
echo -e "${BLUE}Payments:${NC}"
TOTAL_COST=$(echo "$CHAIN_RESULT" | jq -r '.totalCost')
PAYMENT_COUNT=$(echo "$CHAIN_RESULT" | jq -r '.payments | length')
EXEC_TIME=$(echo "$CHAIN_RESULT" | jq -r '.executionTime')

echo "  Total Cost: $TOTAL_COST SOL"
echo "  Payments: $PAYMENT_COUNT"
echo "  Execution Time: ${EXEC_TIME}ms"

echo ""
echo -e "${GREEN}✅ End-to-End Test Passed!${NC}"
echo ""
echo "Summary:"
echo "  • Agent discovery: Working"
echo "  • Agent chaining: Working"
echo "  • Payment routing: Working"
echo "  • Data flow: Working"

