# x402mesh Developer Guide

Complete guide to building payment-enabled AI agents with x402mesh.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Building Your First Agent](#building-your-first-agent)
3. [Chain Execution](#chain-execution)
4. [Standard Schemas](#standard-schemas)
5. [SDK Reference](#sdk-reference)
6. [Web UI](#web-ui)
7. [Solana Integration](#solana-integration)
8. [Architecture](#architecture)

---

## Getting Started

### Installation

```bash
npm install x402mesh-sdk
```

### Environment Setup

Create `.env` file:

```bash
# Optional: OpenAI for real AI capabilities
OPENAI_API_KEY=sk-...

# Optional: Real Solana transactions
REAL_TRANSACTIONS=false
SOLANA_RPC_URL=https://api.devnet.solana.com

# Service ports
REGISTRY_PORT=3001
ROUTER_PORT=3002
```

### Running the Platform

```bash
# Option 1: All services with one command
./scripts/start-all.sh

# Option 2: Individual services
npm run registry  # Agent discovery
npm run router    # Payment processing  
npm run agents    # Demo agents
```

---

## Building Your First Agent

### Step 1: Create Agent Class

```typescript
import { Agent, AgentCapability } from 'x402mesh-sdk';

class TranslatorAgent extends Agent {
  constructor(walletAddress: string) {
    const capabilities: AgentCapability[] = [
      {
        name: 'translate',
        description: 'Translate text between languages',
        schema: 'text_processing_v1',  // Standard schema
        inputSchema: {
          text: 'string',
          targetLanguage: 'string'
        },
        outputSchema: {
          text: 'string',
          language: 'string'
        },
        pricing: {
          amount: 0.01,
          currency: 'USDC',
          model: 'per_request'
        }
      }
    ];

    super({
      name: 'Translator Agent',
      description: 'Translates text between languages',
      version: '1.0.0',
      capabilities,
      walletAddress,
      port: 3100
    });
  }

  async execute(capability: string, input: any): Promise<any> {
    if (capability === 'translate') {
      return this.translate(input);
    }
    throw new Error(`Unknown capability: ${capability}`);
  }

  private async translate(input: any) {
    // Your translation logic here
    const translatedText = await yourTranslationAPI(input.text, input.targetLanguage);
    
    return {
      text: translatedText,
      language: input.targetLanguage,
      metadata: {
        originalText: input.text,
        method: 'ai'
      }
    };
  }
}
```

### Step 2: Start Your Agent

```typescript
const walletAddress = 'YOUR_SOLANA_WALLET_ADDRESS';
const agent = new TranslatorAgent(walletAddress);
await agent.start();

console.log('Agent running on port 3100');
```

That's it! The SDK automatically handles:
- ✅ HTTP server setup
- ✅ x402 payment verification
- ✅ Registry registration
- ✅ Health checks
- ✅ Error handling

---

## Chain Execution

### The Composability Problem

In a decentralized marketplace, agents by different developers have incompatible schemas:

```typescript
// Agent A outputs:
{ translated_text: "Hola", source_lang: "en" }

// Agent B expects:
{ text: "...", language: "..." }

// ❌ Chain fails - field names don't match!
```

### The Solution: Hybrid Chaining

x402mesh solves this with three approaches:

#### 1. Auto-Chaining (Recommended)

Agents declare standard schemas and auto-compose:

```typescript
import { PaymentClient } from 'x402mesh-sdk';

const client = new PaymentClient();

const result = await client.executeChain({
  paymentSource: 'your-wallet-address',
  chain: [
    {
      agentId: 'translator-agent-id',
      capability: 'translate',
      input: {
        text: 'Hello world',
        targetLanguage: 'es'
      }
    },
    {
      agentId: 'summarizer-agent-id',
      capability: 'summarize'
      // ✨ No input specified - auto-chains from translator!
    }
  ]
});

console.log(result.results);
// [
//   { text: 'Hola mundo', language: 'es', ... },
//   { text: 'Summary...', language: 'es', ... }
// ]
```

**How it works:**
- Both agents use `text_processing_v1` schema
- Router automatically maps translator output → summarizer input
- No manual configuration needed!

#### 2. Template Variables

Extract specific fields when schemas don't align:

```typescript
const result = await client.executeChain({
  paymentSource: 'your-wallet',
  chain: [
    {
      agentId: 'translator',
      capability: 'translate',
      input: { text: 'I love this!', targetLanguage: 'es' }
    },
    {
      agentId: 'analyzer',
      capability: 'analyze_sentiment',
      input: {
        text: '{{step0.text}}',  // Extract 'text' field from step 0
        context: '{{step0.metadata.originalText}}'  // Nested fields work too
      }
    }
  ]
});
```

**Template syntax:**
- `{{stepN.field}}` - Extract field from step N
- `{{stepN.nested.field}}` - Access nested properties
- Step indices start at 0

#### 3. Explicit Input

Override for complete control:

```typescript
{
  agentId: 'my-agent',
  capability: 'process',
  input: {
    custom: 'My own data',  // Ignores previous step
    value: 42
  }
}
```

### Complex Example: 3-Step Chain

```typescript
const result = await client.executeChain({
  paymentSource: 'your-wallet',
  chain: [
    // Step 0: Translate
    {
      agentId: 'translator',
      capability: 'translate',
      input: {
        text: 'Long article about AI...',
        targetLanguage: 'es'
      }
    },
    // Step 1: Summarize (auto-chains)
    {
      agentId: 'summarizer',
      capability: 'summarize'
    },
    // Step 2: Analyze (template variable)
    {
      agentId: 'analyzer',
      capability: 'analyze_sentiment',
      input: {
        text: '{{step1.text}}'  // Analyze the summary, not the translation
      }
    }
  ]
});

// Access results
const translation = result.results[0];
const summary = result.results[1];
const sentiment = result.results[2];
```

### Chain Validation

Validate before executing to catch errors early:

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

if (validation.warnings.length > 0) {
  console.warn('Warnings:', validation.warnings);
}

// Safe to execute
const result = await client.executeChain({ ... });
```

---

## Standard Schemas

Standard schemas enable automatic agent composition.

### text_processing_v1

For text transformation (translation, summarization, formatting):

```typescript
// Input
{
  text: string;        // Required: text to process
  language?: string;   // Optional: language code (ISO 639-1)
  metadata?: object;   // Optional: additional data
}

// Output
{
  text: string;        // Required: processed result
  language?: string;   // Optional: result language
  metadata?: object;   // Optional: processing metadata
}
```

**Example agents:** Translator, Summarizer, Formatter, Rewriter

### analysis_v1

For text analysis (sentiment, classification, extraction):

```typescript
// Input
{
  text: string;           // Required: text to analyze
  analysis_type?: string; // Optional: type of analysis
  metadata?: object;      // Optional: context
}

// Output
{
  result: object;       // Required: analysis results
  confidence: number;   // Required: 0-1 confidence score
  metadata?: object;    // Optional: analysis metadata
}
```

**Example agents:** Sentiment Analyzer, Entity Extractor, Classifier

### image_processing_v1

For image operations (generation, editing, analysis):

```typescript
// Input
{
  image_url?: string;    // URL to input image
  image_base64?: string; // Base64 encoded image
  prompt?: string;       // Text prompt for generation
  metadata?: object;
}

// Output
{
  image_url: string;     // Required: URL to result
  image_base64?: string; // Optional: base64 result
  metadata?: object;     // Image metadata (size, format, etc)
}
```

**Example agents:** Image Generator, Background Remover, Style Transfer

### data_transform_v1

For generic data transformations:

```typescript
// Input
{
  data: any;                  // Required: input data
  transform_params?: object;  // Optional: transformation config
}

// Output
{
  data: any;         // Required: transformed data
  metadata?: object; // Optional: transformation info
}
```

**Example agents:** Format Converter, Data Validator, Schema Mapper

### Schema Compatibility

| From ↓ / To → | text_processing | analysis | image_processing |
|---------------|-----------------|----------|------------------|
| text_processing | ✅ Auto | ✅ Auto | ❌ Template |
| analysis | ✅ Auto | ✅ Auto | ❌ Template |
| image_processing | ❌ Template | ❌ Template | ✅ Auto |

✅ = Auto-chaining works  
❌ = Use template variables

---

## SDK Reference

### Agent Class

Base class for building agents:

```typescript
class Agent {
  constructor(config: {
    name: string;
    description: string;
    version: string;
    capabilities: AgentCapability[];
    walletAddress: string;
    port: number;
    tags?: string[];
  });

  // Implement this method
  abstract execute(capability: string, input: any): Promise<any>;

  // Start the agent server
  async start(): Promise<void>;

  // Stop the agent server
  async stop(): Promise<void>;
}
```

### PaymentClient

Client for executing agent chains and payments:

```typescript
class PaymentClient {
  constructor(routerUrl?: string);

  // Process a single payment
  async processPayment(payment: PaymentRequest): Promise<PaymentResponse>;

  // Execute an agent chain
  async executeChain(request: ChainedRequest): Promise<ChainedResponse>;

  // Validate a chain before execution
  async validateChain(chain: ChainStep[]): Promise<ValidationResult>;

  // Get payment status
  async getPaymentStatus(transactionId: string): Promise<PaymentResponse>;
}
```

### RegistryClient

Client for agent discovery:

```typescript
class RegistryClient {
  constructor(registryUrl?: string);

  // Register an agent
  async registerAgent(metadata: AgentMetadata): Promise<AgentMetadata>;

  // Search for agents
  async searchAgents(query?: {
    tag?: string;
    capability?: string;
    name?: string;
  }): Promise<AgentMetadata[]>;

  // Get specific agent
  async getAgent(id: string): Promise<AgentMetadata>;

  // Update agent
  async updateAgent(id: string, updates: Partial<AgentMetadata>): Promise<AgentMetadata>;

  // Unregister agent
  async unregisterAgent(id: string): Promise<void>;
}
```

---

## Web UI

### Running the Web Interface

```bash
npm run web
# Open http://localhost:3000
```

### Features

- **Phantom Wallet Integration** - One-click wallet connection
- **Visual Chain Builder** - Drag-and-drop agent composition
- **Payment Dashboard** - Real-time transaction tracking
- **Solana Explorer Links** - Verify all transactions on-chain
- **Agent Discovery** - Browse and search available agents

### Phantom Integration

The web UI uses Solana Wallet Adapter for secure wallet integration:

```typescript
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

function MyComponent() {
  const { publicKey, signTransaction } = useWallet();

  // Wallet is connected when publicKey exists
  if (publicKey) {
    console.log('Connected:', publicKey.toBase58());
  }

  return <WalletMultiButton />;
}
```

---

## Solana Integration

### SPL Token (USDC) Payments

```typescript
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';

// Create USDC transfer
const connection = new Connection('https://api.devnet.solana.com');
const mint = new PublicKey('USDC_MINT_ADDRESS');

const fromATA = await getAssociatedTokenAddress(mint, fromWallet);
const toATA = await getAssociatedTokenAddress(mint, toWallet);

const instruction = createTransferInstruction(
  fromATA,
  toATA,
  fromWallet,
  amount * 1_000_000  // USDC has 6 decimals
);

const transaction = new Transaction().add(instruction);
const signature = await connection.sendTransaction(transaction, [signer]);
```

### Native SOL Payments

```typescript
import { SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

const instruction = SystemProgram.transfer({
  fromPubkey: fromWallet,
  toPubkey: toWallet,
  lamports: amount * LAMPORTS_PER_SOL
});

const transaction = new Transaction().add(instruction);
const signature = await connection.sendTransaction(transaction, [signer]);
```

### Transaction Verification

```typescript
// Wait for confirmation
await connection.confirmTransaction(signature, 'confirmed');

// Get transaction details
const tx = await connection.getParsedTransaction(signature, {
  commitment: 'confirmed',
  maxSupportedTransactionVersion: 0
});

// Verify amounts and recipients
console.log('Status:', tx.meta.err ? 'Failed' : 'Success');
console.log('Explorer:', `https://explorer.solana.com/tx/${signature}?cluster=devnet`);
```

---

## Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────┐
│                      Web UI (Next.js)                    │
│              Phantom Wallet + Visual Interface           │
└────────────────────┬─────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│     Registry    │     │  Payment Router  │
│   (Discovery)   │◄───►│   (x402 + $$$)   │
└────────┬────────┘     └─────────┬────────┘
         │                        │
         │        ┌───────────────┴────────────┐
         │        │                            │
         ▼        ▼                            ▼
    ┌─────────────────┐              ┌──────────────────┐
    │   Agent A       │◄────────────►│   Agent B        │
    │ (Translator)    │   Payments   │ (Summarizer)     │
    └────────┬────────┘              └────────┬─────────┘
             │                                │
             └────────────┬───────────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │    Solana    │
                   │  Blockchain  │
                   └──────────────┘
```

### Package Structure

```
agent-2-agent-infra/
├── packages/
│   ├── registry/      # Agent discovery service
│   │   ├── src/
│   │   │   ├── index.ts       # Express server
│   │   │   ├── registry.ts    # Registry logic
│   │   │   └── db.ts          # PostgreSQL client
│   │   └── package.json
│   │
│   ├── router/        # Payment routing
│   │   ├── src/
│   │   │   ├── index.ts              # Express server
│   │   │   ├── payment-router.ts     # Payment logic
│   │   │   ├── template-resolver.ts  # Chain templates
│   │   │   ├── standard-schemas.ts   # Schema definitions
│   │   │   └── chain-validator.ts    # Validation
│   │   └── package.json
│   │
│   └── sdk/           # Developer SDK
│       ├── src/
│       │   ├── agent.ts           # Base Agent class
│       │   ├── payment-client.ts  # Payment API
│       │   ├── registry-client.ts # Discovery API
│       │   └── types.ts           # TypeScript types
│       └── package.json
│
├── demo/agents/       # Example agents
│   ├── translator-agent.ts
│   ├── summarizer-agent.ts
│   └── analyzer-agent.ts
│
├── web/               # Web UI
│   ├── src/
│   │   ├── app/           # Next.js 14 app router
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities
│   └── package.json
│
└── scripts/           # DevOps scripts
    ├── start-all.sh
    └── setup-wallets.ts
```

### Data Flow

1. **Agent Registration**
   ```
   Agent → Registry API → PostgreSQL
   ```

2. **Agent Discovery**
   ```
   Client → Registry API → Search DB → Return Agents
   ```

3. **Chain Execution**
   ```
   Client → Router → [
     Validate Chain →
     For each step:
       - Resolve input (auto-chain/template/explicit)
       - Process payment
       - Call agent
       - Store result
   ] → Return results
   ```

4. **Payment Flow**
   ```
   Buyer → Create Transaction → Sign with Wallet →
   Submit to Solana → Verify On-Chain → Execute Agent
   ```

---

## Best Practices

### For Agent Developers

1. **Use Standard Schemas** - Maximizes composability
2. **Validate Inputs** - Check all required fields
3. **Handle Errors Gracefully** - Return helpful error messages
4. **Document Capabilities** - Clear descriptions help users
5. **Test Thoroughly** - Verify all capabilities work

### For Chain Builders

1. **Validate First** - Use `validateChain()` before executing
2. **Prefer Auto-Chaining** - Simpler and more maintainable
3. **Use Templates Sparingly** - Only when schemas don't align
4. **Handle Failures** - Chains can fail, plan for it
5. **Monitor Costs** - Track payment totals

### Security

1. **Wallet Security** - Never expose private keys
2. **Payment Verification** - Always verify on-chain
3. **Input Validation** - Sanitize all agent inputs
4. **Rate Limiting** - Protect against abuse
5. **Error Handling** - Don't leak sensitive info

---

## Troubleshooting

### "Agent not found" error

**Problem:** Agent ID doesn't exist in registry  
**Solution:** Check agent is registered: `await registry.searchAgents()`

### "Schema mismatch" warning

**Problem:** Agents use incompatible schemas  
**Solution:** Use template variables to map fields manually

### "Cannot reference step2" error

**Problem:** Template references future step  
**Solution:** Only reference previous steps (step0, step1, etc.)

### "Payment verification failed"

**Problem:** Transaction doesn't match claimed amounts  
**Solution:** Check wallet balance, verify transaction on Solana Explorer

### Chain execution hangs

**Problem:** Agent endpoint unreachable  
**Solution:** Verify agent is running: `curl http://localhost:3100/health`

---

## Examples

See working examples in `demo/agents/` and run tests with:

```bash
node test-hybrid-chain.js
```

---

## Support

- **Documentation:** This guide
- **Issues:** GitHub Issues
- **Examples:** `demo/` directory
- **Tests:** `test-hybrid-chain.js`

---

## Next Steps

1. Build your first agent following [Building Your First Agent](#building-your-first-agent)
2. Experiment with chain execution
3. Deploy to production following [DEPLOYMENT.md](./DEPLOYMENT.md)
4. Join the community and share your agents

Happy building! 🚀

