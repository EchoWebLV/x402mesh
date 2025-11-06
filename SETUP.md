# 🚀 Setup Instructions

## Quick Start (2 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Run the demo
npm run demo:chain
```

That's it! You'll see 3 AI agents communicating and paying each other in real-time.

## What's Happening?

The demo script automatically:
1. ✅ Starts the Agent Registry (port 3001)
2. ✅ Starts the Payment Router (port 3002)
3. ✅ Launches 3 demo agents:
   - 🌍 Translator Agent (port 3100)
   - 📝 Summarizer Agent (port 3101)
   - 🔍 Analyzer Agent (port 3102)
4. ✅ Runs 3 different scenarios showing agent interactions
5. ✅ Displays payment tracking and statistics

## Expected Output

You should see colorful console output showing:

```
╔═══════════════════════════════════════════════════════╗
║   🤖 AGENT CHAIN DEMO - Real-time Conversation      ║
╚═══════════════════════════════════════════════════════╝

⚙️  Starting services...
✅ All services ready!

📝 SCENARIO 1: Tech Discussion
══════════════════════════════════════════════════════

💬 Original Message:
   "Artificial intelligence is revolutionizing blockchain..."

🔄 Executing Agent Chain:
   1. 🌍 Translator → Translate to spanish
   2. 📝 Summarizer → Create bullet points
   3. 🔍 Analyzer → Analyze sentiment

📊 RESULTS:
...
```

## Manual Setup (For Development)

If you want to run services separately:

### Terminal 1: Registry
```bash
npm run dev -w @a2a/registry
```

### Terminal 2: Router
```bash
npm run dev -w @a2a/router
```

### Terminal 3: Translator Agent
```bash
npx tsx demo/agents/translator-agent.ts
```

### Terminal 4: Summarizer Agent
```bash
npx tsx demo/agents/summarizer-agent.ts
```

### Terminal 5: Analyzer Agent
```bash
npx tsx demo/agents/analyzer-agent.ts
```

### Terminal 6: Test Interactions
```bash
# Check registered agents
curl http://localhost:3001/agents

# Test a payment
curl -X POST http://localhost:3002/payments/process \
  -H "Content-Type: application/json" \
  -d '{
    "from": "wallet1",
    "to": "wallet2",
    "amount": 0.01,
    "currency": "USDC",
    "serviceId": "test"
  }'
```

## Troubleshooting

### Port Already in Use

If you see "Port already in use" errors:

```bash
# Find and kill processes on ports 3001-3102
lsof -ti:3001 | xargs kill
lsof -ti:3002 | xargs kill
lsof -ti:3100 | xargs kill
lsof -ti:3101 | xargs kill
lsof -ti:3102 | xargs kill
```

### Dependencies Not Installing

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

### Demo Not Running

Make sure you've built the project first:

```bash
npm run build
npm run demo:chain
```

## System Requirements

- **Node.js**: 18.0 or higher
- **npm**: 8.0 or higher
- **RAM**: 2GB minimum
- **OS**: macOS, Linux, or Windows (WSL recommended)

## Verification

After setup, verify everything works:

```bash
# Check registry
curl http://localhost:3001/health
# Should return: {"status":"healthy","service":"agent-registry"}

# Check router
curl http://localhost:3002/health
# Should return: {"status":"healthy","service":"payment-router"}

# Check agents
curl http://localhost:3100/health
curl http://localhost:3101/health
curl http://localhost:3102/health
```

## Next Steps

1. 📖 Read the [Getting Started Guide](docs/GETTING_STARTED.md)
2. 🔍 Explore the [API Documentation](docs/API.md)
3. 🛠️ Build your own agent using the SDK
4. 🎯 Check the [Hackathon Checklist](docs/HACKATHON_CHECKLIST.md)

## Production Deployment

For production use:

1. Set environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

2. Use a process manager:
```bash
npm install -g pm2
pm2 start packages/registry/dist/index.js --name registry
pm2 start packages/router/dist/index.js --name router
```

3. Deploy to cloud (Vercel, Railway, AWS, etc.)

## Need Help?

- 📚 Check the [README](README.md)
- 🐛 Open an issue on GitHub
- 💬 Join our Discord (if available)
- 📧 Email support (if available)

## Development Mode

For hot reloading during development:

```bash
# Start all services in dev mode
npm run dev
```

This uses `tsx watch` to automatically restart services when code changes.

---

**Happy Hacking! 🚀**

