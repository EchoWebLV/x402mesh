# x402mesh - Agent Payment Infrastructure

[![License](https://img.shields.io/badge/license-MIT-blue)]() [![Solana](https://img.shields.io/badge/solana-devnet-purple)]()

A complete infrastructure platform enabling AI agents to discover, transact, and collaborate autonomously using Solana blockchain.

## What is x402mesh?

x402mesh is **the missing infrastructure for the agent economy**. It provides:

- 🔍 **Agent Registry** - Discover and register AI agents with searchable capabilities
- 💰 **Payment Router** - Automatic micropayments with x402 protocol on Solana
- ⛓️ **Hybrid Chain Execution** - Agents compose seamlessly via auto-chaining + template variables
- 🛠️ **Developer SDK** - Build payment-enabled agents in minutes
- 🌐 **Web Interface** - Beautiful UI with Phantom wallet integration

### The Composability Breakthrough

**Problem:** Agents built by different developers can't work together because their input/output formats don't match.

**Solution:** x402mesh implements a hybrid approach:
- **Auto-chaining** - Standard schemas enable automatic composition
- **Template variables** - `{{step0.field}}` for precise field mapping
- **Validation** - Pre-execution checks catch errors before payment

This makes agents truly composable in a decentralized marketplace.

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Optional: Phantom Wallet (for web UI)

### Installation

```bash
git clone https://github.com/yourusername/agent-2-agent-infra.git
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

Chain agents together with automatic composition:

```typescript
// Auto-chaining (agents use standard schemas)
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

// Template variables (precise field mapping)
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
        text: '{{step0.text}}'  // Extract translated text
      }
    }
  ]
});
```

### 4. Build Agents in Minutes

```typescript
import { Agent } from 'x402mesh-sdk';

class MyAgent extends Agent {
  constructor(walletAddress: string) {
    super({
      name: 'My Agent',
      capabilities: [{
        name: 'process',
        schema: 'text_processing_v1',
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

// That's it! SDK handles payments, HTTP 402, registration, etc.
const agent = new MyAgent('your-wallet');
await agent.start();
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

- **Registry** (`packages/registry`) - Agent discovery service with PostgreSQL
- **Router** (`packages/router`) - Payment processing with x402 protocol
- **SDK** (`packages/sdk`) - TypeScript SDK for building agents
- **Web UI** (`web/`) - Next.js interface with Phantom wallet

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

Three working agents included:

- **Translator** (port 3100) - Multi-language translation with OpenAI
- **Summarizer** (port 3101) - Text summarization
- **Analyzer** (port 3102) - Sentiment analysis

All use standard schemas and work together seamlessly.

---

## Documentation

- **[GUIDE.md](./GUIDE.md)** - Complete developer guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Setup and deployment instructions
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

---

## Technology Stack

- **Backend:** Node.js + TypeScript + Express
- **Blockchain:** Solana Web3.js + SPL Token
- **Frontend:** Next.js 14 + React 18 + Tailwind CSS
- **Database:** PostgreSQL (optional, falls back to in-memory)
- **Wallet:** Solana Wallet Adapter + Phantom
- **AI:** OpenAI GPT-4o-mini (optional)

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

- **GitHub:** https://github.com/yourusername/agent-2-agent-infra
- **NPM:** `npm install x402mesh-sdk`
- **Documentation:** [GUIDE.md](./GUIDE.md)
- **Issues:** https://github.com/yourusername/agent-2-agent-infra/issues

---

## Status

✅ **Production Ready** - Core infrastructure complete and tested  
✅ **Devnet Deployed** - All services running on Solana devnet  
🚧 **Mainnet Ready** - Ready for production deployment  

---

Built with ❤️ for the agent economy
