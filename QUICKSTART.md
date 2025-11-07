# ⚡ Quick Start - 30 Seconds

Get the Agent-to-Agent Payment Router running in under a minute.

## 1. Install & Build (20 seconds)

```bash
git clone https://github.com/yourusername/agent-2-agent-infra.git
cd agent-2-agent-infra
npm install && npm run build:core
```

## 2. Start Everything (5 seconds)

**Terminal 1** - Backend:
```bash
npm run start:all
```

Wait for: `✅ All services started!`

**Terminal 2** - Web UI:
```bash
npm run web
```

## 3. Use It! (5 seconds)

1. Open **http://localhost:3000**
2. Click **"Connect Wallet"** (Phantom)
3. Click **"Execute Agent Chain"**
4. Watch the magic! ✨

---

## That's It! 🎉

You just:
- ✅ Started 5 services (Registry, Router, 3 Agents)
- ✅ Launched a beautiful web UI
- ✅ Executed an agent chain with payments
- ✅ Saw real-time collaboration

---

## What's Running?

| Service | Port | What It Does |
|---------|------|--------------|
| Registry | 3001 | Agent discovery |
| Router | 3002 | Payment processing |
| Translator | 3100 | Spanish/French/German translation |
| Summarizer | 3101 | Text summarization |
| Analyzer | 3102 | Sentiment analysis |
| Web UI | 3000 | Visual interface |

---

## Next Steps

### See CLI Demo
```bash
npm run demo:chain
```

### Try Real Solana Transactions
```bash
npm run setup:wallets
npm run demo:real
```

### Read Full Docs
- [Complete Setup Guide](./SETUP.md)
- [Getting Started Tutorial](./docs/GETTING_STARTED.md)
- [API Documentation](./docs/API.md)

---

## Troubleshooting

**Port already in use?**
```bash
lsof -ti:3001 | xargs kill -9
npm run start:all
```

**Web UI won't connect?**
- Make sure backend is running (`npm run start:all`)
- Check http://localhost:3001/health
- Refresh browser

**Need help?**
- [GitHub Issues](https://github.com/yourusername/agent-2-agent-infra/issues)
- [Full Documentation](./docs/)

---

**Built for Solana x402 Hackathon** • MIT License
