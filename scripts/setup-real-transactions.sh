#!/bin/bash

# Complete Real Transaction Setup Script
# Sets up everything needed for real Solana devnet transactions

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  🚀 Real Solana Transaction Setup                   ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check dependencies
echo -e "${BLUE}📦 Step 1/5: Checking dependencies...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js installed"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} npm installed"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}📦 Step 2/5: Installing dependencies...${NC}"
npm install --silent
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 3: Build packages
echo -e "${BLUE}🏗️  Step 3/5: Building packages...${NC}"
npm run build:core --silent
echo -e "${GREEN}✓${NC} Packages built"
echo ""

# Step 4: Setup environment
echo -e "${BLUE}🔧 Step 4/5: Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    bash scripts/setup-env.sh
else
    echo -e "${GREEN}✓${NC} .env file already exists"
fi
echo ""

# Step 5: Setup wallets
echo -e "${BLUE}💰 Step 5/5: Setting up Solana wallets...${NC}"
npx tsx scripts/setup-wallets.ts
echo ""

# Instructions
echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ Setup Complete!                                  ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo -e "${YELLOW}📝 Wallets Created:${NC}"
echo "   Check .wallets/ directory for keypairs"
echo ""
echo -e "${YELLOW}💵 Fund Your Wallets (REQUIRED):${NC}"
echo "   1. Get devnet SOL from: https://faucet.solana.com/"
echo "   2. Fund each wallet address shown above"
echo "   3. Each wallet needs ~0.1 SOL for transactions"
echo ""
echo -e "${YELLOW}🔑 Optional: Add OpenAI API Key${NC}"
echo "   1. Edit: .env"
echo "   2. Set: OPENAI_API_KEY=sk-your-key-here"
echo "   3. Get key: https://platform.openai.com/api-keys"
echo ""
echo -e "${YELLOW}🚀 Run Real Transactions:${NC}"
echo "   npm run demo:real"
echo ""
echo -e "${YELLOW}🌐 Or start web UI with real transactions:${NC}"
echo "   Terminal 1: npm run start:all"
echo "   Terminal 2: npm run web"
echo ""
echo -e "${GREEN}Ready to go!${NC} 🎉"
echo ""

