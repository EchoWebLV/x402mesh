#!/bin/bash

# Check wallet balances

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  💰 Checking Wallet Balances                        ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

WALLETS_DIR=".wallets"

get_pubkey() {
    solana-keygen pubkey "$1" 2>/dev/null || echo "error"
}

for wallet_file in "$WALLETS_DIR"/*.json; do
    wallet_name=$(basename "$wallet_file" .json)
    pubkey=$(get_pubkey "$wallet_file")
    
    if [ "$pubkey" != "error" ]; then
        balance=$(solana balance "$pubkey" --url devnet 2>/dev/null || echo "0 SOL")
        printf "%-20s %s\n" "$wallet_name:" "$balance"
    fi
done

echo ""


