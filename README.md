# 🤖 Agent-to-Agent Payment Router

**Built for Solana x402 Hackathon** - A complete infrastructure for AI agents to discover, communicate, and transact autonomously.

[![Status](https://img.shields.io/badge/status-ready-brightgreen)]() [![License](https://img.shields.io/badge/license-MIT-blue)]() [![Solana](https://img.shields.io/badge/solana-devnet-purple)]()

**🎬 Demo Video:** [Add your 3-minute demo link here]

---

## 🎯 What This Is

The Agent-to-Agent Payment Router is the **"npm for AI agents"** - a comprehensive platform that enables:

- 🔍 **Agent Discovery**: Find and register AI agents with searchable capabilities
- 💰 **Payment Routing**: Automatic micropayments using x402 protocol on Solana
- 🔗 **Agent Chaining**: Orchestrate complex workflows across multiple agents
- 💸 **Payment Splits**: Distribute payments across agent chains automatically

## 🏆 Hackathon Tracks

This project targets multiple tracks:

- ✅ **Best x402 Dev Tool** ($10k) - Complete SDK for easy agent development
- ✅ **Best x402 Agent Application** ($20k) - AI-powered agents with real payments
- ✅ **Best Use of CASH** ($10k) - Phantom wallet integration in web UI
- ✅ **Best AgentPay Demo** ($5k) - USDC micropayments for AI services

**Total Prize Potential: $45,000+**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Phantom Wallet (for web UI)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/agent-2-agent-infra.git
cd agent-2-agent-infra

# Install dependencies
npm install

# Build packages
npm run build
```

### 🌐 NEW: Web UI

**Beautiful visual interface with Phantom wallet integration!**

```bash
# Start the web UI (includes Phantom wallet)
npm run web

# Open http://localhost:3000
```

Features:
- 🦊 **Phantom Wallet Integration** - Connect your wallet with one click
- 📊 **Visual Agent Chains** - Watch agents collaborate in real-time
- 💰 **Payment Tracking** - See all transactions on Solana Explorer
- 🎨 **Modern Design** - Beautiful UI with animations

### Run the Demo

**Option 1: Web UI** (Recommended)
```bash
# Terminal 1 - Start backend
npm run start:all

# Terminal 2 - Start web UI
npm run web
```

Open http://localhost:3000 and:
- Connect your Phantom wallet
- Execute an agent chain
- Watch real-time collaboration
- See payment tracking

**Option 2: Interactive CLI Demo**
```bash
npm run demo:chain
```

This runs a beautiful CLI demo showing:
- 3 agents working together
- Automatic payment routing
- Agent chaining (Translate → Summarize → Analyze)
- Live transaction tracking

**Option 3: Real Solana Transactions**
```bash
npm run setup:wallets
npm run demo:real
```

This uses **real Solana devnet** with verifiable transactions.

## 📚 Documentation

### **Getting Started:**
- **[QUICKSTART.md](./QUICKSTART.md)** - 30-second setup
- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[Getting Started](./docs/GETTING_STARTED.md)** - Full tutorial

### **Technical Docs:**
- **[API Reference](./docs/API.md)** - Complete API docs
- **[Architecture](./docs/ARCHITECTURE.md)** - System design
- **[Web UI Guide](./docs/WEB_UI.md)** - Frontend docs
- **[Solana Integration](./docs/SOLANA_INTEGRATION.md)** - Blockchain details

### **Deployment:**
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **[FINAL_CHECKLIST.md](./FINAL_CHECKLIST.md)** - Pre-submission checklist

### **Submission:**
- **[HACKATHON_SUBMISSION.md](./HACKATHON_SUBMISSION.md)** - Official submission doc

## 📁 Architecture

```
agent-2-agent-infra/
├── packages/
│   ├── sdk/              # Agent SDK for developers
│   ├── registry/         # Agent Discovery Registry
│   └── router/           # Payment Router with x402
├── demo/
│   ├── agents/           # Demo agents (Translator, Summarizer, Analyzer)
│   ├── run-demo.js       # Full demo script
│   └── chain-demo.js     # Interactive chain demo
└── docs/                 # Documentation
```

## 🛠️ Core Components

### 1. Agent Discovery Registry

A centralized registry where agents can:
- Register their capabilities and pricing
- Announce their services
- Be discovered by other agents
- Maintain heartbeat status

**API Endpoints:**
```
POST   /agents/register       - Register a new agent
GET    /agents/discover       - Find agents by capability/tags
GET    /agents/:id            - Get agent details
POST   /agents/:id/heartbeat  - Update agent status
DELETE /agents/:id            - Deregister agent
```

### 2. Payment Router

Handles all financial transactions between agents:
- Process individual payments
- Route payment chains
- Split payments across multiple recipients
- Track transaction history

**API Endpoints:**
```
POST   /payments/process      - Process a payment
POST   /payments/chain        - Execute agent chain with payments
POST   /payments/split        - Split payment among agents
GET    /payments/:id          - Get payment status
```

### 3. Agent SDK

Developer-friendly SDK for building payment-enabled agents:

```typescript
import { Agent, AgentCapability } from '@x402mesh/sdk';

class MyAgent extends Agent {
  constructor() {
    super({
      name: 'My Cool Agent',
      description: 'Does amazing things',
      capabilities: [{
        name: 'do_thing',
        description: 'Does a thing',
        pricing: { amount: 0.01, currency: 'USDC', model: 'per_request' }
      }],
      walletAddress: 'YOUR_WALLET',
      port: 3100,
    });
  }

  async execute(capability, input) {
    // Your logic here
    return { result: 'done!' };
  }
}
```

## 💡 Demo Agents

### 🌍 Translator Agent
- **Port**: 3100
- **Capability**: Translate text between languages (Spanish, French, German)
- **Implementation**: Dictionary-based translation (expandable to real API)
- **Price**: $0.01 USDC per request

### 📝 Summarizer Agent
- **Port**: 3101
- **Capability**: Summarize text into bullet points
- **Implementation**: Sentence extraction algorithm
- **Price**: $0.02 USDC per request
- **Note**: Can integrate OpenAI API with `OPENAI_API_KEY` env variable

### 🔍 Analyzer Agent
- **Port**: 3102
- **Capability**: Analyze sentiment and tone
- **Implementation**: Word-based sentiment analysis
- **Price**: $0.015 USDC per request

## 🔗 Agent Chaining Example

```javascript
// Automatically route payments and data through multiple agents
const result = await paymentClient.executeChain({
  paymentSource: 'YOUR_WALLET',
  chain: [
    {
      agentId: 'translator-id',
      capability: 'translate',
      input: { text: 'Hello', targetLanguage: 'spanish' }
    },
    {
      agentId: 'summarizer-id',
      capability: 'summarize',
      input: {} // Receives translator output
    },
    {
      agentId: 'analyzer-id',
      capability: 'analyze_sentiment',
      input: {} // Receives summarizer output
    }
  ]
});

// Result includes:
// - results: Array of outputs from each agent
// - payments: All transaction details
// - totalCost: Sum of all agent fees
// - executionTime: Total time in ms
```

## 🎬 Demo Output

When you run `npm run demo:chain`, you'll see:

```
╔═══════════════════════════════════════════════════════╗
║   🤖 AGENT CHAIN DEMO - Real-time Conversation      ║
╚═══════════════════════════════════════════════════════╝

📝 SCENARIO 1: Tech Discussion
══════════════════════════════════════════════════════

💬 Original Message:
   "Artificial intelligence is revolutionizing blockchain..."

🔄 Executing Agent Chain:
   1. 🌍 Translator → Translate to spanish
   2. 📝 Summarizer → Create bullet points
   3. 🔍 Analyzer → Analyze sentiment

📊 RESULTS:
─────────────────────────────────────────────────────

🌍 Translation (spanish):
   "inteligencia artificial is revolutionizing blockchain..."

📝 Summary:
   1. inteligencia artificial is revolutionizing blockchain
   2. Payment systems are becoming more efficient
   3. Smart contracts enable trustless transactions
   (33.2% compression)

🔍 Sentiment Analysis:
   Sentiment: POSITIVE
   Score: 0.15
   • Detected 15 words
   • Sentiment leaning: positive
   • Confidence: 15%

💰 Payment Summary:
   Total Cost: $0.0450 USDC
   Payments Made: 3
   Execution Time: 1234ms
   1. Translator: $0.01 USDC
   2. Summarizer: $0.02 USDC
   3. Analyzer: $0.015 USDC
```

## 🌟 Key Features

### For Developers

✅ **Simple SDK** - Build agents in minutes, not hours  
✅ **Automatic Discovery** - Agents find each other automatically  
✅ **Built-in Payments** - x402 protocol integration out of the box  
✅ **Type Safety** - Full TypeScript support  
✅ **Hot Reload** - Development mode with auto-restart  

### For Agents

✅ **Self-Registration** - Announce capabilities automatically  
✅ **Heartbeat Monitoring** - Automatic health checks  
✅ **Flexible Pricing** - Per-request, per-token, or per-minute  
✅ **Chain Participation** - Work with other agents seamlessly  

### For Users

✅ **Transparent Pricing** - Know costs upfront  
✅ **Payment Tracking** - Full transaction history  
✅ **Chain Orchestration** - Complex workflows made simple  
✅ **Real-time Updates** - See agents working in real-time  

## ✅ Current Features

- ✅ **Real Solana Integration**: Devnet-ready with SPL token support
- ✅ **USDC Transfers**: Working SPL token implementation
- ✅ **Phantom Wallet**: Full integration in web UI
- ✅ **x402 Protocol Compliant**: Standard PaymentRequirements, X-PAYMENT headers, base64 encoding
- ✅ **Agent Chaining**: Multi-agent workflows with payment routing
- ✅ **Beautiful Web UI**: Professional interface with real-time updates

### x402 Standard Compliance

Implements the [official Solana x402 specification](https://solana.com/developers/guides/getstarted/intro-to-x402):
- ✅ Standard 402 Payment Required responses with `x402Version: 1`
- ✅ PaymentRequirements structure (scheme, network, recipient, amount)
- ✅ X-PAYMENT-RESPONSE headers (base64 encoded)
- ✅ On-chain payment verification via Solana
- ✅ Compatible with other x402 SDKs (Corbits, Coinbase, ACK)

## 🔮 Future Enhancements

### Phase 2 (Post-Hackathon)
- [ ] Mainnet deployment with real USDC
- [ ] OpenAI/Anthropic integration for real AI
- [ ] Visa TAP protocol support
- [ ] ATXP multi-protocol routing
- [ ] Rate limiting and quotas

### Phase 3
- [ ] Agent reputation system
- [ ] Trustless escrow
- [ ] Dispute resolution
- [ ] Agent marketplace UI
- [ ] Analytics dashboard
- [ ] Mobile app

## 📊 Technical Stack

- **Backend**: Node.js + TypeScript + Express
- **Blockchain**: Solana (devnet ready)
- **Protocol**: x402 (HTTP 402 Payment Required)
- **Architecture**: Microservices
- **Package Manager**: npm workspaces (monorepo)

## 🧪 Testing

```bash
# Run all tests
npm test

# Test individual packages
npm test -w @a2a/sdk
npm test -w @a2a/registry
npm test -w @a2a/router
```

## 🤝 Contributing

This is an open-source project for the Solana x402 Hackathon. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🏅 Hackathon Submission

**Project Name**: Agent-to-Agent Payment Router  
**Tracks**: Best x402 Agent Application, Best x402 Dev Tool, Best Multi-Protocol Agent  
**Solana Network**: Devnet ready, Mainnet compatible  
**Demo Video**: [Link to 3-minute demo]  

## 🙋 Support

- **Issues**: GitHub Issues
- **Discord**: [Your Discord]
- **Email**: [Your Email]

## 🎉 Acknowledgments

Built with support from:
- Solana Foundation
- x402 Protocol Team
- Hackathon Sponsors
- Open Source Community

---

**Made with ❤️ for the Solana x402 Hackathon**

*Enabling the Agent Economy, One Transaction at a Time*

