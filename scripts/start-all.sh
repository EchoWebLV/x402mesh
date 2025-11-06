#!/bin/bash

# Start All Services Script
# This script starts all backend services and agents for the Agent-to-Agent Payment Router

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🤖 Starting Agent-to-Agent Payment Router          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if packages are built
if [ ! -d "packages/registry/dist" ] || [ ! -d "packages/router/dist" ] || [ ! -d "packages/sdk/dist" ]; then
    echo -e "${YELLOW}⚙️  Packages not built. Building...${NC}"
    npm run build:core
    echo ""
fi

# Kill any existing processes on our ports
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
lsof -ti:3002 | xargs kill -9 2>/dev/null || true
lsof -ti:3100 | xargs kill -9 2>/dev/null || true
lsof -ti:3101 | xargs kill -9 2>/dev/null || true
lsof -ti:3102 | xargs kill -9 2>/dev/null || true
sleep 1

# Start services in background
echo -e "${GREEN}🚀 Starting services...${NC}"
echo ""

# Start Registry
echo "Starting Registry Service (port 3001)..."
npx tsx packages/registry/src/index.ts > /dev/null 2>&1 &
REGISTRY_PID=$!
sleep 2

# Start Payment Router
echo "Starting Payment Router (port 3002)..."
npx tsx packages/router/src/index.ts > /dev/null 2>&1 &
ROUTER_PID=$!
sleep 2

# Start Agents
echo "Starting Translator Agent (port 3100)..."
npx tsx demo/agents/translator-agent.ts > /dev/null 2>&1 &
TRANSLATOR_PID=$!
sleep 1

echo "Starting Summarizer Agent (port 3101)..."
npx tsx demo/agents/summarizer-agent.ts > /dev/null 2>&1 &
SUMMARIZER_PID=$!
sleep 1

echo "Starting Analyzer Agent (port 3102)..."
npx tsx demo/agents/analyzer-agent.ts > /dev/null 2>&1 &
ANALYZER_PID=$!
sleep 2

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  📡 Services Running                                 ║"
echo "╠═══════════════════════════════════════════════════════╣"
echo "║  Registry:    http://localhost:3001                  ║"
echo "║  Router:      http://localhost:3002                  ║"
echo "║  Translator:  http://localhost:3100                  ║"
echo "║  Summarizer:  http://localhost:3101                  ║"
echo "║  Analyzer:    http://localhost:3102                  ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. Start web UI: npm run web"
echo "   2. Open http://localhost:3000"
echo "   3. Connect your Phantom wallet"
echo "   4. Execute an agent chain!"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Trap Ctrl+C to kill all background processes
trap 'echo ""; echo "Stopping all services..."; kill $REGISTRY_PID $ROUTER_PID $TRANSLATOR_PID $SUMMARIZER_PID $ANALYZER_PID 2>/dev/null; exit 0' INT

# Wait for processes
wait


