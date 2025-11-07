# 🚀 DEPLOYMENT GUIDE

This guide covers both devnet (for testing) and mainnet (for production) deployment.

---

## ⚡ Quick Devnet Deployment (Hackathon)

```bash
# 1. Setup
npm run setup:real

# 2. Fund wallets
npm run fund:wallets
# OR manually: https://faucet.solana.com/

# 3. Run demo
npm run demo:chain
```

**Use this for your hackathon demo!**

---

## 🚨 MAINNET DEPLOYMENT GUIDE

## ⚠️ CRITICAL WARNINGS

### **MAINNET = REAL MONEY**

- 💰 **Real SOL** - Costs ~$20-30 per SOL
- 💵 **Real USDC** - Actual USD value
- 🔒 **Irreversible** - Transactions cannot be undone
- 💸 **Gas Fees** - Every transaction costs real money
- 🎯 **Production** - Users depend on this

**DO NOT** deploy to mainnet unless you:
- ✅ Tested extensively on devnet
- ✅ Understand the costs
- ✅ Have security measures in place
- ✅ Are ready for production use

---

## 🎯 Mainnet vs Devnet

| Feature | Devnet | Mainnet |
|---------|--------|---------|
| **SOL** | FREE (faucet) | $20-30 each |
| **USDC** | Test tokens (fake) | REAL USD |
| **Transactions** | Reversible (can restart) | IRREVERSIBLE |
| **Gas Fees** | FREE | ~$0.0001 per tx |
| **Purpose** | Testing | Production |
| **Risk** | Zero | HIGH |

---

## 📋 Pre-Deployment Checklist

### 1. Testing
- [ ] All features tested on devnet
- [ ] Load testing completed
- [ ] Error handling verified
- [ ] Edge cases covered
- [ ] Security audit done

### 2. Security
- [ ] Replace file-based wallets with secure key management
- [ ] Set up rate limiting
- [ ] Add API authentication
- [ ] Enable CORS restrictions
- [ ] Review all code for vulnerabilities
- [ ] Set up monitoring and alerts

### 3. Legal & Compliance
- [ ] Terms of Service written
- [ ] Privacy Policy created
- [ ] KYC/AML compliance (if required)
- [ ] Business entity registered
- [ ] Insurance obtained (if handling large amounts)

### 4. Operations
- [ ] Monitoring dashboards set up
- [ ] Alert system configured
- [ ] Backup strategy in place
- [ ] Incident response plan ready
- [ ] Customer support system set up
- [ ] Documentation complete

### 5. Financial
- [ ] Budget for gas fees ($5-50/month)
- [ ] RPC provider selected and paid ($0-100/month)
- [ ] OpenAI credits funded (if using AI)
- [ ] Emergency fund for issues

---

## 💰 Cost Breakdown

### Initial Setup Costs:
```
SOL for gas: ~0.1 SOL × 4 wallets = 0.4 SOL (~$10)
USDC for testing: $10-100
RPC provider setup: $0-50
Total: ~$20-160
```

### Monthly Operating Costs:
```
Gas fees: ~$5-50 (depends on usage)
RPC provider: $0-100 (depends on tier)
OpenAI: ~$1-50 (depends on usage)
Monitoring: $0-100 (optional)
Total: ~$6-300/month
```

### Revenue (if charging users):
```
Translator: $0.01 per request
Summarizer: $0.02 per request
Analyzer: $0.015 per request

100 requests/day = ~$4.50/day = $135/month
1000 requests/day = ~$45/day = $1,350/month
```

---

## 🔐 Secure Wallet Management

### ⚠️ NEVER use file-based keypairs on mainnet!

### Recommended Solutions:

**1. Hardware Wallet (Best for small projects)**
- Ledger or Trezor
- Manual signing required
- Very secure
- Free after hardware purchase

**2. MPC Wallet (Best for production)**
- Fireblocks
- Coinbase Prime
- Qredo
- No single point of failure
- Automated signing
- $500-5000/month

**3. Cloud KMS (Good middle ground)**
- AWS KMS
- Google Cloud KMS
- HashiCorp Vault
- Automated signing
- ~$1-10/month

**4. Environment Variables (MINIMUM security)**
- Not recommended for production
- Use only for testing mainnet
- Better than file-based, but still risky

### Migration from File-Based:

```typescript
// DON'T DO THIS ON MAINNET:
const keypair = Keypair.fromSecretKey(
  new Uint8Array(JSON.parse(fs.readFileSync('wallet.json')))
);

// DO THIS INSTEAD:
import { getKeypairFromEnvironment } from '@solana-developers/helpers';
const keypair = getKeypairFromEnvironment('WALLET_PRIVATE_KEY');

// OR BETTER: Use hardware wallet or MPC
```

---

## 🚀 Deployment Steps

### Step 1: Prepare Configuration

```bash
# Copy mainnet config
cp .env.mainnet .env

# Edit .env and configure:
# - SOLANA_NETWORK=mainnet-beta
# - SOLANA_RPC_URL=<your-paid-rpc>
# - Add your mainnet wallet keys (securely!)
# - Set USDC_MINT_ADDRESS to mainnet USDC
```

### Step 2: Get Real USDC

**Official Mainnet USDC:**
```
Mint: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

**How to get USDC:**
1. Buy on Coinbase/Binance
2. Withdraw to Solana address
3. Or swap SOL → USDC on Jupiter/Raydium

### Step 3: Fund Mainnet Wallets

```bash
# You need SOL in each wallet:
# - 0.1 SOL minimum per wallet
# - 0.5 SOL recommended per wallet

# Buy SOL on:
# - Coinbase
# - Binance
# - FTX
# - Phantom wallet (built-in)
```

### Step 4: Deploy Services

```bash
# Build production
npm run build

# Deploy to your server
# Use PM2, Docker, or cloud provider

# With PM2:
pm2 start packages/registry/dist/index.js --name registry
pm2 start packages/router/dist/index.js --name router
pm2 start demo/agents/translator-agent.js --name translator
pm2 start demo/agents/summarizer-agent.js --name summarizer
pm2 start demo/agents/analyzer-agent.js --name analyzer

# Save PM2 config
pm2 save
pm2 startup
```

### Step 5: Deploy Web UI

```bash
# Build web UI
cd web
npm run build

# Deploy to Vercel/Netlify/your host
# Set environment variables:
# - NEXT_PUBLIC_API_URL=https://your-api-domain.com
# - NEXT_PUBLIC_REGISTRY_URL=https://your-registry-domain.com
```

### Step 6: Test with Small Amounts

```bash
# Send 1 small transaction
# Verify on Solana Explorer
# Check all systems working
# Then gradually increase
```

---

## 🔧 Production Configuration

### Recommended RPC Providers:

**Helius (Best for production)**
- URL: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
- Free tier: 100k requests/month
- Paid: $50-500/month
- Features: Webhooks, analytics

**Alchemy**
- URL: `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`
- Free tier: Limited
- Paid: $49-499/month
- Features: Monitoring, alerts

**QuickNode**
- URL: Custom endpoint
- Paid only: $49-999/month
- Features: High performance, dedicated

**Ankr (Budget option)**
- URL: `https://rpc.ankr.com/solana/YOUR_KEY`
- Free tier: Available
- Paid: $25-250/month

### Security Settings:

```env
# Production .env
CORS_ORIGINS=https://yourdomain.com
RATE_LIMIT=30
API_SECRET=<strong-random-string>
LOG_LEVEL=info
VERBOSE_TRANSACTIONS=false
ENABLE_MONITORING=true
```

---

## 📊 Monitoring & Alerts

### Set Up Monitoring:

**1. Sentry (Error Tracking)**
```bash
npm install @sentry/node
# Add SENTRY_DSN to .env
```

**2. Datadog (Performance)**
```bash
# Add DATADOG_API_KEY to .env
# Track response times, errors, usage
```

**3. Custom Alerts**
```typescript
// Alert on errors
if (error) {
  await fetch(process.env.ALERT_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({ error, timestamp: new Date() })
  });
}
```

### What to Monitor:

- ✅ Transaction success rate
- ✅ API response times
- ✅ Wallet balances (alert if low)
- ✅ Error rates
- ✅ Usage patterns
- ✅ Cost per transaction
- ✅ RPC response times

---

## 💸 Cost Optimization

### Reduce Gas Fees:
- Batch transactions when possible
- Use compute budget optimization
- Cache frequently accessed data

### Reduce RPC Costs:
- Use free tier for development
- Cache blockchain data
- Only query when necessary
- Use websockets instead of polling

### Reduce OpenAI Costs:
- Cache common summaries
- Use smaller models (gpt-3.5-turbo)
- Set max_tokens limits
- Fallback to local algorithms

---

## 🆘 Incident Response

### If Something Goes Wrong:

**1. Immediate Actions:**
```bash
# Stop all services
pm2 stop all

# Check wallet balances
solana balance <wallet-address> --url mainnet-beta

# Review recent transactions
# Check Solana Explorer
```

**2. Common Issues:**

**Insufficient Funds:**
- Top up SOL immediately
- Set up balance alerts

**High Error Rate:**
- Check RPC provider status
- Switch to backup RPC
- Review error logs

**Security Breach:**
- Rotate all keys immediately
- Transfer funds to new wallets
- Notify users if needed
- File incident report

**3. Recovery:**
- Fix the issue
- Test on devnet
- Gradually restart services
- Monitor closely

---

## 📝 Mainnet Launch Checklist

### Week Before Launch:
- [ ] Final security audit
- [ ] Load testing at expected scale
- [ ] Backup systems tested
- [ ] Monitoring dashboards ready
- [ ] Team briefed on procedures

### Launch Day:
- [ ] Deploy to production
- [ ] Small test transactions
- [ ] Monitor for 1 hour
- [ ] Gradually increase usage
- [ ] Team on standby

### Week After Launch:
- [ ] Daily monitoring
- [ ] User feedback collected
- [ ] Performance metrics reviewed
- [ ] Costs tracked
- [ ] Issues documented

---

## 🎓 Best Practices

### DO:
- ✅ Test everything on devnet first
- ✅ Start with small amounts
- ✅ Use paid RPC providers
- ✅ Set up monitoring
- ✅ Have emergency procedures
- ✅ Keep backups
- ✅ Document everything

### DON'T:
- ❌ Use file-based wallets
- ❌ Skip testing
- ❌ Ignore errors
- ❌ Deploy without monitoring
- ❌ Handle users' private keys
- ❌ Store sensitive data in code
- ❌ Forget to set rate limits

---

## 📞 Support Resources

**Solana:**
- Docs: https://docs.solana.com/
- Discord: https://discord.gg/solana

**RPC Providers:**
- Helius: support@helius.dev
- Alchemy: support@alchemy.com
- QuickNode: support@quicknode.com

**Security:**
- Solana Security: https://github.com/solana-labs/security-audits
- Smart Contract Auditors: Trail of Bits, Certik, etc.

---

## 🚨 FINAL WARNING

**Mainnet deployment is serious business.**

You are handling:
- Real user funds
- Real money
- Real transactions
- Real responsibility

**Only deploy when you're truly ready.**

---

## ✅ Quick Commands (Mainnet)

```bash
# Check balance
solana balance <address> --url mainnet-beta

# Send SOL
solana transfer <to-address> <amount> --url mainnet-beta

# Check transaction
solana confirm <signature> --url mainnet-beta

# View account
solana account <address> --url mainnet-beta
```

---

**Built for Solana x402 Hackathon**  
**⚠️ Use mainnet at your own risk**  
**November 2025**

