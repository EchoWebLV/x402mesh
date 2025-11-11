#!/bin/bash

# Stop all demo services

echo ""
echo "🛑 Stopping x402mesh Demo Environment..."
echo ""

# Read PIDs from file
if [ -f ".demo_pids" ]; then
    PIDS=$(cat .demo_pids)
    kill $PIDS 2>/dev/null
    rm .demo_pids
    echo "✅ All demo services stopped"
else
    # Fallback: kill by port
    echo "⚠️  .demo_pids not found, killing by port..."
    lsof -ti:3000,3001,3002,3100,3101,3102,3103,3104 | xargs kill -9 2>/dev/null || true
    echo "✅ Processes on demo ports terminated"
fi

# Stop PostgreSQL (if using Docker)
docker compose down 2>/dev/null || true

echo ""
echo "✨ Demo environment cleaned up"
echo ""

