# Demo Quick Reference Guide

**⏱️ 3-Minute Demo Cheat Sheet**

---

## 🎬 Before You Start

### Pre-Recording Checklist
```bash
# 1. Start all services
cd hackathon-demo
./start-demo.sh

# 2. Wait for "All Services Running!" message

# 3. Open these in browser tabs:
- http://localhost:3000 (Web UI)
- https://explorer.solana.com/?cluster=devnet (Solana Explorer)
- GitHub repo page

# 4. Have terminal ready with demo scripts
```

---

## ⏰ Timeline (Exactly 3 Minutes)

### 0:00-0:20 | The Problem
**Screen:** Slide or diagram  
**Say:** "AI agents can't work together. Different formats. No composability. We need infrastructure."

### 0:20-0:45 | Solution Overview
**Screen:** Architecture diagram  
**Say:** "x402mesh: SDK + Router + Hybrid Chains. Build agents in 20 lines. AI-powered composition."

### 0:45-1:30 | Demo 1: Build Agent
**Screen:** Terminal + Code editor  
**File:** `1-simple-agent.ts`

**Actions:**
1. Show the code (20 lines)
2. Run: `npx tsx hackathon-demo/1-simple-agent.ts`
3. Show output: "Agent registered", "HTTP server listening"

**Say:** "20 lines. Define capability, price, execute method. SDK handles everything else - HTTP server, payments, registration, health checks."

### 1:30-2:15 | Demo 2: Hybrid Chaining
**Screen:** Web UI  
**URL:** http://localhost:3000

**Actions:**
1. Show AI chain builder
2. Type: "Generate an orc warrior image without background"
3. Show generated chain (2 steps)
4. Click Execute
5. Show payments updating in real-time
6. Show final result (image with transparent background)

**Say:** "AI builds optimal chain. Auto-chains image agents. Real Solana transactions. Click to see on Explorer."

### 2:15-2:40 | Demo 3: Safety Features
**Screen:** Terminal  
**File:** `3-test-scripts/show-rollback.js`

**Actions:**
1. Run: `node hackathon-demo/3-test-scripts/show-rollback.js`
2. Show chain fail
3. Show automatic rollback
4. Show refunded payments

**Say:** "If any step fails, all payments auto-refunded. Validates before payment. No money lost."

### 2:40-3:00 | Closing
**Screen:** Stats dashboard or GitHub  

**Actions:**
1. Show repository
2. Show key stats

**Say:** "5 working agents. Real Solana devnet. AI-powered. Production ready. The agent economy is here."

---

## 🎯 Key Talking Points

**Must Mention:**
- ✅ "20 lines of code"
- ✅ "Real Solana transactions" (click Explorer link)
- ✅ "AI-powered chain builder"
- ✅ "Automatic rollback"
- ✅ "Hybrid chaining - three approaches"

**Differentiators:**
- Only platform with auto-chaining + templates
- AI chain generation (GPT-4o)
- Production-grade safety
- Multi-modal (text + image)

---

## 🚨 If Things Go Wrong

### Demo Agent Doesn't Start
```bash
# Check logs
tail -f logs/translator.log

# Restart specific agent
npx tsx demo/agents/translator-agent-new.ts
```

### Web UI Not Loading
```bash
# Restart web UI
cd web
npm run dev
```

### Services Not Ready
```bash
# Check health endpoints
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3100/health
```

### Backup Plan
- Use pre-recorded execution from `test-hybrid-chain.js`
- Show screenshots of successful runs
- Show transaction signatures from previous tests

---

## 📝 Sample Narration Script

### Opening (20 seconds)
> "AI agents are everywhere, but they can't work together. Each developer builds agents with different formats. You can't chain a translator with a sentiment analyzer without writing glue code. We built x402mesh to solve this."

### Solution (25 seconds)
> "x402mesh is infrastructure for the agent economy. Three parts: An SDK that lets you build agents in 20 lines. A payment router with real Solana transactions. And a hybrid chain executor that makes agents compose automatically using standard schemas, template variables, or AI assistance."

### Demo 1 (45 seconds)
> "Watch how fast this is. I'll build an agent from scratch. [show code] 20 lines. Define the capability, set the price, implement execute. The SDK handles HTTP server, payment verification, registration, everything. [run it] Boom. Agent is live, discoverable, accepting payments."

### Demo 2 (45 seconds)
> "Now the breakthrough. Five working agents - translator, summarizer, analyzer, image generator, background remover. I can describe what I want: 'generate orc warrior without background.' AI builds the chain using GPT-4o. [execute] Real Solana payments. Every transaction on devnet. Auto-chains the image from generator to background remover. [show result]"

### Demo 3 (25 seconds)
> "Safety built in. If any step fails, all payments auto-refund. Watch. [run rollback demo] Step failed. Router detected it. Refunded all previous payments. Validates before payment too. No money lost."

### Closing (20 seconds)
> "Production ready. Five agents. Real devnet. AI-powered. Open source. The infrastructure for the agent economy is here. Let's build it together."

---

## 🎥 Camera Positions

1. **Code view** - Full screen of editor for agent creation
2. **Browser full** - Web UI during chain execution
3. **Terminal** - For test scripts (rollback, validation)
4. **Split screen** - Code + terminal when running agent
5. **Close-up** - Transaction signatures, Explorer links

---

## 💡 Pro Tips

### Energy
- Fast-paced delivery
- Enthusiastic but not rushed
- Emphasize "boom", "instantly", "automatically"

### Visuals
- More showing, less talking
- Let the code speak
- Highlight real transactions

### Time Management
- Practice with timer
- Have 2:50 version ready (10-second buffer)
- Know what to cut if running long

---

## 🏆 Competition Highlights

**For Judges:**

**Innovation:** 
- First hybrid auto-chaining
- AI chain generation
- Multi-modal support

**Technical Excellence:**
- Real on-chain verification
- Full TypeScript SDK
- 5 working agents
- Test coverage

**Impact:**
- Solves composability
- Enables agent economy
- Developer friendly

**x402 Integration:**
- Full HTTP 402
- Solana native
- Multi-agent payments

---

## 📊 Backup Statistics

**In case you need numbers:**
- 5 working demo agents
- 3 chaining approaches
- 2-5 second payment confirmation
- 20 lines of code to build agent
- 5/5 tests passing
- 0 dependencies on centralized services
- 100% open source

---

## ✅ Final Pre-Flight Check

- [ ] All services running
- [ ] Web UI loads
- [ ] Can execute a test chain manually
- [ ] Browser tabs ready
- [ ] Terminal positioned correctly
- [ ] Volume check
- [ ] Screen recording software ready
- [ ] Backup plan prepared

---

**You got this! 🚀**

*Remember: You're not just demoing code - you're showing the future of autonomous agents.*

