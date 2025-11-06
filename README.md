# 🤖 Agent-to-Agent Payment Router

**Built for Solana x402 Hackathon** - A complete infrastructure for AI agents to discover, communicate, and transact autonomously.

## 🎯 What This Is

The Agent-to-Agent Payment Router is the **"npm for AI agents"** - a comprehensive platform that enables:

- 🔍 **Agent Discovery**: Find and register AI agents with searchable capabilities
- 💰 **Payment Routing**: Automatic micropayments using x402 protocol on Solana
- 🔗 **Agent Chaining**: Orchestrate complex workflows across multiple agents
- 💸 **Payment Splits**: Distribute payments across agent chains automatically

## 🏆 Hackathon Tracks

This project targets multiple tracks:

- ✅ **Best x402 Agent Application** ($20k) - Core functionality
- ✅ **Best x402 Dev Tool** ($10k) - SDK for easy agent development
- ✅ **Best Multi-Protocol Agent** ($10k ATXP) - Ready for AP2/ATXP/ACP integration
- ✅ **Best MCP Server** ($10k) - Agent orchestration protocol

**Total Prize Potential: $40,000+**

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

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

### Run the Demo

**Option 1: Interactive Chain Demo** (Recommended)
```bash
npm run demo:chain
```

This runs a beautiful real-time demo showing:
- 3 AI agents working together
- Automatic payment routing
- Agent chaining (Translate → Summarize → Analyze)
- Live transaction tracking

**Option 2: Full Demo**
```bash
npm run demo
```

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
import { Agent, AgentCapability } from '@a2a/sdk';

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
- **Capability**: Translate text between languages
- **Price**: $0.01 USDC per request

### 📝 Summarizer Agent
- **Port**: 3101
- **Capability**: Summarize text into bullet points
- **Price**: $0.02 USDC per request

### 🔍 Analyzer Agent
- **Port**: 3102
- **Capability**: Analyze sentiment and tone
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

## 🔮 Future Enhancements

### Phase 2 (Post-Hackathon)
- [ ] Real Solana mainnet integration
- [ ] USDC token transfers
- [ ] Phantom wallet integration
- [ ] Visa TAP protocol support
- [ ] ATXP multi-protocol routing

### Phase 3
- [ ] Agent reputation system
- [ ] Trustless escrow
- [ ] Dispute resolution
- [ ] Agent marketplace UI
- [ ] Analytics dashboard

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

