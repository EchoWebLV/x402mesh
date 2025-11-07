# 🔥 How to See REAL Solana Transactions

## Quick Guide to View Your Transactions on Solana Explorer

### Step 1: Fund Your Phantom Wallet with Devnet SOL

1. **Open Phantom Wallet**
2. **Switch to Devnet**:
   - Click Settings → Developer Settings
   - Enable "Testnet Mode"
   - Change network to "Devnet"

3. **Copy Your Wallet Address**
   - Click on your wallet address to copy it

4. **Get Free Devnet SOL**:
   - Visit: https://faucet.solana.com/
   - Paste your wallet address
   - Select "1 SOL"
   - Complete captcha and confirm
   - Wait ~30 seconds for SOL to arrive

### Step 2: Enable Real Transactions in the App

**Option A: Environment Variable (Recommended)**
```bash
# In the project root, create/edit .env file:
echo "REAL_TRANSACTIONS=true" >> .env
```

**Option B: Update Web App Config**
```bash
# In web/.env.local (create if it doesn't exist):
echo "NEXT_PUBLIC_REAL_PAYMENTS=true" >> web/.env.local
```

### Step 3: Restart Services

```bash
# Stop current services (Ctrl+C)

# Restart with real transactions:
npm run start:all

# In another terminal:
npm run web
```

### Step 4: Execute Agent Chain with Real Transactions

1. Open http://localhost:3000
2. Click "Connect" (top right) to connect Phantom
3. Make sure you're on Devnet in Phantom
4. Select a scenario (e.g., "Tech Discussion")
5. Click "🚀 Execute Agent Chain"
6. **Approve the transactions in Phantom** (you'll see 3 prompts)
7. Wait for execution to complete

### Step 5: View on Solana Explorer

After execution:

1. Scroll down to see results
2. Click the blue "🔍 View on Solana Explorer (Devnet)" links
3. Each link will open a new tab showing:
   - ✅ Transaction Status: Success
   - ✅ Block Time
   - ✅ Signature
   - ✅ From/To Addresses
   - ✅ Amount Transferred
   - ✅ Fee Paid

## Alternative: Manual Transaction Verification

If you already executed a chain, you can manually check transactions:

1. Go to https://explorer.solana.com/?cluster=devnet
2. Paste your transaction signature in the search bar
3. Press Enter

## Wallet Addresses for This Project

Your agent wallets (already created):

```
UserWallet: 5fYdvXdd1cERN5a6n6aTUnQ684QYkVZEiUffCA1fUPCr
TranslatorWallet: 9eLnhcUS321fPHns8QTChu1o8aisTBwhSWmxJYu1Q5qc
SummarizerWallet: 8BbcXgqaS2ajJuKPWPtCF1ghaFHX2yKGSHep57ez6JMN
AnalyzerWallet: 7WKDtQnHVnPkxjSudXJw3b2wQbBffJyNa4cX8PMR1caJ
```

## Troubleshooting

### "Transaction not found" on Explorer
- This means simulated mode is still active
- Make sure REAL_TRANSACTIONS=true is set
- Restart services after changing the environment
- Use your Phantom wallet (not the demo wallets)

### "Insufficient funds" error
- Fund your Phantom wallet with devnet SOL
- Need at least 0.1 SOL for fees + agent payments

### Transactions pending forever
- Devnet can be slow sometimes
- Wait up to 2 minutes
- Check Solana status: https://status.solana.com

## What You'll See on Explorer

**Successful Transaction Example:**
```
https://explorer.solana.com/tx/[signature]?cluster=devnet

Status: ✅ Success
Block: #123456789
Fee: 0.000005 SOL
Timestamp: 2025-01-07 20:15:30 UTC

Instructions:
└─ Transfer: 0.01 SOL
   From: [Your Wallet]
   To: [Translator Agent]
```

## Summary

✅ Fund Phantom with devnet SOL
✅ Enable REAL_TRANSACTIONS=true  
✅ Restart services
✅ Execute agent chain
✅ Approve Phantom transactions
✅ Click blue explorer links
✅ See real on-chain transactions!

---

**Need Help?**
- Check backend is running: `curl http://localhost:3002/health`
- Check balance: `solana balance [your-address] --url devnet`
- View logs: Check terminal running `npm run start:all`

