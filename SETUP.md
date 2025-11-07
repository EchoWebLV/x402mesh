# 🚀 Setup Guide

Complete setup instructions for the Agent-to-Agent Payment Router.

**Quick Links:**
- [30-Second Quick Start](#quick-setup-5-minutes) 
- [Real Transactions Setup](#real-solana-transactions)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](./DEPLOYMENT.md)

---

## Prerequisites

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Phantom Wallet** (browser extension) for web UI
- **Solana CLI** (optional, for advanced features)

## Quick Setup (5 minutes)

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/agent-2-agent-infra.git
cd agent-2-agent-infra
npm install
```

### 2. Build Packages

```bash
npm run build:core
```

This builds the three core packages:
- `@a2a/registry` - Agent Discovery Registry
- `@a2a/router` - Payment Router
- `@a2a/sdk` - Agent SDK

### 3. Start Backend Services

**Option A: All-in-One (Recommended)**
```bash
npm run start:all
```

This starts:
- Registry Service (port 3001)
- Payment Router (port 3002)
- Translator Agent (port 3100)
- Summarizer Agent (port 3101)
- Analyzer Agent (port 3102)

**Option B: Manual (for development)**
```bash
# Terminal 1 - Registry & Router
npm run dev

# Terminal 2 - Translator
npx tsx demo/agents/translator-agent.ts

# Terminal 3 - Summarizer
npx tsx demo/agents/summarizer-agent.ts

# Terminal 4 - Analyzer
npx tsx demo/agents/analyzer-agent.ts
```

### 4. Start Web UI

In a **new terminal**:

```bash
npm run web
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Connect Phantom Wallet

1. Install [Phantom Wallet](https://phantom.app/) browser extension
2. Switch to **Devnet** in settings
3. Click "Connect Wallet" in the web UI
4. Approve the connection

## Verifying Setup

Run the verification script:

```bash
npm run verify
```

Should show:
```
✅ SDK (built)
✅ Registry (built)
✅ Router (built)
✅ All demo agents present
✅ Documentation complete
```

## Testing the System

### Option 1: Web UI Demo

1. Start backend: `npm run start:all`
2. Start web: `npm run web`
3. Connect Phantom wallet
4. Click "Execute Agent Chain"
5. Watch agents collaborate in real-time

### Option 2: CLI Demo

```bash
npm run demo:chain
```

This runs a beautiful CLI demo showing agent collaboration.

### Option 3: Real Solana Transactions

```bash
# Setup wallets first
npm run setup:wallets

# Run with real transactions
npm run demo:real
```

⚠️ **Note**: This uses real Solana devnet transactions (slower but verifiable on-chain).

## Environment Variables (Optional)

Create `.env` in project root:

```env
# Optional: Use real OpenAI for summarization
OPENAI_API_KEY=your_openai_key_here

# Optional: Custom RPC endpoint
SOLANA_RPC_URL=https://api.devnet.solana.com

# Optional: Real transactions by default
REAL_TRANSACTIONS=false
```

## Ports Used

| Service | Port | URL |
|---------|------|-----|
| Registry | 3001 | http://localhost:3001 |
| Router | 3002 | http://localhost:3002 |
| Translator | 3100 | http://localhost:3100 |
| Summarizer | 3101 | http://localhost:3101 |
| Analyzer | 3102 | http://localhost:3102 |
| Web UI | 3000 | http://localhost:3000 |

## Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:3100 | xargs kill -9
lsof -ti:3101 | xargs kill -9
lsof -ti:3102 | xargs kill -9
```

### Packages Not Built

```bash
npm run clean
npm install
npm run build:core
```

### Web UI Can't Connect

1. Make sure backend is running: `npm run start:all`
2. Check browser console for errors
3. Verify ports are accessible: `curl http://localhost:3001/health`

### Phantom Wallet Issues

1. Switch to **Devnet** in Phantom settings
2. Refresh the page
3. Clear browser cache
4. Reinstall Phantom extension if needed

## Development Mode

For active development with hot reload:

```bash
# Terminal 1 - Services with hot reload
npm run dev

# Terminal 2 - Web with hot reload
npm run web

# Agents need to be restarted manually for now
```

## Production Deployment

### Backend

```bash
# Build all packages
npm run build

# Deploy registry and router to your server
# Use PM2 or similar for process management
pm2 start packages/registry/dist/index.js --name registry
pm2 start packages/router/dist/index.js --name router
```

### Frontend

```bash
# Build web UI
npm run web:build

# Deploy web/.next to Vercel, Netlify, or your hosting
```

## Next Steps

- ✅ Read [Getting Started Guide](./docs/GETTING_STARTED.md)
- ✅ Check [API Documentation](./docs/API.md)
- ✅ Review [Architecture](./docs/ARCHITECTURE.md)
- ✅ Build your own agent using the SDK

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/agent-2-agent-infra/issues)
- **Docs**: [Full Documentation](./docs/)
- **Demo**: Run `npm run demo:chain`

---

**Made with ❤️ for Solana x402 Hackathon**


