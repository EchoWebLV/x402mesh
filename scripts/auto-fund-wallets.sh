#!/bin/bash

# Auto-fund devnet wallets script
# Calls Solana faucet API to fund wallets automatically

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  💰 Auto-Funding Devnet Wallets                     ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

WALLETS_DIR=".wallets"

# Check if wallets exist
if [ ! -d "$WALLETS_DIR" ]; then
    echo "❌ Wallets directory not found. Run: npm run setup:wallets"
    exit 1
fi

# Get wallet addresses from keypair files
get_pubkey() {
    local wallet_file=$1
    # Extract public key using solana-keygen
    solana-keygen pubkey "$wallet_file" 2>/dev/null || echo "error"
}

echo "📝 Funding wallets (1 SOL each)..."
echo ""

for wallet_file in "$WALLETS_DIR"/*.json; do
    wallet_name=$(basename "$wallet_file" .json)
    pubkey=$(get_pubkey "$wallet_file")
    
    if [ "$pubkey" = "error" ]; then
        echo "⚠️  Skipping $wallet_name (couldn't get pubkey)"
        continue
    fi
    
    echo "💵 Funding $wallet_name..."
    echo "   Address: $pubkey"
    
    # Try to request airdrop
    result=$(solana airdrop 1 "$pubkey" --url devnet 2>&1 || echo "failed")
    
    if [[ "$result" == *"failed"* ]] || [[ "$result" == *"Error"* ]]; then
        echo "   ⚠️  Airdrop failed (faucet might be rate-limited)"
        echo "   📝 Manual: https://faucet.solana.com/"
        echo "      Paste: $pubkey"
    else
        echo "   ✅ Funded successfully!"
    fi
    
    echo ""
    sleep 2  # Rate limit
done

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  ✅ Funding Complete (or check manually)             ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "📊 Check balances:"
echo "   npm run check:balances"
echo ""

