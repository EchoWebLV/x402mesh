# x402mesh-sdk

> TypeScript SDK for building AI agents with payment capabilities on Solana using the x402 protocol

[![npm version](https://img.shields.io/npm/v/x402mesh-sdk.svg)](https://www.npmjs.com/package/x402mesh-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- 🤖 **Easy Agent Creation** - Build payment-enabled AI agents in minutes
- 💰 **Built-in Payments** - x402 protocol support with Solana/USDC
- 🔍 **Agent Discovery** - Find and connect with other agents
- 🔗 **Agent Chaining** - Orchestrate multi-agent workflows
- ⚡ **TypeScript First** - Full type safety and IntelliSense support
- 🌐 **Production Ready** - Devnet and mainnet support

## 📦 Installation

```bash
npm install x402mesh-sdk
```

## 🎯 Quick Start

### Creating Your First Agent

```typescript
import { Agent } from '@x402mesh/sdk';
import { Keypair } from '@solana/web3.js';

// Create an agent
class TranslatorAgent extends Agent {
  constructor() {
    super({
      name: 'Translator Agent',
      description: 'Translates text between languages',
      endpoint: 'http://localhost:3001',
      capabilities: [{
        name: 'translate',
        description: 'Translate text to another language',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            targetLanguage: { type: 'string' }
          }
        },
        pricing: {
          amount: 0.01,
          currency: 'USDC'
        }
      }],
      walletAddress: 'YOUR_SOLANA_WALLET_ADDRESS'
    });
  }

  async executeCapability(capabilityName: string, input: any): Promise<any> {
    if (capabilityName === 'translate') {
      // Your translation logic here
      return {
        translatedText: `Translated: ${input.text}`,
        language: input.targetLanguage
      };
    }
    throw new Error('Unknown capability');
  }
}

// Start the agent
const agent = new TranslatorAgent();
agent.start(3001);
```

### Using Another Agent

```typescript
import { PaymentClient } from 'x402mesh-sdk';
import { Connection, Keypair } from '@solana/web3.js';

// Initialize payment client
const connection = new Connection('https://api.devnet.solana.com');
const wallet = Keypair.generate(); // Use your wallet

const client = new PaymentClient({
  connection,
  payerKeypair: wallet
});

// Call an agent
const result = await client.callAgent(
  'http://localhost:3001/capabilities/translate',
  {
    text: 'Hello, World!',
    targetLanguage: 'es'
  },
  {
    amount: 0.01,
    currency: 'USDC',
    recipientAddress: 'AGENT_WALLET_ADDRESS'
  }
);

console.log(result); // { translatedText: 'Hola, Mundo!', ... }
```

### Agent Discovery

```typescript
import { RegistryClient } from 'x402mesh-sdk';

const registry = new RegistryClient('http://localhost:4000');

// Find agents
const agents = await registry.searchAgents('translate');
console.log(`Found ${agents.length} translation agents`);

// Register your agent
await registry.registerAgent({
  name: 'My Agent',
  description: 'Does cool stuff',
  endpoint: 'http://localhost:3001',
  capabilities: [/* ... */]
});
```

## 🏗️ Core Components

### Agent Class

The base class for creating payment-enabled agents:

```typescript
class MyAgent extends Agent {
  constructor() {
    super(config);
  }

  async executeCapability(name: string, input: any): Promise<any> {
    // Your logic here
  }
}
```

### PaymentClient

Handle x402 payments automatically:

```typescript
const client = new PaymentClient({
  connection: solanaConnection,
  payerKeypair: yourWallet
});

// Automatically handles HTTP 402 responses
const result = await client.callAgent(url, input, paymentInfo);
```

### RegistryClient

Discover and register agents:

```typescript
const registry = new RegistryClient(registryUrl);

// Search agents
const agents = await registry.searchAgents('sentiment analysis');

// Get agent details
const agent = await registry.getAgent('agent-id');

// Register agent
await registry.registerAgent(agentConfig);
```

## 💡 Examples

### Sentiment Analysis Agent

```typescript
import { Agent } from 'x402mesh-sdk';

class SentimentAgent extends Agent {
  constructor() {
    super({
      name: 'Sentiment Analyzer',
      capabilities: [{
        name: 'analyze',
        pricing: { amount: 0.015, currency: 'USDC' }
      }],
      walletAddress: process.env.WALLET_ADDRESS!
    });
  }

  async executeCapability(name: string, input: { text: string }) {
    const sentiment = this.analyzeSentiment(input.text);
    return { sentiment, confidence: 0.95 };
  }

  private analyzeSentiment(text: string): string {
    // Your sentiment analysis logic
    return 'positive';
  }
}
```

### Agent Chaining

```typescript
import { PaymentClient, RegistryClient } from 'x402mesh-sdk';

async function processText(text: string) {
  const registry = new RegistryClient('http://localhost:4000');
  const client = new PaymentClient({ connection, payerKeypair });

  // Find translator
  const translators = await registry.searchAgents('translate');
  
  // Translate
  const translated = await client.callAgent(
    translators[0].endpoint + '/capabilities/translate',
    { text, targetLanguage: 'es' },
    { amount: 0.01, currency: 'USDC', recipientAddress: translators[0].walletAddress }
  );

  // Find summarizer
  const summarizers = await registry.searchAgents('summarize');
  
  // Summarize translation
  const summary = await client.callAgent(
    summarizers[0].endpoint + '/capabilities/summarize',
    { text: translated.translatedText },
    { amount: 0.02, currency: 'USDC', recipientAddress: summarizers[0].walletAddress }
  );

  return summary;
}
```

## 🔐 Payment Flow

The SDK handles the complete x402 payment flow:

1. **Initial Request** → Agent returns HTTP 402 Payment Required
2. **Payment** → SDK creates and sends Solana transaction
3. **Retry with Proof** → SDK includes transaction signature in headers
4. **Service Delivery** → Agent verifies payment and processes request

```
Client          Agent           Solana
   |              |                |
   |---Request--->|                |
   |<--402--------|                |
   |                               |
   |--------SOL/USDC Transfer----->|
   |<-------Signature--------------|
   |                               |
   |---Request+Sig>|               |
   |              |--Verify------->|
   |              |<--Confirmed----|
   |<--Response---|                |
```

## 🌐 Network Configuration

### Devnet (Testing)

```typescript
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
// Get test SOL from https://faucet.solana.com/
```

### Mainnet (Production)

```typescript
const connection = new Connection(
  'https://mainnet.helius-rpc.com/?api-key=YOUR_KEY'
);
// Use real SOL/USDC
```

## 📚 API Reference

### Agent Configuration

```typescript
interface AgentConfig {
  name: string;
  description?: string;
  version?: string;
  endpoint: string;
  capabilities: Capability[];
  walletAddress: string;
  tags?: string[];
}

interface Capability {
  name: string;
  description?: string;
  inputSchema?: object;
  outputSchema?: object;
  pricing: {
    amount: number;
    currency: 'SOL' | 'USDC';
  };
}
```

### Payment Configuration

```typescript
interface PaymentInfo {
  amount: number;
  currency: 'SOL' | 'USDC';
  recipientAddress: string;
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Watch mode
npm run test:watch
```

## 🛠️ Development

```bash
# Clone the repo
git clone https://github.com/yordanlasonov/agent-2-agent-infra.git
cd agent-2-agent-infra/packages/sdk

# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev
```

## 📖 Documentation

- [Getting Started Guide](https://github.com/yordanlasonov/agent-2-agent-infra/blob/main/docs/GETTING_STARTED.md)
- [API Documentation](https://github.com/yordanlasonov/agent-2-agent-infra/blob/main/docs/API.md)
- [Architecture Overview](https://github.com/yordanlasonov/agent-2-agent-infra/blob/main/docs/ARCHITECTURE.md)
- [Example Agents](https://github.com/yordanlasonov/agent-2-agent-infra/tree/main/demo/agents)

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](https://github.com/yordanlasonov/agent-2-agent-infra/blob/main/CONTRIBUTING.md) first.

## 📄 License

MIT © Yordan Lasonov

## 🔗 Links

- [GitHub Repository](https://github.com/yordanlasonov/agent-2-agent-infra)
- [npm Package](https://www.npmjs.com/package/x402mesh-sdk)
- [Report Issues](https://github.com/yordanlasonov/agent-2-agent-infra/issues)
- [x402 Protocol](https://docs.x402.org)

## 🎯 Built For

Solana x402 Hackathon - Enabling the Agent Economy

---

**Made with ❤️ for the decentralized agent ecosystem**

