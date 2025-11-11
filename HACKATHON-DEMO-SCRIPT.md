# x402mesh - 3-Minute Hackathon Demo Script

**Solana x402 Hackathon Submission**  
**Track:** Best x402 Dev Tool / Best x402 Agent Application  
**Team:** [Your Name]

---

## 🎬 Demo Video Script (3 Minutes)

### Opening (0:00 - 0:20) - The Problem

**[Screen: Show fragmented AI agent landscape]**

> "AI agents are everywhere, but they can't work together. Why? Because each developer builds agents with different input/output formats. It's like trying to plug a USB-C device into a USB-A port - they just don't fit."

**[Show diagram of incompatible agents]**

> "We need infrastructure that makes agents truly composable while handling payments automatically. That's why we built x402mesh."

---

### Solution Overview (0:20 - 0:45) - What is x402mesh?

**[Screen: Show architecture diagram]**

> "x402mesh is the missing infrastructure for the agent economy. It's three things:"

**[Highlight each component]**

> "ONE: An SDK that lets you build payment-enabled agents in 20 lines of code.  
> TWO: A payment router that handles x402 protocol with real Solana transactions.  
> THREE: A hybrid chain executor that makes agents compose automatically - no manual glue code needed."

**[Show quick code snippet]**

```typescript
class TranslatorAgent extends Agent {
  async execute(capability, input) {
    return { text: await translate(input.text) };
  }
}
await agent.start(); // That's it! Payments, registration, HTTP 402 - all handled.
```

---

### Live Demo Part 1 (0:45 - 1:30) - Building an Agent

**[Screen: Terminal with code editor]**

> "Let me show you how fast this is. I'll build an agent from scratch."

**[Type/show pre-written code quickly]**

```typescript
import { Agent } from 'x402mesh-sdk';

class MyAgent extends Agent {
  constructor() {
    super({
      name: 'Sentiment Analyzer',
      capabilities: [{
        name: 'analyze',
        schema: 'analysis_v1',  // Standard schema
        pricing: { amount: 0.01, currency: 'SOL' }
      }],
      walletAddress: 'YOUR_WALLET'
    });
  }

  async execute(capability, input) {
    return { 
      sentiment: 'positive',
      confidence: 0.95
    };
  }
}

await new MyAgent().start();
```

**[Terminal output shows]**

```
✅ Agent registered with Registry
✅ HTTP server listening on port 3100
✅ Heartbeat monitoring started
```

> "20 lines of code. The SDK automatically handles HTTP server setup, x402 payment verification, registry registration, health checks, and heartbeat monitoring. Your agent is now live and discoverable."

---

### Live Demo Part 2 (1:30 - 2:15) - The Breakthrough: Hybrid Chaining

**[Screen: Switch to web UI]**

> "Here's where it gets interesting. We have five working agents - translator, summarizer, analyzer, image generator, and background remover."

**[Show web UI with agents listed]**

> "Traditional agent platforms make you manually map fields between agents. We solved this with THREE approaches:"

**[Show AI chain builder]**

> "APPROACH ONE: Just describe what you want. Our GPT-4o powered builder analyzes available agents and generates the optimal chain with code."

**[Type in UI]** `"Generate an orc warrior image without background"`

**[AI generates chain instantly]**

```typescript
chain: [
  { agentId: 'image-generator', capability: 'generate_image', 
    input: { prompt: 'fantasy orc warrior', style: 'realistic' } },
  { agentId: 'background-remover', capability: 'remove_background' }
  // ✨ No input needed - auto-chains using image_processing_v1 schema
]
```

**[Click Execute button]**

> "APPROACH TWO: Auto-chaining. Agents declare standard schemas. If schemas are compatible - text_processing_v1 to text_processing_v1 - they chain automatically."

**[Show execution in real-time]**

> "APPROACH THREE: Template variables. For precise control, use {{step0.field}} to extract exact fields."

**[Show payment tracking panel updating]**

```
Step 1: Image Generator     ✅ 0.01 SOL - Tx: 4xHmBH...
Step 2: Background Remover  ✅ 0.008 SOL - Tx: 5Bz37j...
```

**[Show final result - orc image with transparent background]**

---

### Key Features (2:15 - 2:40) - What Makes This Special

**[Screen: Split screen - code + Solana Explorer]**

> "Every payment is a REAL Solana transaction. No simulations. Click any transaction - you'll see it verified on Solana devnet."

**[Click Explorer link, show confirmed transaction]**

> "But here's the safety net: If any step fails, ALL previous payments are automatically refunded. Watch this."

**[Show rollback demo - stop agent mid-chain]**

```
⚠️  Step 3 failed: Agent offline
🔄 Initiating rollback...
✅ Refunded 0.01 SOL to wallet
✅ Refunded 0.008 SOL to wallet
```

> "The platform also validates chains BEFORE payment. If your template references a future step, or an agent is offline, you'll know before spending a single lamport."

**[Show validation error]**

```javascript
validation: {
  valid: false,
  errors: [{ 
    step: 1, 
    type: 'invalid_template',
    message: 'Cannot reference step2 from step1' 
  }]
}
```

---

### Closing (2:40 - 3:00) - Impact & Next Steps

**[Screen: Show stats dashboard]**

> "In two weeks, we built a complete production-ready platform:"

**[Highlight metrics]**

- ✅ 5 working agents (text + image processing)
- ✅ Real Solana devnet integration
- ✅ AI-powered chain builder
- ✅ Automatic rollback on failure
- ✅ 5/5 tests passing
- ✅ Full TypeScript SDK published

**[Show final screen with links]**

> "x402mesh makes the agent economy real. Developers can build agents in minutes, not weeks. Agents can transact autonomously with real payments. And users can chain agents together without writing code."

**[Show repository]**

```
GitHub: github.com/yordanlasonov/agent-2-agent-infra
Live Demo: [your-demo-url]
NPM: npm install x402mesh-sdk
```

> "The infrastructure for the agent economy is here. Let's build it together."

**[Fade to black with project logo]**

---

## 📋 Pre-Demo Checklist

### Before Recording:

- [ ] All 5 agents running (ports 3100-3104)
- [ ] Registry running (port 3001)
- [ ] Router running (port 3002)
- [ ] Web UI running (port 3000)
- [ ] Wallet funded with devnet SOL
- [ ] OpenAI API key configured (for AI chain builder)
- [ ] Browser tabs ready:
  - Web UI (localhost:3000)
  - Solana Explorer (devnet)
  - GitHub repository
  - Terminal with code

### Recording Tips:

1. **Practice timing** - Script is exactly 3 minutes
2. **Show, don't tell** - More screen capture, less talking
3. **Highlight transactions** - Show real Solana Explorer links
4. **Demonstrate uniqueness** - Focus on hybrid chaining + AI builder
5. **Keep energy high** - Fast-paced, enthusiastic delivery

---

## 🎯 Key Talking Points

### For Judges:

**Innovation:**
- First platform with hybrid auto-chaining + templates
- AI-powered chain generation (GPT-4o)
- Production-grade safety (rollback, validation)

**Technical Excellence:**
- Real on-chain payment verification
- Full TypeScript SDK
- 5 working demo agents
- Comprehensive test coverage

**Impact:**
- Solves agent composability crisis
- Enables autonomous agent economy
- Developer-friendly (20 lines of code)

**x402 Integration:**
- Full HTTP 402 implementation
- Solana native (SOL + USDC)
- Payment routing and verification
- Multi-agent payment coordination

---

## 📊 Demo Flow Breakdown

| Time | Section | Screen | Key Message |
|------|---------|--------|-------------|
| 0:00-0:20 | Problem | Diagram | Agents can't work together |
| 0:20-0:45 | Solution | Architecture | x402mesh = SDK + Router + Chains |
| 0:45-1:30 | Demo 1 | Code Editor | Build agent in 20 lines |
| 1:30-2:15 | Demo 2 | Web UI | Hybrid chaining in action |
| 2:15-2:40 | Features | Explorer | Real payments + Rollback |
| 2:40-3:00 | Close | Stats/Links | Production ready, let's build |

---

## 🎥 B-Roll Ideas (Visual Backup)

If you need to fill time or show transitions:

1. **Code scrolling** - Show SDK source code
2. **Network diagram** - Agents communicating
3. **Transaction animation** - SOL flowing between wallets
4. **Terminal output** - Service startup logs
5. **Test execution** - All 5 tests passing

---

## 🏆 Competition Strategy

### Best Track Fit:

**Primary:** Best x402 Dev Tool
- Complete SDK for building agents
- Payment routing infrastructure
- Developer-friendly API

**Secondary:** Best x402 Agent Application  
- 5 working multi-modal agents
- AI-powered chain builder
- Real-world use cases

### Differentiators:

1. **Only platform with hybrid chaining** (auto + templates + explicit)
2. **AI-powered chain generation** (GPT-4o integration)
3. **Production-grade safety** (rollback, validation, health checks)
4. **Multi-modal** (text + image processing)
5. **Real payments** (actual Solana transactions, not simulated)

---

## 📝 Alternative Demo Scripts

### Version A: Developer-Focused (Code Heavy)

*Focus on SDK, show multiple agent creation, emphasize ease of development*

### Version B: User-Focused (UI Heavy)

*Focus on web UI, AI chain builder, visual demonstrations*

### Version C: Technical Deep-Dive

*Focus on architecture, payment verification, rollback mechanism*

**Recommended:** Version B (UI Heavy) - Most impressive visually for 3 minutes

---

## 🎤 Backup Talking Points

If demo fails or you need to ad-lib:

- "Even if the live demo fails, our test suite proves it works - 5/5 tests passing"
- "Every transaction is verifiable on Solana Explorer - here are real transaction signatures"
- "Our SDK is already published on NPM and ready for developers to use"
- "The code is 100% open source - you can run this locally right now"

---

## ✅ Final Checklist

Before submitting:

- [ ] Video recorded (under 3 minutes)
- [ ] Shows real Solana transactions
- [ ] Demonstrates unique features (hybrid chaining, AI builder, rollback)
- [ ] Includes GitHub link
- [ ] Shows live demo (not just slides)
- [ ] Highlights x402 protocol integration
- [ ] Code is open sourced
- [ ] README updated
- [ ] Documentation complete

---

**Good luck! 🚀**

*Remember: You're not just showing a project - you're demonstrating the future of the agent economy.*

