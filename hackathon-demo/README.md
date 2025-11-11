# Hackathon Demo Materials

**Everything you need for the 3-minute demo video**

---

## 📁 Folder Structure

```
hackathon-demo/
├── README.md                          # This file
├── 1-simple-agent.ts                  # Demo 1: Build agent in 20 lines
├── 2-chain-examples/                  # Demo 2: Hybrid chaining examples
│   ├── auto-chaining.json            # Schema-based auto-chaining
│   ├── template-variables.json       # Template {{step0.field}}
│   ├── explicit-input.json           # Manual input override
│   ├── ai-generated.json             # AI chain builder output
│   └── multi-modal.json              # Text + Image chain
├── 3-test-scripts/                    # Scripts to run during demo
│   ├── execute-auto-chain.js         # Test auto-chaining
│   ├── execute-template-chain.js     # Test templates
│   ├── show-rollback.js              # Demonstrate rollback
│   └── validate-chain.js             # Show validation
├── 4-sample-data/                     # Input data for demos
│   ├── translation-text.txt
│   ├── long-article.txt
│   └── image-prompts.txt
└── start-demo.sh                      # Launch all services
```

---

## 🚀 Quick Start

### 1. Start All Services
```bash
cd hackathon-demo
./start-demo.sh
```

This launches:
- Registry (port 3001)
- Router (port 3002)
- All 5 agents (ports 3100-3104)
- Web UI (port 3000)

### 2. Run Demo Scripts

**Demo 1: Simple Agent**
```bash
npx tsx 1-simple-agent.ts
```

**Demo 2: Auto-Chaining**
```bash
node 3-test-scripts/execute-auto-chain.js
```

**Demo 3: Template Variables**
```bash
node 3-test-scripts/execute-template-chain.js
```

**Demo 4: Rollback**
```bash
node 3-test-scripts/show-rollback.js
```

**Demo 5: Validation**
```bash
node 3-test-scripts/validate-chain.js
```

---

## 🎬 Demo Sequence

### Timing: 3 Minutes

| Time | Action | File |
|------|--------|------|
| 0:45-1:30 | Build simple agent | `1-simple-agent.ts` |
| 1:30-1:50 | Show AI chain builder | Web UI |
| 1:50-2:05 | Execute multi-modal chain | `2-chain-examples/multi-modal.json` |
| 2:05-2:20 | Show real transactions | Solana Explorer |
| 2:20-2:35 | Demonstrate rollback | `3-test-scripts/show-rollback.js` |
| 2:35-2:50 | Show validation | `3-test-scripts/validate-chain.js` |

---

## 📝 Notes

- All chain examples are ready to copy-paste into the web UI
- Test scripts include colored output for better visibility
- Sample data files contain realistic test content
- Transactions are real Solana devnet transfers

---

## 🎯 Key Points to Highlight

1. **20-line agent** - Show how simple it is
2. **AI chain builder** - Unique feature
3. **Real payments** - Click Explorer links
4. **Automatic rollback** - Show safety mechanism
5. **Pre-validation** - Catch errors before payment

---

Good luck! 🚀

