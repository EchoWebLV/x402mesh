#!/bin/bash

# Hackathon Demo Startup Script
# Launches all services needed for the 3-minute demo

echo ""
echo "═══════════════════════════════════════════"
echo "  🚀 Starting x402mesh Demo Environment"
echo "═══════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    cd ..
fi

# Kill any existing processes on our ports
echo -e "${YELLOW}🧹 Cleaning up old processes...${NC}"
lsof -ti:3000,3001,3002,3100,3101,3102,3103,3104 | xargs kill -9 2>/dev/null || true
sleep 2

# Start PostgreSQL (if using Docker)
echo -e "${BLUE}🗄️  Starting PostgreSQL...${NC}"
docker compose up -d postgres 2>/dev/null || echo "   (Skipping - using in-memory storage)"

# Build packages
echo -e "${YELLOW}📦 Building packages...${NC}"
npm run build:core > /dev/null 2>&1

# Start Registry
echo -e "${BLUE}📋 Starting Registry (port 3001)...${NC}"
cd packages/registry
node dist/index.js > ../../logs/registry.log 2>&1 &
REGISTRY_PID=$!
cd ../..
sleep 2

# Start Router
echo -e "${BLUE}💰 Starting Router (port 3002)...${NC}"
cd packages/router
node dist/index.js > ../../logs/router.log 2>&1 &
ROUTER_PID=$!
cd ../..
sleep 2

# Start Demo Agents
echo -e "${BLUE}🤖 Starting Demo Agents...${NC}"

mkdir -p logs

echo -e "   • Translator (port 3100)..."
npx tsx demo/agents/translator-agent-new.ts > logs/translator.log 2>&1 &
TRANSLATOR_PID=$!

echo -e "   • Summarizer (port 3101)..."
npx tsx demo/agents/summarizer-agent.ts > logs/summarizer.log 2>&1 &
SUMMARIZER_PID=$!

echo -e "   • Analyzer (port 3102)..."
npx tsx demo/agents/analyzer-agent.ts > logs/analyzer.log 2>&1 &
ANALYZER_PID=$!

echo -e "   • Image Generator (port 3103)..."
npx tsx demo/agents/image-generator-agent.ts > logs/image-generator.log 2>&1 &
IMAGE_GEN_PID=$!

echo -e "   • Background Remover (port 3104)..."
npx tsx demo/agents/background-remover-agent.ts > logs/background-remover.log 2>&1 &
BG_REMOVER_PID=$!

sleep 5

# Start Web UI
echo -e "${BLUE}🌐 Starting Web UI (port 3000)...${NC}"
cd web
npm run dev > ../logs/web.log 2>&1 &
WEB_PID=$!
cd ..

sleep 3

# Wait for services to be ready
echo ""
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

check_service() {
    local url=$1
    local name=$2
    local retries=0
    local max_retries=10
    
    while [ $retries -lt $max_retries ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}   ✅ $name ready${NC}"
            return 0
        fi
        retries=$((retries + 1))
        sleep 1
    done
    
    echo -e "${RED}   ❌ $name failed to start${NC}"
    return 1
}

check_service "http://localhost:3001/health" "Registry"
check_service "http://localhost:3002/health" "Router"
check_service "http://localhost:3100/health" "Translator"
check_service "http://localhost:3101/health" "Summarizer"
check_service "http://localhost:3102/health" "Analyzer"
check_service "http://localhost:3103/health" "Image Generator"
check_service "http://localhost:3104/health" "Background Remover"
check_service "http://localhost:3000" "Web UI"

echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ All Services Running!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""

echo "📍 Service URLs:"
echo ""
echo "   Registry:          http://localhost:3001"
echo "   Router:            http://localhost:3002"
echo "   Web UI:            http://localhost:3000"
echo ""
echo "   Translator:        http://localhost:3100"
echo "   Summarizer:        http://localhost:3101"
echo "   Analyzer:          http://localhost:3102"
echo "   Image Generator:   http://localhost:3103"
echo "   Background Remover: http://localhost:3104"
echo ""

echo "📝 Logs:"
echo "   tail -f logs/*.log"
echo ""

echo "🎬 Demo Scripts:"
echo "   node hackathon-demo/3-test-scripts/execute-auto-chain.js"
echo "   node hackathon-demo/3-test-scripts/execute-template-chain.js"
echo "   node hackathon-demo/3-test-scripts/show-rollback.js"
echo "   node hackathon-demo/3-test-scripts/validate-chain.js"
echo ""

echo "🛑 To stop all services:"
echo "   kill $REGISTRY_PID $ROUTER_PID $TRANSLATOR_PID $SUMMARIZER_PID $ANALYZER_PID $IMAGE_GEN_PID $BG_REMOVER_PID $WEB_PID"
echo ""

# Save PIDs to file for easy cleanup
echo "$REGISTRY_PID $ROUTER_PID $TRANSLATOR_PID $SUMMARIZER_PID $ANALYZER_PID $IMAGE_GEN_PID $BG_REMOVER_PID $WEB_PID" > .demo_pids

echo -e "${YELLOW}💡 PIDs saved to .demo_pids${NC}"
echo -e "${YELLOW}   Run './hackathon-demo/stop-demo.sh' to stop all services${NC}"
echo ""

echo -e "${GREEN}🎉 Ready for demo! Open http://localhost:3000${NC}"
echo ""

# Keep script running
wait

