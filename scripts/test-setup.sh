#!/bin/bash

# Comprehensive Test Script
# Tests that everything is set up correctly

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🧪 Testing Agent-to-Agent Infrastructure           ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $1"
        ((FAIL++))
    fi
}

echo "📦 Checking Dependencies..."
echo ""

# Check Node
node --version > /dev/null 2>&1
check "Node.js installed"

# Check npm
npm --version > /dev/null 2>&1
check "npm installed"

echo ""
echo "🏗️  Checking Build Output..."
echo ""

# Check built packages
[ -d "packages/registry/dist" ]
check "Registry package built"

[ -d "packages/router/dist" ]
check "Router package built"

[ -d "packages/sdk/dist" ]
check "SDK package built"

echo ""
echo "📁 Checking Files..."
echo ""

# Check important files
[ -f "README.md" ]
check "README.md exists"

[ -f "SETUP.md" ]
check "SETUP.md exists"

[ -f "QUICKSTART.md" ]
check "QUICKSTART.md exists"

[ -f "package.json" ]
check "package.json exists"

[ -f "demo/chain-demo.js" ]
check "Demo script exists"

echo ""
echo "🤖 Checking Agents..."
echo ""

[ -f "demo/agents/translator-agent.ts" ]
check "Translator agent exists"

[ -f "demo/agents/summarizer-agent.ts" ]
check "Summarizer agent exists"

[ -f "demo/agents/analyzer-agent.ts" ]
check "Analyzer agent exists"

echo ""
echo "📚 Checking Documentation..."
echo ""

[ -f "docs/GETTING_STARTED.md" ]
check "Getting Started guide exists"

[ -f "docs/API.md" ]
check "API documentation exists"

[ -f "docs/ARCHITECTURE.md" ]
check "Architecture docs exist"

[ -f "docs/WEB_UI.md" ]
check "Web UI docs exist"

[ -f "HACKATHON_SUBMISSION.md" ]
check "Hackathon submission exists"

echo ""
echo "🌐 Checking Web UI..."
echo ""

[ -d "web" ]
check "Web directory exists"

[ -f "web/package.json" ]
check "Web package.json exists"

[ -f "web/src/app/page.tsx" ]
check "Web UI page exists"

[ -f "web/src/components/AgentChain.tsx" ]
check "AgentChain component exists"

[ -f "web/src/components/PaymentTracker.tsx" ]
check "PaymentTracker component exists"

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  📊 Test Results                                     ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo -e "║  ${GREEN}Passed: $PASS${NC}                                         "
echo -e "║  ${RED}Failed: $FAIL${NC}                                         "
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! System is ready.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start backend: npm run start:all"
    echo "  2. Start web UI: npm run web"
    echo "  3. Open http://localhost:3000"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix and try again.${NC}"
    echo ""
    echo "Try running: npm install && npm run build:core"
    echo ""
    exit 1
fi


