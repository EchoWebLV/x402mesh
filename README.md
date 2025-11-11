# x402mesh - Agent Payment Infrastructure

[![License](https://img.shields.io/badge/license-MIT-blue)]() [![Solana](https://img.shields.io/badge/solana-devnet-purple)]()

A complete infrastructure platform enabling AI agents to discover, transact, and collaborate autonomously using Solana blockchain.

## What is x402mesh?

x402mesh is **the missing infrastructure for the agent economy**. It provides:

- 🔍 **Agent Registry** - Discover and register AI agents with searchable capabilities
- 💰 **Payment Router** - Automatic micropayments with x402 protocol on Solana
- ⛓️ **Hybrid Chain Execution** - Agents compose seamlessly via auto-chaining + template variables
- 🤖 **AI-Powered Chain Builder** - GPT-4o automatically generates optimal agent chains
- 🛡️ **Automatic Rollback** - Failed chains refund payments automatically
- 🛠️ **Developer SDK** - Build payment-enabled agents in minutes
- 🌐 **Web Interface** - Beautiful UI with Phantom wallet integration

### The Composability Breakthrough

**Problem:** Agents built by different developers can't work together because their input/output formats don't match.

**Solution:** x402mesh implements a hybrid approach:
- **Auto-chaining** - Standard schemas enable automatic composition
- **Template variables** - `{{step0.field}}` for precise field mapping
- **Validation** - Pre-execution checks catch errors before payment
- **AI Assistance** - GPT-4o generates optimal chains from natural language

This makes agents truly composable in a decentralized marketplace.

### 🤖 AI-Powered Features

- **Smart Chain Builder** - Describe what you want in plain English, AI builds the optimal chain
- **Automatic Agent Selection** - AI analyzes available agents and selects the best fit
- **Code Generation** - Get production-ready TypeScript code instantly
- **Natural Language Interface** - "Generate an orc image without background" → complete chain

### 🛡️ Reliability Features

- **Automatic Rollback** - If any step fails, all previous payments are refunded automatically
- **Pre-Payment Health Checks** - Agents verified as online before charging
- **Agent Heartbeat Monitoring** - 30-second heartbeats track agent availability
- **Transaction Audit Trail** - Full payment history on Solana blockchain

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Optional: Phantom Wallet (for web UI)

### Installation

**Install from npm:**
```bash
# Install SDK
npm install x402mesh-sdk

# Install CLI globally
npm install -g x402mesh-cli
```

**Or clone from source:**
```bash
git clone https://github.com/yordanlasonov/agent-2-agent-infra.git
cd agent-2-agent-infra
npm install && npm run build
```

### Run the Demo

```bash
# Start all services
./scripts/start-all.sh

# In another terminal, run the demo
node test-hybrid-chain.js
```

### Try the Web UI

```bash
# Start web interface
npm run web

# Open http://localhost:3000
```

### Environment Variables (Optional)

Create `.env` file for AI features:

```bash
# Core Services
REGISTRY_PORT=3001
ROUTER_PORT=3002
REAL_TRANSACTIONS=false  # Set to true for actual Solana transactions

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com

# AI Integrations (all optional - graceful fallbacks available)
OPENAI_API_KEY=sk-...              # For translation, summarization, chain building
GEMINI_API_KEY=...                 # For AI image generation
REMOVEBG_API_KEY=...               # For background removal

# Database (optional - falls back to in-memory)
DATABASE_URL=postgresql://user:pass@localhost:5432/x402mesh
```

---

## Core Features

### 1. Agent Registry

Register and discover agents with full capability metadata:

```typescript
import { RegistryClient } from 'x402mesh-sdk';

const registry = new RegistryClient();

// Register your agent
await registry.registerAgent({
  name: 'My Agent',
  description: 'Does amazing things',
  capabilities: [{
    name: 'process',
    schema: 'text_processing_v1',  // Standard schema for auto-chaining
    pricing: { amount: 0.01, currency: 'USDC', model: 'per_request' }
  }],
  walletAddress: 'your-solana-wallet',
  endpoint: 'https://your-agent.com'
});

// Find agents
const agents = await registry.searchAgents({ tag: 'translation' });
```

### 2. Payment Router

Process payments with x402 protocol on Solana:

```typescript
import { PaymentClient } from 'x402mesh-sdk';

const client = new PaymentClient();

const result = await client.processPayment({
  from: 'buyer-wallet',
  to: 'seller-wallet',
  amount: 0.01,
  currency: 'USDC',
  serviceId: 'translation'
});
```

### 3. Hybrid Chain Execution

Chain agents together with **three powerful approaches**:

#### Auto-Chaining (Recommended)
```typescript
const result = await client.executeChain({
  paymentSource: 'your-wallet',
  chain: [
    {
      agentId: 'translator-agent',
      capability: 'translate',
      input: { text: 'Hello world', targetLanguage: 'es' }
    },
    {
      agentId: 'summarizer-agent',
      capability: 'summarize'
      // ✨ No input needed - auto-chains from translator!
    }
  ]
});
```

#### Template Variables
```typescript
const result = await client.executeChain({
  paymentSource: 'your-wallet',
  chain: [
    {
      agentId: 'translator-agent',
      capability: 'translate',
      input: { text: 'I love this!', targetLanguage: 'es' }
    },
    {
      agentId: 'analyzer-agent',
      capability: 'analyze_sentiment',
      input: {
        text: '{{step0.text}}'  // Extract specific field
      }
    }
  ]
});
```

#### AI-Powered Chain Generation
```typescript
// Just describe what you want!
POST /api/generate-chain
{
  "prompt": "Translate text to Spanish and analyze sentiment",
  "agents": [...available agents...]
}

// Response includes optimized chain + TypeScript code
```

**Safety Features:**
- ✅ Pre-execution validation catches errors before payment
- ✅ Health checks verify agents are online
- ✅ Automatic rollback refunds all payments if chain fails
- ✅ Full transaction tracking on Solana

### 4. Build Agents in Minutes

```typescript
import { Agent } from 'x402mesh-sdk';

class MyAgent extends Agent {
  constructor(walletAddress: string) {
    super({
      name: 'My Agent',
      capabilities: [{
        name: 'process',
        schema: 'text_processing_v1',  // Standard schema for auto-chaining
        inputSchema: { text: 'string' },
        outputSchema: { text: 'string' },
        pricing: { amount: 0.01, currency: 'USDC', model: 'per_request' }
      }],
      walletAddress,
      port: 3100
    });
  }

  async execute(capability: string, input: any) {
    if (capability === 'process') {
      return { text: input.text.toUpperCase() };
    }
    throw new Error('Unknown capability');
  }
}

// That's it! SDK automatically handles:
// ✅ HTTP server setup
// ✅ x402 payment verification
// ✅ Registry registration
// ✅ Health check endpoint
// ✅ Heartbeat system
// ✅ Payment validation

const agent = new MyAgent('your-wallet');
await agent.start();
```

### 5. Chain Validation

Validate chains before execution to catch errors early:

```typescript
const validation = await client.validateChain([
  { agentId: 'translator', capability: 'translate', input: {...} },
  { agentId: 'analyzer', capability: 'analyze', input: { text: '{{step0.text}}' } }
]);

if (!validation.valid) {
  console.error('Errors:', validation.errors);
  // [{ step: 1, type: 'invalid_template', message: '...' }]
  return;
}

// Safe to execute - no payment made until validation passes
const result = await client.executeChain({...});
```

---

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Agent A   │◄────►│   Payment   │◄────►│   Agent B   │
│  (Seller)   │      │   Router    │      │  (Buyer)    │
└─────────────┘      └──────┬──────┘      └─────────────┘
                            │
                     ┌──────▼──────┐
                     │   Registry  │
                     │  (Discovery)│
                     └─────────────┘
                            │
                     ┌──────▼──────┐
                     │   Solana    │
                     │  Blockchain │
                     └─────────────┘
```

### Components

- **Registry** (`packages/registry`) - Agent discovery service with PostgreSQL backend
  - Agent registration and search
  - Heartbeat monitoring (30s intervals)
  - Automatic inactive agent cleanup
  - Falls back to in-memory if DB unavailable
  
- **Router** (`packages/router`) - Payment processing with x402 protocol
  - Real Solana transaction verification
  - Chain execution with auto-chaining
  - Template variable resolution
  - Automatic rollback on failure
  - Health checks before payment
  
- **SDK** (`packages/sdk`) - TypeScript SDK for building agents
  - Base `Agent` class with auto-setup
  - `PaymentClient` for chain execution
  - `RegistryClient` for discovery
  - Full TypeScript types
  
- **Web UI** (`web/`) - Next.js interface with Phantom wallet
  - AI-powered chain builder
  - Real-time payment tracking
  - Visual agent discovery
  - Solana Explorer integration

---

## Standard Schemas

Agents declare standard schemas for automatic composition:

### `text_processing_v1`
```typescript
input: { text: string, language?: string, metadata?: object }
output: { text: string, language?: string, metadata?: object }
```

### `analysis_v1`
```typescript
input: { text: string, analysis_type?: string, metadata?: object }
output: { result: object, confidence: number, metadata?: object }
```

### `image_processing_v1`
```typescript
input: { image_url?: string, image_base64?: string, prompt?: string }
output: { image_url: string, image_base64?: string, metadata?: object }
```

Agents using compatible schemas auto-chain without manual mapping!

---

## Demo Agents

Five fully working agents included:

### Text Processing Agents
- **Translator** (port 3100) - Multi-language translation with OpenAI GPT-4o-mini
- **Summarizer** (port 3101) - Intelligent text summarization
- **Analyzer** (port 3102) - Sentiment analysis and classification

### Image Processing Agents
- **Image Generator** (port 3103) - AI image generation with Google Gemini 2.5 Flash
- **Background Remover** (port 3104) - Background removal with remove.bg API

All agents support standard schemas for seamless auto-chaining. Each includes graceful fallbacks when API keys are not configured.

### Example Multi-Modal Chain
```typescript
// Generate an image then remove its background
const result = await client.executeChain({
  paymentSource: 'your-wallet',
  chain: [
    {
      agentId: 'image-generator',
      capability: 'generate_image',
      input: { prompt: 'fantasy orc warrior', style: 'realistic' }
    },
    {
      agentId: 'background-remover',
      capability: 'remove_background'
      // ✨ Auto-chains - uses image from previous step
    }
  ]
});
```

---

## Documentation

- **[GUIDE.md](./GUIDE.md)** - Complete developer guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Setup and deployment instructions
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

---

## Technology Stack

- **Backend:** Node.js + TypeScript + Express
- **Blockchain:** Solana Web3.js + SPL Token (USDC + SOL)
- **Frontend:** Next.js 14 + React 18 + Tailwind CSS + Framer Motion
- **Database:** PostgreSQL (optional, falls back to in-memory)
- **Wallet:** Solana Wallet Adapter + Phantom
- **AI Integrations:**
  - OpenAI GPT-4o / GPT-4o-mini (translation, summarization, chain building)
  - Google Gemini 2.5 Flash (image generation)
  - Remove.bg API (background removal)
  
All AI integrations are optional with graceful fallbacks to demo mode.

---

## Use Cases

### For Agent Developers
- Build payment-enabled agents with standard SDK
- Get discovered through registry
- Earn from AI services automatically

### For Agent Users
- Discover agents by capability
- Pay per use with micropayments
- Chain multiple agents into workflows

### For Enterprises
- Build custom agent marketplaces
- Enable internal agent collaboration
- Track and manage agent transactions

---

## Production Deployment

### Devnet (Current)
```bash
# Uses Solana devnet for testing
export REAL_TRANSACTIONS=true
npm run start:all
```

### Mainnet (Production-Ready)
```bash
# Switch to mainnet USDC
export SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
export USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
export REAL_TRANSACTIONS=true
npm run start:all
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete production guide.

---

## Contributing

Contributions welcome! Please read our contributing guidelines.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Links

- **GitHub:** https://github.com/yordanlasonov/agent-2-agent-infra
- **NPM SDK:** https://www.npmjs.com/package/x402mesh-sdk
- **NPM CLI:** https://www.npmjs.com/package/x402mesh-cli
- **Documentation:** [GUIDE.md](./GUIDE.md)
- **Issues:** https://github.com/yordanlasonov/agent-2-agent-infra/issues

---

## Testing

Comprehensive test suite included:

```bash
# Run the full test suite (5 tests)
node test-hybrid-chain.js

# Tests cover:
# ✅ Auto-chaining with standard schemas
# ✅ Template variable interpolation
# ✅ Explicit input override
# ✅ Chain validation (errors caught before payment)
# ✅ Complex 3-step chains
```

All tests passing (5/5) with real Solana devnet integration.

---

## Advanced Features

### Payment Rollback
```typescript
// If step 3 fails, steps 1 & 2 are automatically refunded
const result = await client.executeChain({
  chain: [step1, step2, step3]  // step3 fails
});

// Router automatically:
// 1. Detects failure
// 2. Refunds payment to step2's agent
// 3. Refunds payment to step1's agent
// 4. Returns error with partial results
```

### Health Checks
```typescript
// Before processing any payment, router verifies agent is healthy
GET http://agent-endpoint/health
// If unhealthy → no payment made, error returned immediately
```

### Agent Heartbeat
```typescript
// Agents automatically send heartbeats every 30 seconds
// Registry marks agents inactive if no heartbeat for 60 seconds
// Inactive agents hidden from discovery
```

### Multi-Currency Support
```typescript
// Both SOL and USDC supported
pricing: {
  amount: 0.01,
  currency: 'SOL',    // Native Solana
  // or
  currency: 'USDC',   // SPL Token (6 decimals)
  model: 'per_request'
}
```

---

## Status

✅ **Production Ready** - Core infrastructure complete and tested  
✅ **Devnet Deployed** - All services running on Solana devnet  
✅ **Mainnet Ready** - Ready for production deployment  
✅ **Test Coverage** - 5/5 tests passing with real transactions  
✅ **AI Integration** - OpenAI, Gemini, Remove.bg support  

---

## What Makes x402mesh Special?

1. **True Composability** - First platform with hybrid auto-chaining + templates
2. **AI-First** - GPT-4o builds chains from natural language
3. **Production-Grade** - Automatic rollback, health checks, monitoring
4. **Multi-Modal** - Text processing + image processing in one chain
5. **Real Payments** - Actual Solana transactions, not simulations
6. **Developer-Friendly** - Build agents in 20 lines of code
7. **Safety-First** - Validation before payment, rollback on failure

---

Built with ❤️ for the agent economy
