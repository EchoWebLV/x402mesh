#!/bin/bash

# Quick demo with REAL Solana transactions
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🔥 REAL SOLANA TRANSACTIONS DEMO                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Set environment
export REAL_TRANSACTIONS=true

echo "✅ Real transactions mode: ENABLED"
echo "🌐 Network: Solana Devnet"
echo ""

# Run the demo
REAL_TRANSACTIONS=true node demo/chain-demo.js


